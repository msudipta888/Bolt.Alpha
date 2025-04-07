// "use client";
// import { useEffect, useRef, useState } from "react";
// import { getWebContainer, teardownWebContainer } from "../../lib/Webcontainer";
// import { Files } from "./File";
// import { WebContainer } from "@webcontainer/api";

// export default function WebContainerPreview() {
//   const iframeRef = useRef<HTMLIFrameElement>(null);
//   const [loading, setLoading] = useState(true);
//   const [error, setError] = useState<string | null>(null);
//   const serverProcessRef = useRef<any>(null);

//   useEffect(() => {
//     let isMounted = true;
//     let wc: WebContainer | null = null;

//     const initialize = async () => {
//       try {
//         wc = await getWebContainer();
//         if (!isMounted) return;

//         // Mount files only if not already mounted
//         if (!(await wc.fs.readdir('/')).length) {
//           await wc.mount(Files);
//         }

//         // Install dependencies
//         const installProcess = await wc.spawn('npm', ['install']);
//         await installProcess.exit;

//         // Start dev server
//         serverProcessRef.current = await wc.spawn('npm', ['run', 'dev']);
//         serverProcessRef.current.output.pipeTo(new WritableStream({
//           write(data) { console.log('[SERVER]', data); }
//         }));

//         wc.on('server-ready', (port, url) => {
//             console.log(`Server ready at http://localhost:${port}`)
//           if (isMounted && iframeRef.current) {
//             iframeRef.current.src = url;
//             setLoading(false);
//           }
//         });
//       } catch (err) {
//         if (isMounted) {
//           setError(err instanceof Error ? err.message : 'Failed to initialize WebContainer');
//           setLoading(false);
//         }
//       }
//     };

//     initialize();

//     return () => {
//       isMounted = false;
//       // Cleanup server process but keep WebContainer instance
//       if (serverProcessRef.current) {
//         serverProcessRef.current.kill();
//       }
//     };
//   }, []);

//   // Full teardown when component unmounts
//   useEffect(() => {
//     return () => {
//       teardownWebContainer();
//     };
//   }, []);

//   return (
//     <div className="h-full w-full relative bg-gray-900">
//       {loading && (
//         <div className="absolute inset-0 flex items-center justify-center bg-gray-900/80">
//           <div className="text-gray-300 text-sm flex items-center">
//             <svg className="animate-spin h-5 w-5 mr-3" viewBox="0 0 24 24">
//               <circle cx="12" cy="12" r="10" fill="none" strokeWidth="2" 
//                 stroke="currentColor" strokeLinecap="round" className="opacity-25"/>
//               <path d="M4 12a8 8 0 018-8V0" stroke="currentColor" 
//                 strokeWidth="2" strokeLinecap="round" className="opacity-75"/>
//             </svg>
//             Starting preview environment...
//           </div>
//         </div>
//       )}
      
//       {error && (
//         <div className="absolute inset-0 flex items-center justify-center bg-red-900/20">
//           <div className="text-red-400 text-sm p-4 bg-red-900/30 rounded-lg">
//             Error: {error}
//           </div>
//         </div>
//       )}

//       <iframe 
//         ref={iframeRef}
//         className="w-full h-full border-none"
//         sandbox="allow-scripts allow-same-origin"
//       />
//     </div>
//   );
// }