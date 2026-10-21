import AccountMenu from "@/components/layout/AccountMenu"
import {
  SidebarInset,
  SidebarProvider,
  SidebarTrigger,
} from "@/components/ui/sidebar"
import { ThemeToggle } from "@/components/ui/theme-toggle"
import WorkspaceSidebar from "@/components/workspace/WorkspaceSidebar"

// Moderation and administration: sidebar navigation, as in vboard's dashboard.
export default function WorkspaceLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <SidebarProvider>
      <WorkspaceSidebar />
      <SidebarInset>
        <header className="sticky top-0 z-30 flex h-16 items-center gap-2 border-b bg-background/80 px-4 backdrop-blur md:px-6">
          <SidebarTrigger aria-label="Toggle sidebar" />
          <div className="ml-auto flex items-center gap-1.5">
            <ThemeToggle />
            <AccountMenu />
          </div>
        </header>
        <div className="mx-auto w-full max-w-6xl flex-1 px-4 py-8 md:px-6">
          {children}
        </div>
      </SidebarInset>
    </SidebarProvider>
  )
}
