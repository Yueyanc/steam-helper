import { createContext } from "react";

export const GlobalContext = createContext<{ root?: HTMLElement }>({});
