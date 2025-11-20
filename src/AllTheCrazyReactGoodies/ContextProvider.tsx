import {
  useState,
  createContext,
  type ReactElement,
  type Dispatch,
  type SetStateAction,
} from "react";

const EditorCtx = createContext<{
  eCtx: null;
  setECtx: Dispatch<SetStateAction<null>>;
}>(
  {} as {
    eCtx: null;
    setECtx: Dispatch<SetStateAction<null>>;
  },
);

export const EditorCtxProvider = ({ children }: { children: ReactElement }) => {
  const [eCtx, setECtx] = useState(null);

  return (
    <EditorCtx.Provider value={{ eCtx, setECtx }}>
      {children}
    </EditorCtx.Provider>
  );
};
