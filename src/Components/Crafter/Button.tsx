function Button({ text, onClick }: { text: string; onClick: () => void }) {
  return (
    <div
      onClick={onClick}
      className="w-full bg-[#E66001] flex justify-center items-center px-5 cursor-pointer py-1  text-3xl active:bg-[#FF7F24] active:shadow-[0_0_0_2px_#542B01,0_2px_0_0px_#542B01] active:translate-y-0.5 border-white border-3 text-white shadow-[0_0_0_2px_#542B01,0_2px_0_2px_#542B01]"
    >
      {text}
    </div>
  );
}

export default Button;
