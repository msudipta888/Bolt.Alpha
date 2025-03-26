import { createContext } from "react"

export interface Active{
    active: string,
    setActive: React.Dispatch<React.SetStateAction<string>>
}
export const ActiveContext = createContext<Active | string>('code');