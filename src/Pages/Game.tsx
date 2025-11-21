import { useEffect, useRef, useState } from "react";
import * as rawData from "./dunData.json";

const dumData = rawData;

const getSrc = (file: string) => {
  if (!file) return "";
  if (typeof file === "string") return file;
  return URL.createObjectURL(file);
};

function Game() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [score, setScore] = useState(0);
  const [highScore, setHighScore] = useState(0);
  const [gameState, setGameState] = useState<"START" | "PLAYING" | "GAMEOVER">(
    "START",
  );

  const assets = useRef<{
    bird: HTMLImageElement[];
    birdDeath: HTMLImageElement | null;
    pipe: HTMLImageElement | null;
    bg: HTMLImageElement | null;
    base: HTMLImageElement | null;
    audio: {
      flap: HTMLAudioElement | null;
      death: HTMLAudioElement | null;
      point: HTMLAudioElement | null;
      bgMusic: HTMLAudioElement | null;
    };
  }>({
    bird: [],
    birdDeath: null,
    pipe: null,
    bg: null,
    base: null,
    audio: { flap: null, death: null, point: null, bgMusic: null },
  });

  const physics = useRef({
    birdY: 300,
    birdVelocity: 1,
    birdRotation: 0,
    pipes: [] as { x: number; y: number; passed: boolean }[],
    baseX: 0,
    lastPipeTime: 0,
    gameTime: 0,
    frame: 0,
    gravity: 0.25,
    jumpStrength: -5.5,
    pipeSpeed: 2.5,
    pipeSpawnRate: 180,
    pipeGap: 170,
  });

  useEffect(() => {
    const loadImages = async () => {
      const loadImage = (src: any): Promise<HTMLImageElement> => {
        return new Promise((resolve) => {
          const img = new Image();
          img.src = getSrc(src);
          img.onload = () => resolve(img);
          img.onerror = () => resolve(img);
        });
      };

      if (dumData.birdSprite.normal) {
        assets.current.bird = await Promise.all(
          dumData.birdSprite.normal.map((f) => loadImage(f)),
        );
      }
      assets.current.birdDeath = dumData.birdSprite.death
        ? await loadImage(dumData.birdSprite.death)
        : null;
      assets.current.pipe = dumData.pipeSprite.sprite
        ? await loadImage(dumData.pipeSprite.sprite)
        : null;
      assets.current.bg = dumData.bg.bgImg.sprite
        ? await loadImage(dumData.bg.bgImg.sprite)
        : null;
      assets.current.base = dumData.bg.baseImg.sprite
        ? await loadImage(dumData.bg.baseImg.sprite)
        : null;

      if (dumData.sounds.flap)
        assets.current.audio.flap = new Audio(getSrc(dumData.sounds.flap));
      if (dumData.sounds.death)
        assets.current.audio.death = new Audio(getSrc(dumData.sounds.death));
      if (dumData.sounds.point)
        assets.current.audio.point = new Audio(getSrc(dumData.sounds.point));
      if (dumData.sounds.bgMusic?.file) {
        const bgm = new Audio(getSrc(dumData.sounds.bgMusic.file));
        bgm.volume = dumData.sounds.bgMusic.volume || 0.5;
        bgm.loop = true;
        assets.current.audio.bgMusic = bgm;
      }
    };

    loadImages();
  }, []);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    let animationFrameId: number;

    const resizeCanvas = () => {
      const parent = canvas.parentElement;
      if (parent) {
        canvas.width = parent.clientWidth;
        canvas.height = parent.clientHeight;
      }
    };
    resizeCanvas();
    window.addEventListener("resize", resizeCanvas);

    const playSound = (type: "flap" | "death" | "point") => {
      const sound = assets.current.audio[type];
      if (sound) {
        sound.currentTime = 0;
        sound.play().catch(() => {});
      }
    };

    const drawBackground = (
      img: HTMLImageElement | null,
      type: "Stretch" | "Cover",
      yOffset = 0,
      heightOverride = 0,
    ) => {
      if (!img) {
        ctx.fillStyle = "#70c5ce";
        ctx.fillRect(0, yOffset, canvas.width, heightOverride || canvas.height);
        return;
      }

      const h = heightOverride || canvas.height;
      if (type === "Cover") {
        const scale = Math.max(canvas.width / img.width, h / img.height);
        const x = canvas.width / 2 - (img.width * scale) / 2;
        const y = h / 2 - (img.height * scale) / 2 + yOffset;
        ctx.drawImage(img, x, y, img.width * scale, img.height * scale);
      } else {
        ctx.drawImage(img, 0, yOffset, canvas.width, h);
      }
    };

    const checkCollision = (
      r1: { x: number; y: number; w: number; h: number },
      r2: { x: number; y: number; w: number; h: number },
    ) => {
      return (
        r1.x < r2.x + r2.w &&
        r1.x + r1.w > r2.x &&
        r1.y < r2.y + r2.h &&
        r1.y + r1.h > r2.y
      );
    };

    const loop = () => {
      const phys = physics.current;
      phys.frame++;

      const birdW = 44;
      const birdH = 32;
      const pipeW = 60;
      const baseH = 150;
      const playAreaHeight = canvas.height - baseH;

      drawBackground(assets.current.bg, dumData.bg.bgImg.fillType);

      if (gameState === "START") {
        phys.birdY = canvas.height / 2 - 50 + Math.sin(phys.frame * 0.1) * 5;
        phys.baseX = (phys.baseX - phys.pipeSpeed) % canvas.width;
        phys.birdVelocity = 0;
        phys.birdRotation = 0;
        phys.pipes = [];
        phys.gameTime = 0;
      } else if (gameState === "PLAYING") {
        phys.gameTime++;
        phys.birdVelocity += phys.gravity;
        phys.birdY += phys.birdVelocity;

        if (phys.birdVelocity < phys.jumpStrength / 2) {
          phys.birdRotation = -25 * (Math.PI / 180);
        } else {
          phys.birdRotation += 2 * (Math.PI / 180);
          if (phys.birdRotation > 90 * (Math.PI / 180))
            phys.birdRotation = 90 * (Math.PI / 180);
        }

        phys.baseX = (phys.baseX - phys.pipeSpeed) % canvas.width;

        if (phys.gameTime > 200) {
          if (phys.gameTime % phys.pipeSpawnRate === 0) {
            const minPipeY = 50;
            const maxPipeY = playAreaHeight - phys.pipeGap - 50;
            const pipeY =
              Math.floor(Math.random() * (maxPipeY - minPipeY + 1)) + minPipeY;
            phys.pipes.push({ x: canvas.width, y: pipeY, passed: false });
          }
        }

        const hitboxPadding = 4;
        const birdHitbox = {
          x: canvas.width / 2 + hitboxPadding,
          y: phys.birdY + hitboxPadding,
          w: birdW - hitboxPadding * 2,
          h: birdH - hitboxPadding * 2,
        };

        for (let i = phys.pipes.length - 1; i >= 0; i--) {
          const p = phys.pipes[i];
          p.x -= phys.pipeSpeed;

          const topPipeBox = {
            x: p.x,
            y: 0,
            w: pipeW,
            h: p.y,
          };

          const bottomPipeBox = {
            x: p.x,
            y: p.y + phys.pipeGap,
            w: pipeW,
            h: playAreaHeight - (p.y + phys.pipeGap),
          };

          if (
            checkCollision(birdHitbox, topPipeBox) ||
            checkCollision(birdHitbox, bottomPipeBox)
          ) {
            playSound("death");
            setGameState("GAMEOVER");
          }

          if (!p.passed && p.x + pipeW < canvas.width / 2) {
            p.passed = true;
            setScore((s) => s + 1);
            playSound("point");
          }

          if (p.x < -100) {
            phys.pipes.splice(i, 1);
          }
        }

        if (phys.birdY + birdH >= playAreaHeight) {
          phys.birdY = playAreaHeight - birdH;
          playSound("death");
          setGameState("GAMEOVER");
        }

        if (phys.birdY < 0) {
          phys.birdY = 0;
          phys.birdVelocity = 0;
        }
      } else if (gameState === "GAMEOVER") {
        if (phys.birdY + birdH < playAreaHeight) {
          phys.birdVelocity += phys.gravity;
          phys.birdY += phys.birdVelocity;
          phys.birdRotation = 90 * (Math.PI / 180);
        } else {
          phys.birdY = playAreaHeight - birdH;
        }
      }

      const pipeImg = assets.current.pipe;

      phys.pipes.forEach((p) => {
        if (pipeImg) {
          ctx.save();

          ctx.translate(p.x, p.y);
          ctx.scale(1, -1);
          if (dumData.pipeSprite.fillType === "Cover") {
            ctx.drawImage(pipeImg, 0, 0, pipeW, p.y);
          } else {
            ctx.drawImage(pipeImg, 0, 0, pipeW, p.y);
          }
          ctx.restore();

          if (dumData.pipeSprite.fillType === "Cover") {
            ctx.drawImage(
              pipeImg,
              p.x,
              p.y + phys.pipeGap,
              pipeW,
              playAreaHeight - (p.y + phys.pipeGap),
            );
          } else {
            ctx.drawImage(
              pipeImg,
              p.x,
              p.y + phys.pipeGap,
              pipeW,
              playAreaHeight - (p.y + phys.pipeGap),
            );
          }
        } else {
          ctx.fillStyle = "green";
          ctx.fillRect(p.x, 0, pipeW, p.y);
          ctx.fillRect(
            p.x,
            p.y + phys.pipeGap,
            pipeW,
            playAreaHeight - (p.y + phys.pipeGap),
          );
          ctx.strokeStyle = "#000";
          ctx.lineWidth = 2;
          ctx.strokeRect(p.x, 0, pipeW, p.y);
          ctx.strokeRect(
            p.x,
            p.y + phys.pipeGap,
            pipeW,
            playAreaHeight - (p.y + phys.pipeGap),
          );
        }

        const topPipeBox = { x: p.x, y: 0, w: pipeW, h: p.y };
        const bottomPipeBox = {
          x: p.x,
          y: p.y + phys.pipeGap,
          w: pipeW,
          h: playAreaHeight - (p.y + phys.pipeGap),
        };

        ctx.save();
        ctx.strokeStyle = "red";
        ctx.lineWidth = 2;
        ctx.strokeRect(topPipeBox.x, topPipeBox.y, topPipeBox.w, topPipeBox.h);
        ctx.strokeRect(
          bottomPipeBox.x,
          bottomPipeBox.y,
          bottomPipeBox.w,
          bottomPipeBox.h,
        );
        ctx.restore();
      });

      const baseXDisplay = phys.baseX % canvas.width;
      if (assets.current.base) {
        const baseImg = assets.current.base;
        const drawBase = (offsetX: number) => {
          ctx.drawImage(baseImg, offsetX, playAreaHeight, canvas.width, baseH);
        };
        drawBase(baseXDisplay);
        drawBase(baseXDisplay + canvas.width);
        if (baseXDisplay > 0) drawBase(baseXDisplay - canvas.width);
      } else {
        ctx.fillStyle = "#ded895";
        ctx.fillRect(0, playAreaHeight, canvas.width, baseH);
        ctx.fillStyle = "#73bf2e";
        ctx.fillRect(0, playAreaHeight, canvas.width, 20);

        const stripeWidth = 20;
        ctx.fillStyle = "#9ce659";
        for (let i = 0; i < canvas.width + stripeWidth; i += stripeWidth * 2) {
          ctx.beginPath();
          ctx.moveTo(i + baseXDisplay, playAreaHeight);
          ctx.lineTo(i + 20 + baseXDisplay, playAreaHeight);
          ctx.lineTo(i - 20 + baseXDisplay, playAreaHeight + 20);
          ctx.lineTo(i - 40 + baseXDisplay, playAreaHeight + 20);
          ctx.fill();
        }
      }

      ctx.save();
      ctx.translate(canvas.width / 2 + birdW / 2, phys.birdY + birdH / 2);
      ctx.rotate(phys.birdRotation);

      let birdSpriteToDraw = null;
      if (gameState === "GAMEOVER" && assets.current.birdDeath) {
        birdSpriteToDraw = assets.current.birdDeath;
      } else if (assets.current.bird.length > 0) {
        const frameIndex =
          Math.floor(phys.frame / 5) % assets.current.bird.length;
        birdSpriteToDraw = assets.current.bird[frameIndex];
      }

      if (birdSpriteToDraw) {
        ctx.drawImage(birdSpriteToDraw, -birdW / 2, -birdH / 2, birdW, birdH);
      } else {
        ctx.fillStyle = "yellow";
        ctx.fillRect(-birdW / 2, -birdH / 2, birdW, birdH);
      }
      ctx.restore();

      if (gameState === "PLAYING" || gameState === "START") {
        const hitboxPadding = 4;
        ctx.save();
        ctx.strokeStyle = "red";
        ctx.lineWidth = 2;
        ctx.strokeRect(
          canvas.width / 2 + hitboxPadding,
          phys.birdY + hitboxPadding,
          birdW - hitboxPadding * 2,
          birdH - hitboxPadding * 2,
        );
        ctx.restore();
      }

      if (gameState === "START") {
        ctx.fillStyle = "white";
        ctx.font = "bold 40px Arial";
        ctx.strokeStyle = "black";
        ctx.lineWidth = 3;
        ctx.textAlign = "center";
        ctx.strokeText(
          dumData.name || "FLAPPY BIRD",
          canvas.width / 2,
          canvas.height / 4,
        );
        ctx.fillText(
          dumData.name || "FLAPPY BIRD",
          canvas.width / 2,
          canvas.height / 4,
        );

        ctx.font = "bold 24px Arial";
        ctx.strokeText(
          "Tap to Start",
          canvas.width / 2,
          canvas.height / 2 + 50,
        );
        ctx.fillText("Tap to Start", canvas.width / 2, canvas.height / 2 + 50);
      }

      if (gameState === "GAMEOVER") {
        ctx.fillStyle = "white";
        ctx.font = "bold 40px Arial";
        ctx.strokeStyle = "black";
        ctx.lineWidth = 3;
        ctx.textAlign = "center";
        ctx.strokeText("GAME OVER", canvas.width / 2, canvas.height / 2 - 20);
        ctx.fillText("GAME OVER", canvas.width / 2, canvas.height / 2 - 20);

        ctx.fillStyle = "#eec39a";
        ctx.fillRect(canvas.width / 2 - 100, canvas.height / 2 + 10, 200, 100);
        ctx.lineWidth = 2;
        ctx.strokeRect(
          canvas.width / 2 - 100,
          canvas.height / 2 + 10,
          200,
          100,
        );

        ctx.fillStyle = "#d88038";
        ctx.textAlign = "left";
        ctx.font = "bold 20px Arial";
        ctx.fillText("Score", canvas.width / 2 - 80, canvas.height / 2 + 40);
        ctx.fillStyle = "white";
        ctx.textAlign = "right";
        ctx.fillText(
          score.toString(),
          canvas.width / 2 + 80,
          canvas.height / 2 + 40,
        );

        ctx.fillStyle = "#d88038";
        ctx.textAlign = "left";
        ctx.fillText("Best", canvas.width / 2 - 80, canvas.height / 2 + 80);
        ctx.fillStyle = "white";
        ctx.textAlign = "right";
        ctx.fillText(
          highScore.toString(),
          canvas.width / 2 + 80,
          canvas.height / 2 + 80,
        );
      }

      animationFrameId = requestAnimationFrame(loop);
    };

    animationFrameId = requestAnimationFrame(loop);

    return () => {
      cancelAnimationFrame(animationFrameId);
      window.removeEventListener("resize", resizeCanvas);
    };
  }, [gameState, score, highScore]);

  const handleInput = () => {
    if (gameState === "START") {
      setScore(0);
      setGameState("PLAYING");
      physics.current.birdVelocity = physics.current.jumpStrength;
      if (assets.current.audio.bgMusic)
        assets.current.audio.bgMusic.play().catch(() => {});
      if (assets.current.audio.flap) {
        assets.current.audio.flap.currentTime = 0;
        assets.current.audio.flap.play().catch(() => {});
      }
    } else if (gameState === "PLAYING") {
      physics.current.birdVelocity = physics.current.jumpStrength;
      if (assets.current.audio.flap) {
        assets.current.audio.flap.currentTime = 0;
        assets.current.audio.flap.play().catch(() => {});
      }
    } else if (gameState === "GAMEOVER") {
      if (
        physics.current.birdY + 32 >=
        (canvasRef.current?.height || 800) - 150 - 10
      ) {
        if (score > highScore) setHighScore(score);
        setGameState("START");
      }
    }
  };

  return (
    <div className="w-screen h-svh flex justify-center items-center bg-[#333]">
      <div
        className="w-full h-full sm:w-150 sm:h-200 border-4 border-black relative overflow-hidden"
        onMouseDown={handleInput}
        onTouchStart={(e) => {
          e.preventDefault();
          handleInput();
        }}
      >
        <canvas
          ref={canvasRef}
          className="w-full h-full block select-none"
        ></canvas>

        {gameState === "PLAYING" && (
          <div className="absolute top-10 w-full text-center pointer-events-none">
            <span
              className="text-5xl font-bold text-white stroke-black drop-shadow-[0_2px_2px_rgba(0,0,0,0.8)]"
              style={{
                textShadow:
                  "-2px -2px 0 #000, 2px -2px 0 #000, -2px 2px 0 #000, 2px 2px 0 #000",
              }}
            >
              {score}
            </span>
          </div>
        )}
      </div>
    </div>
  );
}

export default Game;
