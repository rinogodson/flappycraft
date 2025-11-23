import { useCallback, useContext, useEffect, useRef, useState } from "react";
import FlappyCtx from "../AllTheCrazyReactGoodies/ContextProvider";
import { useDropzone } from "react-dropzone";
function Game() {
  const bgMusicRef = useRef<HTMLAudioElement | null>(null);
  const inputRef = useRef<HTMLInputElement | null>(null);
  const [showDialog, setShowDialog] = useState(true);

  const c = useContext(FlappyCtx);

  const onDrop = useCallback(
    (files: File[]) => {
      if (files.length > 1) return;
      if (!files[0].name.match(/.*\.flap/) && !files[0].name.match(/.*\.json/))
        return;
      const file = files[0];

      const r = new FileReader();
      r.onload = (e) => {
        try {
          const text = e.target?.result;
          if (typeof text !== "string") return;

          const parsed = JSON.parse(text);
          c.setGameCtx(parsed);
          console.log("Parsed JSON:", parsed);
          console.log(c.gameCtx);
        } catch (err) {
          console.error("Invalid JSON:", err);
        }
      };
      r.onerror = () => {
        console.error("Error reading file");
      };

      r.readAsText(file);
    },
    [c],
  );

  const { getRootProps, getInputProps, isDragActive } = useDropzone({ onDrop });

  useEffect(() => {
    if (c.gameCtx.name == "") {
      setShowDialog(true);
    } else {
      setShowDialog(false);
    }
    const bg = new Audio(c.gameCtx.sounds.bgMusic.file);
    bg.volume = c.gameCtx.sounds.bgMusic.volume / 100;
    bg.loop = true;
    bgMusicRef.current = bg;
  }, [
    c.gameCtx.name,
    c.gameCtx.sounds.bgMusic.file,
    c.gameCtx.sounds.bgMusic.volume,
  ]);

  const play = (sound: string, volume: number, loop: boolean = false) => {
    const audio = new Audio(sound);
    audio.volume = volume;
    audio.loop = loop;
    audio.play();
    return audio;
  };

  function setThemeColor(color: string) {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    let theme: any = document.querySelector('meta[name="theme-color"]');

    if (!theme) {
      theme = document.createElement("meta");
      theme.name = "theme-color";
      document.head.appendChild(theme);
    }
    theme.setAttribute("content", color);
  }

  useEffect(() => {
    document.body.style.backgroundColor = c.gameCtx.bg.baseColor;
    setThemeColor(c.gameCtx.bg.bgColor);
    return () => {
      document.body.style.backgroundColor = "";
    };
  }, [c.gameCtx.bg.baseColor, c.gameCtx.bg.bgColor]);

  //types!!
  type pipe = {
    image: HTMLImageElement;
    x: number;
    y: number;
    width: number;
    height: number;
    passed: boolean;
    isTop: boolean;
  };

  const canRef = useRef<HTMLCanvasElement>(null);

  const defBirdProps = {
    w: 55,
    x: 0,
    y: 0,
    rotation: 0,
  };
  const birdProps = useRef(defBirdProps);

  const score = useRef(0);

  const defPipeProps = {
    pArray: [],
    h: 470,
    x: 0,
    y: 0,
  };
  const pipeProps = useRef<{
    pArray: pipe[];
    h: number;
    x: number;
    y: number;
  }>(defPipeProps);

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const [_, setGO] = useState(false);
  const gameOverRef = useRef(false);
  const gameStarted = useRef(false);
  const startTime = useRef(0);
  const flashOp = useRef(0);
  const fadeOp = useRef(0);
  const fadeState = useRef(0);

  const defPhysics = {
    velocityX: -3,
    velocityY: 0,
    gravity: 0.2,
  };
  const physics = useRef(defPhysics);

  useEffect(() => {
    const PIPE_SPACING = 300;
    const TERMINAL_VELOCITY = 5;
    const canvas = canRef.current;

    if (!canvas) return;
    const context = canRef.current?.getContext("2d");

    const MULT = 1.1;
    canvas.width = canvas.clientWidth * MULT;
    canvas.height = canvas.clientHeight * MULT;

    birdProps.current.x = canvas?.width / 8;
    birdProps.current.y = canvas?.height / 2;
    pipeProps.current.x = canvas?.width;

    if (!context) return;
    context.imageSmoothingEnabled = false;

    const topPipe = new Image();
    topPipe.src = String(c.gameCtx.pipeSprite.sprite);
    const botPipe = new Image();
    botPipe.src = String(c.gameCtx.pipeSprite.sprite);

    const birdImages = c.gameCtx.birdSprite.normal.map(
      (src: string | undefined) => {
        const img = new Image();
        img.src = String(src);
        return img;
      },
    );
    let frameTick = 0;
    let animDir = 1;
    let currentFrame = 0;
    const FRAME_SPEED = 12;

    const baseImg = new Image();
    baseImg.src = String(c.gameCtx.bg.baseImg.sprite);

    let lastTime = performance.now();
    let baseX = 0;
    const BASE_HEIGHT = 120;
    const BASE_TOP_COORDS = canvas.height - BASE_HEIGHT;

    const button = {
      x: canvas.width / 2 - 220 / 2,
      y: canvas.height / 2 + 60,
      width: 220,
      height: 60,
      text: "Play Again",
    };

    const update = (time: number) => {
      requestAnimationFrame(update);
      const delta = (time - lastTime) / 16.666;
      lastTime = time;
      context.lineWidth = 1;
      context.strokeStyle = "red";
      const floorCollision =
        birdProps.current.y + 5 + ((birdProps.current.w - 10) * 3) / 4 >=
        canvas.height - BASE_HEIGHT;

      if (floorCollision && !gameOverRef.current) {
        gameOverRef.current = true;
        setGO(true);
        flashOp.current = 1;
        play(String(c.gameCtx.sounds.death), 0.5, false);
        bgMusicRef.current?.pause();
      }

      if (fadeState.current === 1) {
        fadeOp.current += 0.04;
        if (fadeOp.current >= 1) {
          fadeOp.current = 1;
          resetGame();
          fadeState.current = 2;
        }
      } else if (fadeState.current === 2) {
        fadeOp.current -= 0.04;
        if (fadeOp.current <= 0) {
          fadeOp.current = 0;
          fadeState.current = 0;
        }
      }

      if (flashOp.current > 0) {
        flashOp.current -= 0.05;
      }

      if (!gameStarted.current) {
        birdProps.current.y = canvas.height / 2 + Math.sin(time / 200) * 10;
        birdProps.current.rotation = 0;
      } else {
        if (physics.current.velocityY < 1.5) {
          birdProps.current.rotation = -25 * (Math.PI / 180);
        } else {
          birdProps.current.rotation += 0.05 * delta;
          const degree90 = 90 * (Math.PI / 180);

          if (birdProps.current.rotation > degree90) {
            birdProps.current.rotation = degree90;
          }
        }

        physics.current.velocityY += physics.current.gravity * delta;
        birdProps.current.y += physics.current.velocityY * delta;
        if (physics.current.velocityY > TERMINAL_VELOCITY) {
          physics.current.velocityY = TERMINAL_VELOCITY;
        }

        birdProps.current.y = Math.max(
          birdProps.current.y + physics.current.velocityY,
          0,
        );
      }

      if (birdProps.current.y > BASE_TOP_COORDS) {
        birdProps.current.y = BASE_TOP_COORDS;
      }
      context.clearRect(0, 0, canvas.width, canvas.height);
      context.fillStyle = `rgba(0,0,0,${c.gameCtx.bg.opacity})`;
      context.fillRect(0, 0, canvas.width, canvas.height);
      context.font = `25px "Jersey 10"`;
      context.textAlign = "left";
      context.textBaseline = "top";
      context.fillStyle = "white";
      context.fillText(c.gameCtx.name, 10, 10);

      const pipeArray = pipeProps.current.pArray;

      for (let i = 0; i < pipeArray.length; i++) {
        const pipe = pipeArray[i];
        pipe.x += physics.current.velocityX * delta;
        if (pipe.isTop) {
          context.save();
          context.translate(pipe.x + pipe.width / 2, pipe.y + pipe.height / 2);
          context.scale(1, -1);
          context.drawImage(
            pipe.image,
            -pipe.width / 2,
            -pipe.height / 2,
            pipe.width,
            pipe.height,
          );
          context.restore();
        } else {
          context.drawImage(
            pipe.image,
            pipe.x,
            pipe.y,
            pipe.width,
            pipe.height,
          );
        }

        if (!pipe.passed && birdProps.current.x > pipe.x && pipe.isTop) {
          score.current += 1;
          pipe.passed = true;
          play(String(c.gameCtx.sounds.point), 0.5, false);
        }
        const bH =
          birdProps.current.w * (birdImages[0].height / birdImages[0].width);
        if (!gameOverRef.current) {
          if (
            detectColls(
              {
                x: birdProps.current.x + 5,
                y: birdProps.current.y + 5,
                width: birdProps.current.w - 10,
                height: bH - 10,
              },
              {
                x: pipe.x - 5,
                y: pipe.y - 5,
                width: pipe.width + 10,
                height: pipe.height + 10,
              },
            )
          ) {
            gameOverRef.current = true;
            setGO(true);
            flashOp.current = 1;
            bgMusicRef.current?.pause();

            play(String(c.gameCtx.sounds.death), 0.5, false);
          }
        }
        // context.strokeRect(
        //   pipe.x - 5,
        //   pipe.y - 5,
        //   pipe.width + 10,
        //   pipe.height + 10,
        // );
      }

      pipeProps.current.pArray = pipeProps.current.pArray.filter(
        (p) => p.x + p.width > 0,
      );

      const lastPipe = pipeArray[pipeArray.length - 1];
      if (gameStarted.current && Date.now() - startTime.current > 3000) {
        if (!lastPipe || lastPipe.x < canvas.width - PIPE_SPACING) {
          placePipes();
        }
      }

      //DRAWING THE FREAKING BIRD
      context.save();

      const bW = birdProps.current.w;
      const bH =
        birdProps.current.w * (birdImages[0].height / birdImages[0].width);
      const pivotX = bW / 2;
      const pivotY = bH / 2;

      context.translate(
        birdProps.current.x + pivotX,
        birdProps.current.y + pivotY,
      );

      context.rotate(birdProps.current.rotation);
      if (!gameOverRef.current) {
        frameTick++;

        const totalFrames = birdImages.length;

        if (totalFrames === 1) {
          currentFrame = 0;
        } else if (totalFrames === 2) {
          if (frameTick % FRAME_SPEED === 0) {
            currentFrame = currentFrame === 0 ? 1 : 0;
          }
        } else {
          if (frameTick % FRAME_SPEED === 0) {
            currentFrame += animDir;

            if (currentFrame >= totalFrames) {
              currentFrame = totalFrames - 2;
              animDir = -1;
            } else if (currentFrame < 0) {
              currentFrame = 1;
              animDir = 1;
            }
          }
        }
      }

      if (c.gameCtx.birdSprite.death) {
        const deathImage = new Image();
        deathImage.src = c.gameCtx.birdSprite.death;

        context.drawImage(
          gameOverRef.current ? deathImage : birdImages[currentFrame],
          -pivotX,
          -pivotY,
          bW,
          bH,
        );
      } else {
        context.drawImage(birdImages[currentFrame], -pivotX, -pivotY, bW, bH);
      }

      context.restore();

      context.strokeRect(
        birdProps.current.x + 5,
        birdProps.current.y + 5,
        birdProps.current.w - 10,
        bH - 10,
      );

      baseX += physics.current.velocityX * delta;
      if (baseX <= -canvas.width) baseX = 0;
      context.drawImage(
        baseImg,
        baseX,
        canvas.height - BASE_HEIGHT,
        canvas.width,
        BASE_HEIGHT,
      );

      context.drawImage(
        baseImg,
        baseX + canvas.width - 1,
        canvas.height - BASE_HEIGHT,
        canvas.width,
        BASE_HEIGHT,
      );

      context.textAlign = "center";
      context.textBaseline = "bottom";
      //THE SCORE DISPLAY!! <-- This is not AI made comment, it's by me Rino Godson! and this entore code is made by me
      context.lineJoin = "miter";

      if (gameStarted.current) {
        context.font = gameOverRef.current
          ? '100px "Jersey 10"'
          : '80px "Jersey 10"';
        context.strokeStyle = "black";
        context.lineWidth = gameOverRef.current ? 10 : 8;
        context.strokeText(
          score.current.toString().padStart(2, "0"),
          canvas.width / 2,
          gameOverRef.current ? 200 : 150,
        );

        context.fillStyle = "black";
        context.fillText(
          score.current.toString().padStart(2, "0"),
          canvas.width / 2 + 5,
          gameOverRef.current ? 200 + 3 : 150 + 3,
        );
        context.strokeText(
          score.current.toString().padStart(2, "0"),
          canvas.width / 2 + 3,
          gameOverRef.current ? 200 + 3 : 150 + 3,
        );
        context.fillStyle = "white";
        context.fillText(
          score.current.toString().padStart(2, "0"),
          canvas.width / 2,
          gameOverRef.current ? 200 : 150,
        );
        if (gameOverRef.current) {
          context.font = '80px "Jersey 10"';
          context.strokeText("GAME OVER", canvas.width / 2, 280);
          context.fillText("GAME OVER", canvas.width / 2, 280);
        }
      } else if (!gameStarted.current) {
        const pos = 150;
        const shift = 0;
        context.textAlign = "center";

        context.font = '80px "Jersey 10"';
        context.fillStyle = "black";

        context.lineWidth = 7;
        context.textBaseline = "top";
        context.strokeStyle = "black";
        context.strokeText("Get Ready!", canvas.width / 2 + 3, pos + shift + 3);

        context.fillText("Get Ready!", canvas.width / 2 + 3, pos + shift + 3);

        context.fillStyle = "green";

        context.lineWidth = 7;
        context.strokeStyle = "white";
        context.strokeText("Get Ready!", canvas.width / 2, pos + shift);

        context.fillText("Get Ready!", canvas.width / 2, pos + shift);
      }
      context.textAlign = "center";

      if (gameOverRef.current) {
        physics.current.gravity = 5;
        physics.current.velocityX = 0;
      }

      if (flashOp.current > 0) {
        context.fillStyle = `rgba(255, 255, 255, ${flashOp.current})`;
        context.fillRect(0, 0, canvas.width, canvas.height);
      }
      if (fadeOp.current > 0) {
        context.fillStyle = `rgba(0, 0, 0, ${fadeOp.current})`;
        context.fillRect(0, 0, canvas.width, canvas.height);
      }

      //Drawing the button to restart the game <-- also by me, not AI!!
      if (gameOverRef.current) {
        context.save();
        context.lineWidth = 10;
        context.fillStyle = "green";
        context.strokeStyle = "black";
        context.strokeRect(button.x, button.y, button.width, button.height);

        context.lineWidth = 3;
        context.strokeStyle = "white";
        context.fillRect(button.x, button.y, button.width, button.height);

        context.strokeRect(button.x, button.y, button.width, button.height);

        context.font = `48px "Jersey 10"`;
        context.textAlign = "center";
        context.textBaseline = "middle";
        context.fillStyle = "white";
        context.fillText(
          button.text,
          button.x + button.width / 2,
          button.y + button.height / 2,
        );
        context.restore();
      }
    };

    const resetGame = () => {
      if (bgMusicRef.current) {
        bgMusicRef.current.currentTime = 0;
        bgMusicRef.current.play();
      }
      gameOverRef.current = false;
      setGO(false);
      gameStarted.current = false;
      flashOp.current = 0;

      birdProps.current = { ...defBirdProps };
      birdProps.current.x = canvas.width / 8;
      birdProps.current.y = canvas.height / 2;
      score.current = 0;
      pipeProps.current = { ...defPipeProps };
      pipeProps.current.pArray = [];
      pipeProps.current.x = canvas.width;
      physics.current = {
        velocityX: -3,
        velocityY: 0,
        gravity: 0.2,
      };
    };

    const placePipes = () => {
      const pipe = pipeProps.current;
      const randomY = pipe.y - pipe.h / 4 - Math.random() * (pipe.h / 2);
      const tPipe: pipe = {
        image: topPipe,
        x: pipe.x,
        y: randomY,
        width: (pipe.h * 3.5) / 21,
        height: pipe.h,
        passed: false,
        isTop: true,
      };
      pipe.pArray.push(tPipe);
      const pipSize = c.gameCtx.pipeSprite.distance;
      const bPipe: pipe = {
        image: botPipe,
        x: pipe.x,
        y:
          randomY +
          pipe.h +
          canvas.height / (pipSize == 1 ? 5 : pipSize == 2 ? 4 : 3),
        width: (pipe.h * 3.5) / 21,
        height: pipe.h,
        passed: false,
        isTop: false,
      };
      pipe.pArray.push(bPipe);
      console.log(pipe.pArray);
    };

    const jump = (k: boolean) => {
      play(String(c.gameCtx.sounds.flap), 0.5, false);
      if (k) {
        physics.current.velocityY = -3.2;
        return;
      }

      physics.current.velocityY = -4.0;
    };

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const handler = (e: any) => {
      if (fadeState.current !== 0) return;
      if (e.type === "keydown") {
        if (e.code === "Space" || e.code === "ArrowUp" || e.code === "KeyW") {
          if (!gameOverRef.current) {
            if (!gameStarted.current) {
              gameStarted.current = true;
              startTime.current = Date.now();

              if (!bgMusicRef.current) {
                bgMusicRef.current = new Audio(c.gameCtx.sounds.flap);
                bgMusicRef.current.volume =
                  c.gameCtx.sounds.bgMusic.volume / 100;
                bgMusicRef.current.loop = true;
              }

              if (bgMusicRef.current.paused) {
                bgMusicRef.current.play().catch(() => {});
              }
            }
            jump(false);
          }
        } else if (e.code == "Enter") {
          fadeState.current = 1;
        }
      }

      if (
        e.type === "touchstart" ||
        e.type === "mousedown" ||
        e.type === "touchend" ||
        e.type === "mouseup"
      ) {
        if (e.type === "touchstart") {
          e.preventDefault();
        }

        if (gameOverRef.current) {
          const rect = canvas.getBoundingClientRect();
          const clientX =
            e.type === "touchend" ? e.changedTouches[0].clientX : e.clientX;

          const clientY =
            e.type === "touchend" ? e.changedTouches[0].clientY : e.clientY;

          const scaleX = canvas.width / rect.width;
          const scaleY = canvas.height / rect.height;

          const clickX = (clientX - rect.left) * scaleX;
          const clickY = (clientY - rect.top) * scaleY;

          if (
            (e.type === "touchend" || e.type === "mouseup") &&
            clickX >= button.x &&
            clickX <= button.x + button.width &&
            clickY >= button.y &&
            clickY <= button.y + button.height
          ) {
            fadeState.current = 1;
          }
        } else {
          if (!gameStarted.current) {
            gameStarted.current = true;
            startTime.current = Date.now();

            if (!bgMusicRef.current) {
              bgMusicRef.current = new Audio(c.gameCtx.sounds.flap);
              bgMusicRef.current.volume = c.gameCtx.sounds.bgMusic.volume / 100;
              bgMusicRef.current.loop = true;
            }

            if (bgMusicRef.current.paused) {
              bgMusicRef.current.play().catch(() => {});
            }
          }
          if (e.type === "mousedown" || e.type === "touchstart") jump(true);
          if (e.type === "touchend") {
            if (!bgMusicRef.current) {
              bgMusicRef.current = new Audio(c.gameCtx.sounds.flap);
              bgMusicRef.current.volume = c.gameCtx.sounds.bgMusic.volume / 100;
              bgMusicRef.current.loop = true;
            }
            if (bgMusicRef.current.paused) {
              bgMusicRef.current.play().catch(() => {});
            }
          }
        }
      }
    };

    document.addEventListener("keydown", handler);
    document.addEventListener("touchstart", handler, { passive: false });
    document.addEventListener("mousedown", handler, { passive: false });
    document.addEventListener("touchend", handler);
    document.addEventListener("mouseup", handler);

    type h = {
      x: number;
      y: number;
      width: number;
      height: number;
    };

    const detectColls = (a: h, b: h) => {
      return (
        a.x < b.x + b.width &&
        a.x + a.width > b.x &&
        a.y < b.y + b.height &&
        a.y + a.height > b.y
      );
    };

    birdImages[0].onload = () => requestAnimationFrame(update);
    return () => {
      document.body.style.backgroundColor = "";
      document.removeEventListener("keydown", handler);
      document.removeEventListener("touchstart", handler);
      document.removeEventListener("touchend", handler);
      document.removeEventListener("mousedown", handler);
      document.removeEventListener("mouseup", handler);
      bgMusicRef.current?.pause();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [showDialog]);

  return (
    <div className="w-screen h-svh flex justify-center flex-col items-center bg-[#4DC0CA]">
      <div className="w-full h-full max-h-200 bg-[#4DC0CA] sm:w-150 sm:h-200  sm:border-4 ">
        {!showDialog && (
          <canvas
            ref={canRef}
            style={{
              backgroundImage: `url(${c.gameCtx.bg.bgImg.sprite})`,
              backgroundPosition: "bottom",
            }}
            className="w-full h-full bg-contain bg-repeat-x"
          ></canvas>
        )}
        <input className="hidden" ref={inputRef} type="file" />
      </div>
      {showDialog && (
        <div className="w-svw h-svh bg-black/80 absolute flex justify-center items-center">
          <div className="bg-black text-white font-jersey text-4xl flex flex-col gap-5 justify-center items-center border-white border-3 sm:w-200 w-full h-1/2 shadow-[0_0_0_3px_black]">
            <p>Select a .flap file</p>
            <div
              {...getRootProps()}
              style={{
                scale: isDragActive ? 1.1 : 1,
                border: "solid 3px rgba(255,255,255,0.15)",
                borderRadius: "0rem",
                color: "rgba(255,255,255,0.8)",
                background: "#090E13",
              }}
              className="w-full p-2 active:p-1 h-1/2"
            >
              <input {...getInputProps()} />
              <div
                style={{
                  background: "rgba(0,0,0,0.1)",
                  transition: "all 300ms",
                  display: "flex",
                  border: "1px solid rgba(255,255,255,0.1)",
                }}
                className="w-full flex-col gap-4 h-full justify-center items-center  overflow-hidden "
              >
                {isDragActive ? (
                  <>
                    <p>Drop the flap file here ...</p>
                  </>
                ) : (
                  <>
                    <p className="text-center">
                      Drop the flap file here,
                      <br /> or click to upload
                    </p>
                  </>
                )}
              </div>
            </div>
          </div>
        </div>
      )}
      <div className="sm:hidden h-full max-h-[calc(100%-50rem)] w-full bg-[#DED895]"></div>
    </div>
  );
}
export default Game;
