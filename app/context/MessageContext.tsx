import { createContext } from "react";
export interface Message{
    role:string,
    content:string[]
 }
export interface MessageContextType {
   mes:Message[],
   setMes: React.Dispatch<React.SetStateAction<Message[]>>
  }
export const MessageContext = createContext<MessageContextType | null>(null);
