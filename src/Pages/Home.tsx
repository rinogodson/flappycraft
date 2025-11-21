import Btn from "../Components/Btn";

function Home() {
  return (
    <>
      <div className="z-10 relative w-svw flex flex-col gap-20 sm:justify-center justify-start pt-20 sm:pt-0 items-center h-svh overflow-hidden bg-[#4ec0ca] bg-[url('/bg.png')] bg-bottom bg-repeat-x md:bg-repeat-x">
        <img src="/FlappyCraft.svg" className="animate-float sm:w-100" />
        <div className="w-100 flex flex-col px-10 gap-10">
          <Btn
            onClick={() => {
              window.location.href = "/game";
            }}
          >
            <>Play a Game</>
          </Btn>
          <Btn
            onClick={() => {
              window.location.href = "/craft";
            }}
          >
            <>Create a Game</>
          </Btn>
        </div>
      </div>
    </>
  );
}

export default Home;
