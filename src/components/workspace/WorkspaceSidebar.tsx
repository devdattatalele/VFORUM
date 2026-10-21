"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import {
  ArrowLeft,
  BarChart3,
  Flag,
  ScrollText,
  Users,
  type LucideIcon,
} from "lucide-react"
import Wordmark from "@/components/layout/Wordmark"
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from "@/components/ui/sidebar"
import { useAuth } from "@/contexts/AuthContext"
import { hasPermission } from "@/lib/utils/userUtils"

type Item = {
  href: string
  label: string
  icon: LucideIcon
  permission: string
}

// Capability-filtered destinations, like vboard's dashboard sidebar.
export const WORKSPACE_ITEMS: Item[] = [
  {
    href: "/admin",
    label: "Analytics",
    icon: BarChart3,
    permission: "manage_users",
  },
  {
    href: "/moderation",
    label: "Moderation",
    icon: Flag,
    permission: "moderate_forums",
  },
  {
    href: "/admin/members",
    label: "Members",
    icon: Users,
    permission: "manage_users",
  },
  {
    href: "/admin/audit",
    label: "Audit log",
    icon: ScrollText,
    permission: "manage_users",
  },
]

export default function WorkspaceSidebar() {
  const pathname = usePathname()
  const { user } = useAuth()
  const items = WORKSPACE_ITEMS.filter((i) => hasPermission(user, i.permission))
  // Only the longest matching destination is active.
  const active = items
    .filter((i) => pathname === i.href || pathname.startsWith(`${i.href}/`))
    .sort((a, b) => b.href.length - a.href.length)[0]?.href

  return (
    <Sidebar>
      <SidebarHeader className="h-16 justify-center px-4">
        <Wordmark />
      </SidebarHeader>
      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupLabel className="font-mono text-[11px] uppercase tracking-wider">
            Workspace
          </SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {items.map((item) => (
                <SidebarMenuItem key={item.href}>
                  <SidebarMenuButton asChild isActive={item.href === active}>
                    <Link href={item.href}>
                      <item.icon />
                      <span>{item.label}</span>
                    </Link>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>
      <SidebarFooter>
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton asChild>
              <Link href="/qna">
                <ArrowLeft />
                <span>Back to the forum</span>
              </Link>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarFooter>
    </Sidebar>
  )
}
