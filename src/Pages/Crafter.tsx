import { useEffect } from "react";
import Btn from "../Components/Btn";
import Button from "../Components/Crafter/Button";

function Craft() {
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
        <div className="w-full h-[calc(100%-4rem)] p-5  font-jersey overflow-y-scroll">
          <BirdSprite />
          <div className="h-40 w-full "></div>
        </div>
        <div className="bg-[#572D01] h-20 w-[calc(100%-2rem)] absolute bottom-20 translate-x-[50%] right-[50%] shadow-[0_0_0_10px_rgba(0,0,0,0.5)]"></div>
        <div className="grid grid-cols-[4rem_1fr_4rem]  text-white font-jersey w-full h-16 bg-[#E66100] absolute bottom-0 sm:shadow-[0_-2px_0_2px_#542B01] shadow-[0_-2px_0_2px_white,0_-4px_0_4px_#542B01]">
          <div className="w-full h-full flex justify-center items-center active:scale-95 active:brightness-90">
            <img src="/leftar.svg" />
          </div>
          <div className="text-shadow-[0_2px_0px_rgba(0,0,0,0.25)]  w-full flex justify-center items-center flex-col text-3xl">
            <p>Bird Sprite</p>
            <div className="flex gap-1">
              {Array.from({ length: 5 }, (_, i) => i + 1).map((item) => {
                if (item < 2) {
                  return <div className="w-2 aspect-square bg-white"></div>;
                }
                return <div className="w-2 aspect-square bg-black/25"></div>;
              })}
            </div>
          </div>
          <div className="w-full h-full flex justify-center items-center active:scale-95 active:brightness-90">
            <img src="/rightar.svg" />
          </div>
        </div>
      </div>
    </div>
  );
}

const BirdSprite = () => {
  return (
    <div className="flex flex-col gap-5">
      <div className="flex h-fit gap-4">
        <div className="bg-[#4EBFCA] w-1/2 aspect-square border-3 sm:border-5 border-white"></div>
        <div className="bg-[#2B1600] w-1/2 aspect-square border-3 sm:border-5 border-[#572D01]">
          {Array.from({ length: 2 }, (_, i) => i + 1).map((item) => {
            if (item == 2) {
              return (
                <div className="w-full flex h-1/3 bg-amber-600/60 border-4 sm:border-5 border-amber-500/80">
                  <div className="h-full aspect-3/4 bg-black shadow-[inset_0_0_0_5px_rgba(255,255,255,0.2)] flex justify-center items-center text-2xl text-white">
                    X
                  </div>
                  <div className="w-full h-full flex justify-center items-center text-2xl sm:text-3xl text-white">
                    Frame {item}
                  </div>
                </div>
              );
            }
            return (
              <div className="w-full flex h-1/3 bg-amber-600/20 border-3 sm:border-5 border-amber-500/40">
                <div className="h-full aspect-3/4 bg-black shadow-[inset_0_0_0_5px_rgba(255,255,255,0.2)]"></div>
                <div className="w-full h-full flex justify-center items-center text-2xl sm:text-3xl text-white">
                  Frame {item}
                </div>
              </div>
            );
          })}

          <div className="w-full h-1/3 text-3xl text-white flex justify-center items-center ">
            + Add New
          </div>
        </div>
      </div>
      <div className="bg-[#2B1600] flex flex-col gap-3 w-full h-fit border-3 sm:border-5 border-[#572D01] p-3">
        <div className="w-full flex h-30">
          <div className="h-full aspect-square bg-black border border-white text-white flex justify-center items-center">
            None
          </div>
          <div className="h-full w-full flex justify-center items-center">
            <p className="w-full text-center text-4xl sm:text-4xl text-white/50">
              Frame 2 Selected
            </p>
          </div>
        </div>
        <Button text="Upload" onClick={() => {}} />
      </div>
      <div className="bg-[#2B1600] flex flex-col gap-3 w-full h-fit border-3 sm:border-5 border-[#572D01] p-3">
        <div className="w-full flex h-30">
          <div className="h-full aspect-square bg-black border border-white text-white flex justify-center items-center">
            None
          </div>
          <div className="h-full w-full flex justify-center items-center">
            <p className="w-full text-center text-4xl sm:text-4xl text-white/50">
              On Death Sprite
            </p>
          </div>
        </div>
        <Button text="Upload" onClick={() => {}} />
      </div>
    </div>
  );
};

export default Craft;
