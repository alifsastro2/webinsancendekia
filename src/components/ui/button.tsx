import * as React from "react"

import { cn } from "@/lib/utils"

function Button({
  className,
  variant = "default",
  size = "default",
  ...props
}: React.ComponentProps<"button"> & {
  variant?: "default" | "outline" | "secondary" | "ghost" | "destructive"
  size?: "default" | "sm" | "lg" | "icon"
}) {
  const variants = {
    default: "bg-blue-600 text-white hover:bg-blue-700",
    outline: "border border-gray-200 bg-white hover:bg-gray-50",
    secondary: "bg-gray-100 text-gray-900 hover:bg-gray-200",
    ghost: "hover:bg-gray-100",
    destructive: "bg-red-600 text-white hover:bg-red-700",
  }

  const sizes = {
    default: "h-10 px-4 py-2 text-sm rounded-xl",
    sm: "h-8 px-3 text-xs rounded-lg",
    lg: "h-11 px-6 text-base rounded-xl",
    icon: "h-10 w-10 rounded-xl",
  }

  return (
    <button
      className={cn(
        "inline-flex items-center justify-center gap-2 font-medium transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500/50 disabled:opacity-50 disabled:pointer-events-none",
        variants[variant],
        sizes[size],
        className
      )}
      {...props}
    />
  )
}

export { Button }