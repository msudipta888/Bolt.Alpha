"use client"
import {
    SandpackProvider,
    SandpackLayout,
    SandpackCodeEditor,
    SandpackPreview,
    SandpackFileExplorer,
  } from "@codesandbox/sandpack-react";
import Lookup from "../AiPage/Lookup";
import { useState } from "react";
  
const CodeAndPreview= ({mergedFiles}:any) => {
    const [files,setFiles] = useState(Lookup.DEFAULT_FILE);
    if(mergedFiles){
        setFiles(mergedFiles)
    }
 return(  
     <SandpackProvider template="react" theme="dark" className="h-screen w-1/2" 
    customSetup={{
        dependencies:{
            ...Lookup.DEPENDANCY
        }
    }}
    files={files}
    >
      <SandpackLayout >
        <SandpackFileExplorer style={{height:"80vh"}} />
        <SandpackCodeEditor style={{height:"80vh"}} />
        <SandpackPreview style={{height:"80vh"}} showNavigator={true}/>
      </SandpackLayout>
    </SandpackProvider>
 )
};
  
  export default CodeAndPreview;