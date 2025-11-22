import { useEffect, useRef, useState } from "react";
import * as dumData from "./dunData.json";
function Game() {
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
    document.body.style.backgroundColor = "#DED895";
    setThemeColor("#4DC0CA");
    return () => {
      document.body.style.backgroundColor = "";
    };
  }, []);

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
    topPipe.src = dumData.pipeSprite.sprite;
    const botPipe = new Image();
    botPipe.src = dumData.pipeSprite.sprite;

    const birdImages = dumData.birdSprite.normal.map((src: string) => {
      const img = new Image();
      img.src = src;
      return img;
    });
    let frameTick = 0;
    let currentFrame = 0;
    const FRAME_SPEED = 6;

    const baseImg = new Image();
    baseImg.src = dumData.bg.baseImg.sprite;

    let lastTime = performance.now();
    let baseX = 0;
    const BASE_HEIGHT = 120;
    const BASE_TOP_COORDS = canvas.height - BASE_HEIGHT;

    const update = (time: number) => {
      requestAnimationFrame(update);
      context.lineWidth = 1;
      context.strokeStyle = "red";
      const floorCollision =
        birdProps.current.y + 5 + ((birdProps.current.w - 10) * 3) / 4 >=
        canvas.height - BASE_HEIGHT;

      if (floorCollision) {
        gameOverRef.current = true;
        setGO(true);
      }

      const delta = (time - lastTime) / 16.666;

      if (physics.current.velocityY < 1.5) {
        birdProps.current.rotation = -25 * (Math.PI / 180);
      } else {
        birdProps.current.rotation += 0.05 * delta;
        const degree90 = 90 * (Math.PI / 180);

        if (birdProps.current.rotation > degree90) {
          birdProps.current.rotation = degree90;
        }
      }
      lastTime = time;

      physics.current.velocityY += physics.current.gravity * delta;
      birdProps.current.y += physics.current.velocityY * delta;
      if (physics.current.velocityY > TERMINAL_VELOCITY) {
        physics.current.velocityY = TERMINAL_VELOCITY;
      }

      birdProps.current.y = Math.max(
        birdProps.current.y + physics.current.velocityY,
        0,
      );

      if (birdProps.current.y > BASE_TOP_COORDS) {
        birdProps.current.y = BASE_TOP_COORDS;
      }
      context.clearRect(0, 0, canvas.width, canvas.height);

      context.save();

      const bW = birdProps.current.w;
      const bH = (birdProps.current.w * 3) / 4;
      const pivotX = bW / 2;
      const pivotY = bH / 2;

      context.translate(
        birdProps.current.x + pivotX,
        birdProps.current.y + pivotY,
      );

      context.rotate(birdProps.current.rotation);
      if (!gameOverRef.current) {
        frameTick++;
        if (frameTick % FRAME_SPEED === 0) {
          currentFrame = (currentFrame + 1) % birdImages.length;
        }
      }
      context.drawImage(birdImages[currentFrame], -pivotX, -pivotY, bW, bH);

      context.restore();

      context.strokeRect(
        birdProps.current.x + 5,
        birdProps.current.y + 5,
        birdProps.current.w - 10,
        (birdProps.current.w * 3) / 4 - 10,
      );

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
        }
        if (!gameOverRef.current) {
          if (
            detectColls(
              {
                x: birdProps.current.x + 5,
                y: birdProps.current.y + 5,
                width: birdProps.current.w - 10,
                height: (birdProps.current.w * 3) / 4 - 10,
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
          }
        }
        context.strokeRect(
          pipe.x - 5,
          pipe.y - 5,
          pipe.width + 10,
          pipe.height + 10,
        );
      }

      pipeProps.current.pArray = pipeProps.current.pArray.filter(
        (p) => p.x + p.width > 0,
      );

      const lastPipe = pipeArray[pipeArray.length - 1];
      if (!lastPipe || lastPipe.x < canvas.width - PIPE_SPACING) {
        placePipes();
      }

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

      //THE SCORE DISPLAY!! <-- This is not AI made comment, it's by me Rino Godson! and this entore code is made by me
      context.fillStyle = "white";
      context.font = '80px "Jersey 10"';
      context.strokeStyle = "black";
      context.lineWidth = 10;

      context.strokeText(
        score.current.toString().padStart(2, "0"),
        canvas.width / 2,
        150,
      );
      context.fillText(
        score.current.toString().padStart(2, "0"),
        canvas.width / 2,
        150,
      );
      context.textAlign = "center";

      if (gameOverRef.current) {
        physics.current.gravity = 5;
        physics.current.velocityX = 0;
      }
    };

    const resetGame = () => {
      if (!gameOverRef.current) return;

      gameOverRef.current = false;
      setGO(false);

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
      const bPipe: pipe = {
        image: botPipe,
        x: pipe.x,
        y: randomY + pipe.h + canvas.height / 5,
        width: (pipe.h * 3.5) / 21,
        height: pipe.h,
        passed: false,
        isTop: false,
      };
      pipe.pArray.push(bPipe);
      console.log(pipe.pArray);
    };

    const jump = (k: boolean) => {
      if (k) {
        physics.current.velocityY = -3.2;
        return;
      }

      physics.current.velocityY = -4.0;
    };

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const handler = (e: any) => {
      if (e.type === "keydown") {
        if (e.code === "Space" || e.code === "ArrowUp" || e.code === "KeyW") {
          if (gameOverRef.current) {
            resetGame();
          } else {
            jump(false);
          }
        }
      }

      if (e.type === "touchstart") {
        e.preventDefault();
        if (gameOverRef.current) {
          resetGame();
        } else {
          jump(false);
        }
      }
    };

    document.addEventListener("keydown", handler);
    document.addEventListener("touchstart", handler, { passive: false });

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
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <div className="w-screen h-svh flex justify-center items-center bg-[#4DC0CA]">
      <div className="w-full h-full bg-[#4DC0CA] sm:w-150 sm:h-200  sm:border-4 ">
        <canvas
          ref={canRef}
          style={{
            backgroundImage: `url(${dumData.bg.bgImg.sprite})`,
            backgroundPosition: "bottom",
          }}
          className="w-full h-full bg-contain bg-repeat-x"
        ></canvas>
      </div>
    </div>
  );
}
export default Game;
