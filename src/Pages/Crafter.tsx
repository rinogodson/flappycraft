function Craft() {
  return (
    <div className="w-screen h-screen flex justify-center items-center bg-[#2b2b2b]">
      <div className="w-full h-full bg-black sm:w-150 sm:h-200 relative overflow-hidden sm:border-20 sm:border-b-0 sm:border-[#E66100] sm:shadow-[inset_0_0_0px_4px_#542B01,0_0_0_3px_black]">
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

export default Craft;
