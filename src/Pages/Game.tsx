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
  const birdProps = useRef({
    w: 55,
    x: 0,
    y: 0,
  });
  const pipeProps = useRef<{
    pArray: pipe[];
    h: number;
    x: number;
    y: number;
  }>({
    pArray: [],
    h: 470,
    x: 0,
    y: 0,
  });

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const [_, setGO] = useState(false);
  const gameOverRef = useRef(false);

  const physics = useRef({
    velocityX: -2,
    velocityY: 0,
  });

  useEffect(() => {
    const PIPE_SPACING = 300;
    const GRAVITY = 0.3;
    const canvas = canRef.current;
    if (!canvas) return;
    const context = canRef.current?.getContext("2d");

    canvas.width = canvas.clientWidth;
    canvas.height = canvas.clientHeight;

    birdProps.current.x = canvas?.width / 8;
    birdProps.current.y = canvas?.height / 2;
    pipeProps.current.x = canvas?.width;

    if (!context) return;
    context.imageSmoothingEnabled = false;

    const topPipe = new Image();
    topPipe.src = dumData.pipeSprite.sprite;
    const botPipe = new Image();
    botPipe.src = dumData.pipeSprite.sprite;

    const birdImg = new Image();
    birdImg.src = dumData.birdSprite.normal[0];

    const baseImg = new Image();
    baseImg.src = dumData.bg.baseImg.sprite;

    let lastTime = performance.now();
    let baseX = 0;
    const BASE_HEIGHT = 100;

    const update = (time: number) => {
      requestAnimationFrame(update);
      context.lineWidth = 1;
      context.strokeStyle = "red";
      if (gameOverRef.current) return;
      const floorCollision =
        birdProps.current.y + 5 + ((birdProps.current.w - 10) * 3) / 4 >=
        canvas.height - BASE_HEIGHT;

      if (floorCollision) {
        gameOverRef.current = true;
        setGO(true);
      }
      const delta = (time - lastTime) / 16.666;
      lastTime = time;

      birdProps.current.y += physics.current.velocityY * delta;
      physics.current.velocityY += GRAVITY;

      birdProps.current.y = Math.max(
        birdProps.current.y + physics.current.velocityY,
        0,
      );

      context.clearRect(0, 0, canvas.width, canvas.height);
      context.drawImage(
        birdImg,
        birdProps.current.x,
        birdProps.current.y,
        birdProps.current.w,
        (birdProps.current.w * 3) / 4,
      );
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
        if (
          detectColls(
            {
              x: birdProps.current.x + 5,
              y: birdProps.current.y + 5,
              width: birdProps.current.w - 10,
              height: (birdProps.current.w * 3) / 4 - 10,
            },
            {
              x: pipe.x,
              y: pipe.y,
              width: pipe.width,
              height: pipe.height,
            },
          )
        ) {
          gameOverRef.current = true;
          setGO(true);
        }
        context.strokeRect(pipe.x, pipe.y, pipe.width, pipe.height);
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

      context.strokeText("01", canvas.width / 2, 150);
      context.fillText("01", canvas.width / 2, 150);
      context.textAlign = "center";
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
        y: randomY + pipe.h + canvas.height / 4,
        width: (pipe.h * 3.5) / 21,
        height: pipe.h,
        passed: false,
        isTop: false,
      };
      pipe.pArray.push(bPipe);
      console.log(pipe.pArray);
    };

    document.addEventListener("keydown", (e) => {
      if (e.code == "Space" || e.code == "ArrowUp" || e.code == "KeyW") {
        physics.current.velocityY = -5;
      }
    });

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

    birdImg.onload = () => requestAnimationFrame(update);
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
