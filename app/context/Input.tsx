import React, { createContext } from "react";
export interface Input{
  input:string,
  setInput: React.Dispatch<React.SetStateAction<string>>
}
export const inputContext = createContext<Input | null>(null);