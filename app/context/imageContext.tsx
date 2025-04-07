import { createContext } from "react";

export interface profileImage {
    url: string;
    alt: string;
  }
  
  export const ImageContext = createContext<{
    image: string | profileImage;
    setImage: React.Dispatch<React.SetStateAction<string | profileImage>>;
  }>({
    image: "",
    setImage: () => {},
  });