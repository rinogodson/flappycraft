import {
  useState,
  createContext,
  type ReactElement,
  type Dispatch,
  type SetStateAction,
} from "react";
import schemaAndData from "./ctxSchema";

type schemaType = {
  eCtx: typeof schemaAndData;
  setECtx: Dispatch<SetStateAction<typeof schemaAndData>>;
};

const EditorCtx = createContext<schemaType>({} as schemaType);

export const EditorCtxProvider = ({ children }: { children: ReactElement }) => {
  const [eCtx, setECtx] = useState(schemaAndData);

  return (
    <EditorCtx.Provider value={{ eCtx, setECtx }}>
      {children}
    </EditorCtx.Provider>
  );
};
