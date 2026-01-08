"use client"
import * as React from "react"
import * as Radix from "@radix-ui/react-scroll-area"
import { cn } from "@/lib/utils"

export interface ScrollAreaProps extends React.ComponentProps<typeof Radix.Root> {}

export function ScrollArea({ children, className, ...props }: ScrollAreaProps) {
  return (
    <Radix.Root
      {...props}
      className={cn("relative overflow-hidden", className)}
    >
      <Radix.Viewport className="w-full h-full">
        {children}
      </Radix.Viewport>

      {/* vertical scrollbar */}
      <Radix.Scrollbar
        orientation="vertical"
        className="flex h-full w-2 p-px bg-transparent hover:bg-gray-200"
      >
        <Radix.Thumb className="flex-1 bg-gray-400 rounded-full" />
      </Radix.Scrollbar>

      {/* horizontal scrollbar (optional) */}
      <Radix.Scrollbar
        orientation="horizontal"
        className="flex w-full h-2 p-px bg-transparent hover:bg-gray-200"
      >
        <Radix.Thumb className="flex-1 bg-gray-400 rounded-full" />
      </Radix.Scrollbar>

      <Radix.Corner />
    </Radix.Root>
  )
}
