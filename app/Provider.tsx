"use client";

import { ReactNode, useState } from "react";
import { ClerkProvider } from "@clerk/nextjs";
import { ImageContext, profileImage } from "./context/imageContext";
import { MessageContext, Message } from "./context/MessageContext";
import { ActiveContext } from "./context/ActiveContext";
import { actionContext } from "./context/Action";

export default function Providers({ children }: { children: ReactNode }) {
  const [mes, setMes] = useState<Message[]>([]);
  const [action, setAction] = useState("null");
  const [active, setActive] = useState<"code" | "preview">("code");
  const [image, setImage] = useState<profileImage | string>("");

  return (
    <ClerkProvider>
      <ImageContext.Provider value={{ image, setImage }}>
        <MessageContext.Provider value={{ mes, setMes }}>
          <actionContext.Provider value={{ action, setAction }}>
            <ActiveContext.Provider value={{ active, setActive }}>
              {children}
            </ActiveContext.Provider>
          </actionContext.Provider>
        </MessageContext.Provider>
      </ImageContext.Provider>
    </ClerkProvider>
  );
}
