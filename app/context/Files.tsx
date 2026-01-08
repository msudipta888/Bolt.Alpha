import { createContext } from "react";
type FileNode = {
  file: {
    code: string;
  };
};
export interface FilesContext {
  files: FileNode,
  setFiles: React.Dispatch<React.SetStateAction<FileNode>>
}
export const fileContext = createContext<FilesContext | null>(null)