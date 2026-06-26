"use client"

import * as React from "react"

import { cn } from "@/lib/utils"

function Separator({
  className,
  orientation,
  ...props
}: React.ComponentProps<"div"> & { orientation?: 'horizontal' | 'vertical' }) {
  return (
    <div
      data-slot="separator"
      className={cn(
        "shrink-0 bg-gray-200",
        orientation === "vertical" ? "h-full w-px" : "h-px w-full",
        className
      )}
      {...props}
    />
  )
}

export { Separator }