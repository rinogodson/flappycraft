import { createContext, type Dispatch, type SetStateAction } from "react";
import schemaAndData from "./ctxSchema";

export type schemaType = {
  eCtx: typeof schemaAndData;
  setECtx: Dispatch<SetStateAction<typeof schemaAndData>>;
  gameCtx: typeof schemaAndData;
  setGameCtx: Dispatch<SetStateAction<typeof schemaAndData>>;
};

const FlappyCtx = createContext<schemaType>({} as schemaType);

export default FlappyCtx;
