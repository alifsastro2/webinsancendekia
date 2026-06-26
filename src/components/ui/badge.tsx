import * as React from "react"
import { cn } from "@/lib/utils"

function Badge({
  className,
  variant = "default",
  ...props
}: React.ComponentProps<"span"> & { variant?: "default" | "secondary" | "destructive" | "outline" | "ghost" }) {
  const variants = {
    default: "bg-blue-100 text-blue-700",
    secondary: "bg-gray-100 text-gray-700",
    destructive: "bg-red-100 text-red-700",
    outline: "border border-gray-200 text-gray-700",
    ghost: "hover:bg-gray-100 text-gray-700",
  }

  return (
    <span
      className={cn(
        "inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium transition-colors",
        variants[variant],
        className
      )}
      {...props}
    />
  )
}

export { Badge }