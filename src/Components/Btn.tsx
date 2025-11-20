import type { ReactElement } from "react";

function Btn({ children }: { children: ReactElement }) {
  return (
    <div className="w-full bg-[#E66001] flex justify-center items-center px-5 cursor-pointer py-2 active:bg-[#FF7F24] active:shadow-[0_0_0_4px_#542B01,0_3px_0_0px_#542B01] active:translate-y-[5px] border-white border-4 text-white shadow-[0_0_0_4px_#542B01,0_4px_0_4px_#542B01]">
      <p className="sm:text-5xl text-5xl text-center font-jersey text-shadow-[0_3px_0px_rgba(0,0,0,0.25)] w-full h-full active:text-shadow-none">
        {children}
      </p>
    </div>
  );
}

export default Btn;
