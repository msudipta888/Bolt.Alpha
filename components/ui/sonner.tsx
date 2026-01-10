"use client"

import { Toaster as Sonner } from "sonner"

type ToasterProps = React.ComponentProps<typeof Sonner>

const Toaster = ({ ...props }: ToasterProps) => {
    return (
        <Sonner
            theme="dark"
            className="toaster group"
            toastOptions={{
                classNames: {
                    toast:
                        "group toast group-[.toaster]:bg-gray-800 group-[.toaster]:text-white group-[.toaster]:border-gray-700 group-[.toaster]:shadow-lg",
                    description: "group-[.toast]:text-gray-300",
                    actionButton:
                        "group-[.toast]:bg-blue-600 group-[.toast]:text-white",
                    cancelButton:
                        "group-[.toast]:bg-gray-700 group-[.toast]:text-gray-300",
                    error: "group-[.toast]:bg-red-900 group-[.toast]:text-red-100 group-[.toaster]:border-red-700",
                    success: "group-[.toast]:bg-green-900 group-[.toast]:text-green-100 group-[.toaster]:border-green-700",
                    warning: "group-[.toast]:bg-orange-900 group-[.toast]:text-orange-100 group-[.toaster]:border-orange-700",
                    info: "group-[.toast]:bg-blue-900 group-[.toast]:text-blue-100 group-[.toaster]:border-blue-700",
                },
            }}
            {...props}
        />
    )
}

export { Toaster }
