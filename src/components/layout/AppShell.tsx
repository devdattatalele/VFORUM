"use client"

import React from "react"
import { useAuth } from "@/contexts/AuthContext"
import { ThemeProvider } from "@/contexts/ThemeContext"
import { usePathname } from "next/navigation"
import Header from "./Header"
import AppSidebar from "./AppSidebar"
import {
  SidebarProvider,
  SidebarInset,
  SidebarRail,
} from "@/components/ui/sidebar"

interface AppShellProps {
  children: React.ReactNode
}

export default function AppShell({ children }: AppShellProps) {
  const { user, loading } = useAuth()
  const pathname = usePathname()

  // Don't show sidebar/header only for auth page
  const isAuthPage = pathname === "/auth"

  if (isAuthPage) {
    // Clean layout for auth page
    return (
      <ThemeProvider>
        <div className="min-h-screen bg-background">{children}</div>
      </ThemeProvider>
    )
  }

  if (loading) {
    // Show minimal layout while loading
    return (
      <ThemeProvider>
        <div className="flex min-h-screen items-center justify-center bg-background">
          <div className="h-8 w-8 animate-spin rounded-full border-b-2 border-blue-500"></div>
        </div>
      </ThemeProvider>
    )
  }

  // Full app layout with sidebar for everyone (authenticated and non-authenticated)
  return (
    <ThemeProvider>
      <SidebarProvider defaultOpen={true}>
        <AppSidebar />
        <SidebarRail />
        <SidebarInset className="flex min-h-screen flex-col">
          <Header />
          <main className="flex-1 animate-fadeIn space-y-4 p-4">
            <div className="mx-auto max-w-7xl">{children}</div>
          </main>
          <footer className="mt-16 border-t bg-muted/30 px-4 py-12">
            <div className="container mx-auto flex max-w-7xl flex-col items-center justify-center gap-6 md:flex-row md:justify-between">
              <p className="text-balance text-center text-sm leading-loose text-muted-foreground md:text-left">
                Built by{" "}
                <span className="font-medium text-foreground">
                  Devdatta Talele
                </span>
                , for VIT students. Powered by{" "}
                <span className="font-medium text-primary">
                  VForums And Events
                </span>
                .
              </p>
              <div className="flex items-center gap-4 text-sm text-muted-foreground">
                <span>© 2025 VForums</span>
                <span className="text-muted-foreground/50">•</span>
                <span>Open Source</span>
                <span className="text-muted-foreground/50">•</span>
                <span>Made with ❤️</span>
              </div>
            </div>
          </footer>
        </SidebarInset>
      </SidebarProvider>
    </ThemeProvider>
  )
}
