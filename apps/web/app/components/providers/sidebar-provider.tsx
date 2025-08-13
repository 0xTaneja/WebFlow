"use client"

import type React from "react"

import { SidebarProvider as BaseSidebarProvider } from "@/components/ui/sidebar"

export function SidebarProvider({ children, ...props }: React.ComponentProps<typeof BaseSidebarProvider>) {
  return <BaseSidebarProvider {...props}>{children}</BaseSidebarProvider>
}
