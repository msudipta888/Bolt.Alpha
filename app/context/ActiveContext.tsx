import { createContext } from "react"

export interface Active {
    active: "code" | "preview",
    setActive: React.Dispatch<React.SetStateAction<"code" | "preview">>
}
export const ActiveContext = createContext<Active | string>('code');