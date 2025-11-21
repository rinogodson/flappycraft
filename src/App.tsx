import { BrowserRouter, Route, Routes } from "react-router-dom";
import Home from "./Pages/Home";
import Game from "./Pages/Game";
import Craft from "./Pages/Crafter";
import { EditorCtxProvider } from "./AllTheCrazyReactGoodies/ContextProvider";

function App() {
  return (
    <EditorCtxProvider>
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/game" element={<Game />} />
          <Route path="/craft" element={<Craft />} />
        </Routes>
      </BrowserRouter>
    </EditorCtxProvider>
  );
}

export default App;
