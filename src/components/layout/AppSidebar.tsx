"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { cn } from "@/lib/utils"
import { COMMUNITIES, NAV_LINKS } from "@/lib/constants"
import { ScrollArea } from "@/components/ui/scroll-area"
import TagsSidebar from "./TagsSidebar"
import {
  Sidebar,
  SidebarContent,
  SidebarHeader,
  SidebarFooter,
  SidebarMenu,
  SidebarMenuItem,
  SidebarMenuButton,
  SidebarGroup,
  SidebarGroupLabel,
  SidebarSeparator,
  SidebarTrigger,
  useSidebar,
} from "@/components/ui/sidebar"
import { Zap, Crown } from "lucide-react"
import { useAuth } from "@/contexts/AuthContext"
import { isAdmin } from "@/lib/utils/userUtils"
import { useEffect, useState } from "react"

export default function AppSidebar() {
  const pathname = usePathname()
  const { user } = useAuth()
  const { isMobile, state, openMobile, setOpenMobile } = useSidebar()
  const [isHovered, setIsHovered] = useState(false)

  const isNavLinkActive = (href: string) => {
    if (href === "/") return pathname === href
    if (href.includes("[") && href.includes("]")) {
      const baseHref = href.substring(0, href.indexOf("["))
      return pathname.startsWith(baseHref)
    }
    return pathname.startsWith(href)
  }

  return (
    <Sidebar
      collapsible="icon"
      variant="sidebar"
      side="left"
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      className={cn(isHovered ? "hover:expanded" : "", "group")}
    >
      <SidebarHeader className="border-b border-sidebar-border p-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="relative flex h-8 w-8 items-center justify-center rounded-lg bg-gradient-to-br from-blue-500 to-blue-600 shadow-sm">
              <Zap className="h-4 w-4 text-white" />
            </div>
            <span className="whitespace-nowrap text-lg font-semibold text-sidebar-foreground group-data-[collapsible=icon]:hidden">
              VForums And Events
            </span>
          </div>
          <SidebarTrigger className="h-8 w-8 rounded-md p-1.5 transition-colors duration-200 hover:bg-sidebar-accent hover:text-sidebar-accent-foreground" />
        </div>
      </SidebarHeader>

      <SidebarContent className="p-0">
        <ScrollArea className="h-full">
          <SidebarMenu className="space-y-1 px-2 py-4">
            {NAV_LINKS.map((link) => (
              <SidebarMenuItem key={link.href}>
                <Link href={link.href} className="w-full">
                  <SidebarMenuButton
                    isActive={isNavLinkActive(link.href)}
                    tooltip={{ children: link.label, side: "right" }}
                    className={cn(
                      "h-10 rounded-lg border border-transparent text-sm font-medium transition-all duration-200",
                      isNavLinkActive(link.href)
                        ? "border-blue-200 bg-blue-50 text-blue-600 dark:border-blue-800 dark:bg-blue-950/20 dark:text-blue-400"
                        : "text-sidebar-foreground hover:border-sidebar-border hover:bg-sidebar-accent hover:text-sidebar-accent-foreground"
                    )}
                  >
                    <link.icon className="h-4 w-4 flex-shrink-0" />
                    <span className="truncate">{link.label}</span>
                  </SidebarMenuButton>
                </Link>
              </SidebarMenuItem>
            ))}

            {/* Admin Link - Only show for admin users */}
            {user && isAdmin(user) && (
              <SidebarMenuItem>
                <Link href="/admin" className="w-full">
                  <SidebarMenuButton
                    isActive={pathname === "/admin"}
                    tooltip={{ children: "Admin Panel", side: "right" }}
                    className="h-10 rounded-lg border border-transparent text-sm font-medium text-red-600 transition-all duration-200 hover:border-red-200 hover:bg-red-50 hover:text-red-700 dark:text-red-400 dark:hover:border-red-800 dark:hover:bg-red-950/20 dark:hover:text-red-300"
                  >
                    <Crown className="h-4 w-4 flex-shrink-0" />
                    <span className="truncate">Admin Panel</span>
                  </SidebarMenuButton>
                </Link>
              </SidebarMenuItem>
            )}
          </SidebarMenu>

          <SidebarSeparator className="mx-2" />

          <SidebarGroup className="pt-4">
            <SidebarGroupLabel className="px-4 pb-2 text-xs font-semibold text-sidebar-foreground/70">
              Communities
            </SidebarGroupLabel>
            <SidebarMenu className="space-y-1 px-2">
              {COMMUNITIES.map((community) => (
                <SidebarMenuItem key={community.id}>
                  <Link href={`/community/${community.id}`} className="w-full">
                    <SidebarMenuButton
                      isActive={
                        community.id !== "all" &&
                        pathname === `/community/${community.id}`
                      }
                      tooltip={{ children: community.name, side: "right" }}
                      className={cn(
                        "h-9 rounded-lg border border-transparent text-sm font-medium transition-all duration-200",
                        community.id !== "all" &&
                          pathname === `/community/${community.id}`
                          ? "border-blue-200 bg-blue-50 text-blue-600 dark:border-blue-800 dark:bg-blue-950/20 dark:text-blue-400"
                          : "text-sidebar-foreground hover:border-sidebar-border hover:bg-sidebar-accent hover:text-sidebar-accent-foreground"
                      )}
                    >
                      {community.icon && (
                        <community.icon className="h-4 w-4 flex-shrink-0" />
                      )}
                      <span className="truncate">{community.name}</span>
                    </SidebarMenuButton>
                  </Link>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroup>

          <SidebarSeparator className="mx-2" />

          {/* Tags Section */}
          <SidebarGroup className="pt-4 group-data-[collapsible=icon]:hidden">
            <SidebarGroupLabel className="px-4 pb-2 text-xs font-semibold text-sidebar-foreground/70">
              Browse by Tags
            </SidebarGroupLabel>
            <div className="px-4">
              <TagsSidebar />
            </div>
          </SidebarGroup>
        </ScrollArea>
      </SidebarContent>

      <SidebarFooter className="border-t border-sidebar-border p-4">
        <div className="text-center text-xs font-medium text-sidebar-foreground/70 group-data-[collapsible=icon]:hidden">
          Built by Devdatta Talele, for VIT students
        </div>
      </SidebarFooter>
    </Sidebar>
  )
}
