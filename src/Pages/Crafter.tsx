import { useCallback, useContext, useEffect, useRef, useState } from "react";
import Button from "../Components/Crafter/Button";
import FlappyCtx, {
  type schemaType,
} from "../AllTheCrazyReactGoodies/ContextProvider";
import { useDropzone } from "react-dropzone";
import { compressImageToWebp } from "../Helpers/services";

function Craft() {
  const c = useContext(FlappyCtx);
  const [localECtx, setLEC] = useState({
    page: 0,
    isCustom: [true, true, true, true, true],
  });
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
    document.body.style.backgroundColor = "#E66100";
    setThemeColor("#000");
    return () => {
      document.body.style.backgroundColor = "";
    };
  }, []);
  return (
    <div className="w-screen h-svh flex justify-center items-center bg-[#2b2b2b]">
      <div className="w-full h-full bg-black sm:w-150 sm:h-200 relative overflow-hidden sm:border-20 sm:border-b-0 sm:border-[#E66100] sm:shadow-[inset_0_0_0px_4px_#542B01,0_0_0_3px_black]">
        <div className="w-full text-white h-[calc(100%-4rem)] p-5  font-jersey overflow-y-scroll">
          <Page page={localECtx.page} c={c} />
          <div className="h-40 w-full "></div>
        </div>
        <div className="font-jersey p-1 text-3xl grid grid-cols-2  bg-[#572D01] h-14 w-[calc(100%-2rem)] text-white absolute bottom-20 translate-x-[50%] right-[50%] shadow-[0_0_0_10px_rgba(0,0,0,0.5)]">
          <div
            style={
              localECtx.isCustom[localECtx.page]
                ? { background: "#E66100", border: "3px solid white" }
                : {}
            }
            onClick={() => {
              const newArr = structuredClone(localECtx.isCustom);
              newArr[localECtx.page] = true;
              setLEC((p) => ({ ...p, isCustom: newArr }));
            }}
            className="w-full h-full flex items-center justify-center"
          >
            Custom
          </div>
          <div
            style={
              !localECtx.isCustom[localECtx.page]
                ? { background: "#E66100", border: "3px solid white" }
                : {}
            }
            onClick={() => {
              const newArr = structuredClone(localECtx.isCustom);
              newArr[localECtx.page] = false;
              setLEC((p) => ({ ...p, isCustom: newArr }));
            }}
            className="w-full h-full flex items-center justify-center"
          >
            Defaults
          </div>
        </div>
        <div className="grid grid-cols-[4rem_1fr_4rem]  text-white font-jersey w-full h-16 bg-[#E66100] absolute bottom-0 sm:shadow-[0_-2px_0_2px_#542B01] shadow-[0_-2px_0_2px_white,0_-4px_0_4px_#542B01]">
          <div
            onClick={() => {
              setLEC((p: typeof localECtx) => ({
                ...p,
                page: localECtx.page == 0 ? 4 : localECtx.page - 1,
              }));
            }}
            className="w-full origin-left h-full flex justify-center items-center active:scale-95 active:brightness-90"
          >
            <img src="/leftar.svg" />
          </div>
          <div className="text-shadow-[0_2px_0px_rgba(0,0,0,0.25)]  w-full flex justify-center items-center flex-col text-3xl">
            <p>Bird Sprite</p>
            <div className="flex gap-1">
              {Array.from({ length: 5 }, (_, i) => i + 1).map((item) => {
                if (item == localECtx.page + 1) {
                  return <div className="w-2 aspect-square bg-white"></div>;
                }
                return <div className="w-2 aspect-square bg-black/25"></div>;
              })}
            </div>
          </div>
          <div
            onClick={() => {
              setLEC((p: typeof localECtx) => ({
                ...p,
                page: localECtx.page < 4 ? localECtx.page + 1 : 0,
              }));
            }}
            className="w-full h-full origin-right flex justify-center items-center active:scale-95 active:brightness-90"
          >
            <img src="/rightar.svg" />
          </div>
        </div>
      </div>
    </div>
  );
}

function Page({ page, c }: { page: number; c: schemaType }) {
  let contentToRender;

  switch (page) {
    case 0:
      contentToRender = <BirdSprite c={c} />;
      break;
    case 1:
      contentToRender = <>1</>;
      break;
    case 2:
      contentToRender = <>2</>;
      break;
    case 3:
      contentToRender = <>3</>;
      break;
    case 4:
      contentToRender = <>4</>;
      break;
  }
  return contentToRender;
}

const BirdSprite = ({ c }: { c: schemaType }) => {
  const [selectedFrame, setSelectedFrame] = useState(0);
  const [loading, setLoading] = useState(false);

  const onDrop = useCallback(
    async (files: File[]) => {
      if (files.length > 1) return;
      const file = files[0];
      if (!file.type.match(/^image\/[a-zA-Z0-9_+-.]+$/)) return;
      const newArr = structuredClone(c.eCtx.birdSprite.normal);
      setLoading(true);
      newArr[selectedFrame] = await compressImageToWebp(file, 20);
      setLoading(false);
      c.setECtx((p) => ({
        ...p,
        birdSprite: {
          ...p.birdSprite,
          normal: [...newArr],
        },
      }));
      console.log(newArr[selectedFrame]);
    },
    [c, selectedFrame],
  );

  const { getRootProps, getInputProps } = useDropzone({ onDrop });

  const removeItem = (index: number) => {
    c.setECtx((p) => ({
      ...p,
      birdSprite: {
        ...p.birdSprite,
        normal: p.birdSprite.normal.filter((_, i) => i !== index),
      },
    }));
    if (selectedFrame >= index && selectedFrame > 0) {
      setSelectedFrame((prev) => prev - 1);
    }
  };

  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  useEffect(() => {
    const canvas = canvasRef.current;

    if (!canvas) return;
    const context = canvasRef.current?.getContext("2d");
    canvas.width = canvas.clientWidth;
    canvas.height = canvas.clientHeight;
    if (!context) return;
    context.imageSmoothingEnabled = false;

    const birdImages = c.eCtx.birdSprite.normal.map(
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
    let animationFrameId: number;
    // let lastTime = performance.now();
    const update = () => {
      animationFrameId = requestAnimationFrame(update);
      // const delta = (time - lastTime) / 16.666;
      // lastTime = time;

      context.clearRect(0, 0, canvas.width, canvas.height);
      context.save();

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

      const padding = 20;
      const availableWidth = canvas.width - padding * 2;
      const availableHeight = canvas.height - padding * 2;

      const scale = Math.min(
        availableWidth / birdImages[currentFrame].naturalWidth,
        availableHeight / birdImages[currentFrame].naturalHeight,
      );

      const drawWidth = birdImages[currentFrame].naturalWidth * scale;
      const drawHeight = birdImages[currentFrame].naturalHeight * scale;

      const x = (canvas.width - drawWidth) / 2;
      const y = (canvas.height - drawHeight) / 2;
      context.drawImage(birdImages[currentFrame], x, y, drawWidth, drawHeight);

      context.restore();
    };
    if (birdImages.length > 0) {
      requestAnimationFrame(update);
    }
    return () => {
      cancelAnimationFrame(animationFrameId);
    };
  }, [c.eCtx.birdSprite.normal]);

  return (
    <div className="flex flex-col gap-5 relative">
      {loading && (
        <div className="text-white flex flex-col justify-center items-center text-5xl w-full h-full bg-black/60 absolute">
          <p className="text-9xl animate-spin">*</p>
          <p>Loading...</p>
        </div>
      )}
      <div className="flex h-fit gap-4">
        <div className="bg-[#4EBFCA] w-1/2 aspect-square border-3 sm:border-5 border-white">
          <canvas
            className="w-full h-full bg-[#4EBFCA]"
            ref={canvasRef}
          ></canvas>
        </div>
        <div className="bg-[#2B1600] w-1/2 aspect-square border-3 sm:border-5 border-[#572D01]">
          {c.eCtx.birdSprite.normal.map((item, i) => {
            if (i == selectedFrame) {
              return (
                <div className="w-full flex h-1/3 bg-amber-600/60 border-4 sm:border-5 border-amber-500/80">
                  <div
                    onClick={i != 0 ? () => removeItem(i) : () => {}}
                    style={{ backgroundImage: `url(${item})` }}
                    className="h-full aspect-3/4 bg-black bg-no-repeat bg-center bg-contain shadow-[inset_0_0_0_5px_rgba(255,255,255,0.2)] flex justify-center items-center text-2xl text-white"
                  >
                    {i != 0 && (
                      <p className="bg-black/50 text-red-200 h-5 aspect-square flex justify-center items-center">
                        X
                      </p>
                    )}
                  </div>
                  <div className="w-full h-full flex justify-center items-center text-2xl sm:text-3xl text-white">
                    Frame {i + 1}
                  </div>
                </div>
              );
            }
            return (
              <div
                onClick={() => {
                  setSelectedFrame(i);
                }}
                className="w-full flex h-1/3 bg-amber-600/20 border-3 sm:border-5 border-amber-500/20"
              >
                <div
                  style={{ backgroundImage: `url(${item})` }}
                  className="h-full aspect-3/4 bg-contain bg-black bg-no-repeat bg-center shadow-[inset_0_0_0_5px_rgba(255,255,255,0.2)]"
                ></div>
                <div className="w-full h-full flex justify-center items-center text-2xl sm:text-3xl text-white">
                  Frame {i + 1}
                </div>
              </div>
            );
          })}

          {!(c.eCtx.birdSprite.normal.length > 2) && (
            <div
              onClick={() => {
                const newArr = structuredClone(c.eCtx.birdSprite.normal);
                newArr.push("");
                c.setECtx((p) => ({
                  ...p,
                  birdSprite: {
                    ...p.birdSprite,
                    normal: newArr,
                  },
                }));
                setSelectedFrame(c.eCtx.birdSprite.normal.length);
              }}
              className="w-full h-1/3 text-3xl text-white flex justify-center items-center "
            >
              + Add Frame
            </div>
          )}
        </div>
      </div>
      <div className="bg-[#2B1600] flex flex-col gap-3 w-full h-fit border-3 sm:border-5 border-[#572D01] p-3">
        <div className="w-full flex h-30">
          <div
            style={{
              backgroundImage: `url(${c.eCtx.birdSprite.normal[selectedFrame]})`,
            }}
            className="h-full aspect-square bg-black bg-contain bg-no-repeat bg-center [image-rendering:pixelated] border border-white text-white flex justify-center items-center"
          >
            {c.eCtx.birdSprite.normal[selectedFrame] === "" ? "None" : ""}
          </div>
          <div className="h-full px-5 w-full flex flex-col justify-center items-center">
            <p className="w-full text-center text-2xl sm:text-4xl text-white/50">
              Frame {selectedFrame + 1} Selected
            </p>
            <p className="w-full text-center text-xl sm:text-2xl text-white/50">
              Please Select a Square or 4:3 image
            </p>
          </div>
        </div>
        <div {...getRootProps()}>
          <Button text="Upload" onClick={() => {}} />
          <input {...getInputProps()} />
        </div>
      </div>
      <div className="bg-[#2B1600] flex flex-col gap-3 w-full h-fit border-3 sm:border-5 border-[#572D01] p-3">
        <div className="w-full flex h-30">
          <div className="h-full aspect-square bg-black border border-white text-white flex justify-center items-center">
            None
          </div>
          <div className="h-full px-5 w-full flex flex-col justify-center items-center">
            <p className="w-full text-center text-2xl sm:text-4xl text-white/50">
              On Death Sprite
            </p>
            <p className="w-full text-center text-xl sm:text-2xl text-white/50">
              Please Select a Square or 4:3 image
            </p>
          </div>
        </div>
        <Button text="Upload" onClick={() => {}} />
      </div>
    </div>
  );
};

export default Craft;
