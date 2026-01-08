"use client"
import { useState, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  ResizableHandle,
  ResizablePanel,
  ResizablePanelGroup,
} from "@/components/ui/resizable";
import { ScrollArea } from "@/components/ui/scroll-area";
import {
  SandpackProvider,
  SandpackLayout,
  SandpackCodeEditor,
  SandpackPreview,
  SandpackFileExplorer
} from "@codesandbox/sandpack-react";
import DeployAndDownload from "./DeployAndDownload";
import { Button } from "@/components/ui/button";
import { Laptop, Smartphone, Tablet, Menu, X, Sun, Moon } from "lucide-react";


const VIEW_MODES: {
  key: "desktop" | "tablet" | "mobile";
  icon: React.ComponentType<any>;
  label: string;
  maxW: string;
  maxH: string;
}[] = [
    { key: "desktop", icon: Laptop, label: "Desktop", maxW: "w-full", maxH: "h-[90vh] max-h-[1024px]" },
    { key: "tablet", icon: Tablet, label: "Tablet", maxW: "max-w-[768px]", maxH: "h-[85vh] max-h-[1024px]" },
    { key: "mobile", icon: Smartphone, label: "Mobile", maxW: "max-w-[375px]", maxH: "h-[85vh] max-h-[812px]" },
  ];

export function Sandpack({ active, files }: { active: "code" | "preview"; files: Record<string, string> | Record<string, { code: string }> }) {
  const [viewMode, setViewMode] = useState<"desktop" | "tablet" | "mobile">(
    "desktop"
  );
  const [theme, setTheme] = useState<"dark" | "light">("dark");
  const [mobileMenu, setMobileMenu] = useState(false);

  const toggleTheme = () => setTheme((t) => (t === "dark" ? "light" : "dark"));
  const currentView = useMemo(
    () => VIEW_MODES.find((v) => v.key === viewMode)!,
    [viewMode]
  );

  const panelContainer = (
    <ResizablePanelGroup
      direction="horizontal"
      className="h-full rounded-lg border"
    >
      <ResizablePanel defaultSize={20} minSize={10}>
        <div className="h-screen overflow-y-auto border-r">
          <div className="p-2 border-b">
            <h3 className="text-sm font-semibold">Files</h3>
          </div>
          <SandpackFileExplorer className="h-screen" />
        </div>
      </ResizablePanel>
      <ResizableHandle />
      <ResizablePanel defaultSize={80}>
        <div className="h-full relative">
          <ScrollArea className="h-full">
            <SandpackCodeEditor
              showLineNumbers
              wrapContent
              style={{ height: "100vh", width: "100%", paddingRight: "10px", overflow: "hidden" }}
            />
          </ScrollArea>
        </div>
      </ResizablePanel>
    </ResizablePanelGroup>
  );

  return (
    <motion.div
      className={`flex flex-col h-[100vh]`}
      initial={{ opacity: 0 }}
      animate={{ opacity: 1, transition: { duration: 0.4 } }}
    >
      {active === "preview" && (<><header className="flex items-center justify-between p-4 border-b">
        <div className="flex items-center space-x-2">
          <Button
            size="sm"
            variant="ghost"
            className="md:hidden"
            onClick={() => setMobileMenu((o) => !o)}
          >
            {mobileMenu ? <X /> : <Menu />}
          </Button>
          {VIEW_MODES.map(({ key, icon: Icon }) => (
            <Button
              key={key}
              size="sm"
              variant={viewMode === key ? "default" : "outline"}
              onClick={() => setViewMode(key)}
              className="hidden md:flex h-8"
            >
              <Icon className="h-4 w-4" />
              <span className="ml-1 hidden lg:inline">{key}</span>
            </Button>
          ))}
        </div>
        <div className="flex items-center space-x-2">
          <Button size="sm" variant="ghost" onClick={toggleTheme}>
            {theme === "dark" ? <Sun /> : <Moon />}
          </Button>
          <DeployAndDownload files={files} />
        </div>
      </header>

        <AnimatePresence>
          {mobileMenu && (
            <motion.nav
              initial={{ x: "-100%" }}
              animate={{ x: 0 }}
              exit={{ x: "-100%" }}
              className="md:hidden p-4 border-b"
            >
              <div className="flex flex-col space-y-2">
                {VIEW_MODES.map(({ key, icon: Icon }) => (
                  <Button
                    key={key}
                    size="sm"
                    variant={viewMode === key ? "default" : "outline"}
                    onClick={() => setViewMode(key)}
                    className="flex-1 h-8"
                  >
                    <Icon className="h-4 w-4 mr-1" />
                    {key}
                  </Button>
                ))}
              </div>
            </motion.nav>
          )}
        </AnimatePresence>
      </>)}

      <SandpackProvider
        template="react"
        theme={theme}
        files={files}
        options={{
          autorun: true,
          autoReload: true,
          recompileDelay: 300,
          externalResources: ["https://cdn.tailwindcss.com"],
          initMode: "user-visible",
          initModeObserverOptions: { rootMargin: "1400px 0px" },
        }}
      >
        <SandpackLayout className="flex-1 flex overflow-hidden">
          {/* Code panel */}
          <motion.div
            key="code"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className={`${active === "code" ? "flex-1 flex flex-col" : "hidden"}`}
          >
            {panelContainer}
          </motion.div>

          {/* Preview panel */}
          <motion.div
            key="preview"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className={`${active === "preview" ? "flex-1 flex flex-col h-full" : "hidden"}`}
          >
            <div className="flex-1 w-full h-full flex items-center justify-center bg-gray-50/50 dark:bg-gray-900/50 p-4 overflow-hidden">
              <div
                className={`${currentView.maxW} ${currentView.maxH} w-full transition-all duration-300 
                    bg-white dark:bg-gray-950 rounded-lg shadow-2xl overflow-hidden border border-gray-200 dark:border-gray-800 flex flex-col`}
              >
                <SandpackPreview
                  showNavigator={true}
                  showOpenInCodeSandbox={false}
                  showRefreshButton={true}
                  showRestartButton={true}
                  className="w-full h-full !rounded-none"
                  style={{ height: "100%" }}
                />
              </div>
            </div>
          </motion.div>
        </SandpackLayout>


      </SandpackProvider>
    </motion.div>
  );
}
