import React, { createContext } from "react";
export interface Action{
  action:string,
  setAction: React.Dispatch<React.SetStateAction<string>>
}
export const actionContext = createContext<Action | null>(null);