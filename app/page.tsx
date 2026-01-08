"use client";
import { TooltipProvider } from '@/components/ui/tooltip';
import Index from "./Pages/Index";

export default function Home() {
  return (
    <div className="h-[100vh] w-[100vw] text-white">
      <TooltipProvider>
        <Index />
      </TooltipProvider>
    </div>
  );
}
