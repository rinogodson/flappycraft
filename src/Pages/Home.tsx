import { useEffect } from "react";
import Btn from "../Components/Btn";

function Home() {
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
    document.body.style.backgroundColor = "#5DE371";
    setThemeColor("#4DC0CA");
    return () => {
      document.body.style.backgroundColor = "";
    };
  }, []);
  return (
    <>
      <div className="z-10 relative w-svw flex flex-col gap-20 sm:justify-center justify-start pt-20 sm:pt-0 items-center h-svh overflow-hidden bg-[#4ec0ca] bg-[url('/bg.png')] bg-bottom bg-repeat-x md:bg-repeat-x">
        <img src="/FlappyCraft.svg" className="animate-float sm:w-100 w-6/8" />
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
              window.alert(
                "The Crafting section is under construction. You can still create flap files: READ THE README!!",
              );
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
