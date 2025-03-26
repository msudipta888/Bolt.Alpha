import { useEffect, useState } from "react"
import {WebContainer} from '@webcontainer/api'
export const useWebcontainer=()=>{
const [webcontainer, setWebcontainer] = useState<WebContainer>();
const main =async()=>{
    const webcontainerInstance = await WebContainer.boot();
    setWebcontainer(webcontainerInstance);
}
    useEffect(()=>{
   main();
    },[]);
    return webcontainer;
}