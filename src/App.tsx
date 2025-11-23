import { BrowserRouter, Route, Routes } from "react-router-dom";
import Home from "./Pages/Home";
import Game from "./Pages/Game";
import Craft from "./Pages/Crafter";
import { useState } from "react";
import schemaAndData from "./AllTheCrazyReactGoodies/ctxSchema";
import FlappyCtx from "./AllTheCrazyReactGoodies/ContextProvider";

function App() {
  const [eCtx, setECtx] = useState(schemaAndData);
  const [gameCtx, setGameCtx] = useState(schemaAndData);
  return (
    <FlappyCtx.Provider value={{ eCtx, setECtx, gameCtx, setGameCtx }}>
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/game" element={<Game />} />
          <Route path="/craft" element={<Craft />} />
        </Routes>
      </BrowserRouter>
    </FlappyCtx.Provider>
  );
}

export default App;
