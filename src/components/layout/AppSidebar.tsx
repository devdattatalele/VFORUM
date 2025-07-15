"use client";

import Link from 'next/link';
import { usePathname } from 'next/navigation'; 
import { cn } from '@/lib/utils';
import { COMMUNITIES, NAV_LINKS } from '@/lib/constants';
import { ScrollArea } from '@/components/ui/scroll-area';
import TagsSidebar from './TagsSidebar';
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
  useSidebar
} from '@/components/ui/sidebar';
import { Zap, Crown } from 'lucide-react'; 
import { useAuth } from '@/contexts/AuthContext';
import { isAdmin } from '@/lib/utils/userUtils';
import { useEffect, useState } from 'react';

export default function AppSidebar() {
  const pathname = usePathname();
  const { user } = useAuth();
  const { isMobile, state, openMobile, setOpenMobile } = useSidebar();
  const [isHovered, setIsHovered] = useState(false);
  
  const isNavLinkActive = (href: string) => {
     if (href === '/') return pathname === href;
     if (href.includes('[') && href.includes(']')) {
       const baseHref = href.substring(0, href.indexOf('['));
       return pathname.startsWith(baseHref);
     }
     return pathname.startsWith(href);
  };

  return (
    <Sidebar 
      collapsible="icon" 
      variant="sidebar" 
      side="left"
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      className={cn(isHovered ? "hover:expanded" : "", "group")}
    >
      <SidebarHeader className="p-4 border-b border-sidebar-border">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="relative w-8 h-8 bg-gradient-to-br from-blue-500 to-blue-600 rounded-lg shadow-sm flex items-center justify-center">
              <Zap className="h-4 w-4 text-white" />
            </div>
            <span className="text-lg font-semibold text-sidebar-foreground group-data-[collapsible=icon]:hidden whitespace-nowrap">
              VForums And Events
            </span>
          </div>
          <SidebarTrigger className="h-8 w-8 p-1.5 hover:bg-sidebar-accent hover:text-sidebar-accent-foreground rounded-md transition-colors duration-200" />
        </div>
      </SidebarHeader>
      
      <SidebarContent className="p-0">
        <ScrollArea className="h-full">
          <SidebarMenu className="px-2 py-4 space-y-1">
             {NAV_LINKS.map((link) => (
              <SidebarMenuItem key={link.href}>
                <Link href={link.href} className="w-full">
                  <SidebarMenuButton
                    isActive={isNavLinkActive(link.href)}
                    tooltip={{children: link.label, side:'right'}}
                    className={cn(
                      "text-sm font-medium h-10 transition-all duration-200 border border-transparent rounded-lg",
                      isNavLinkActive(link.href) 
                        ? "bg-blue-50 text-blue-600 border-blue-200 dark:bg-blue-950/20 dark:text-blue-400 dark:border-blue-800"
                        : "text-sidebar-foreground hover:bg-sidebar-accent hover:text-sidebar-accent-foreground hover:border-sidebar-border"
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
                    isActive={pathname === '/admin'}
                    tooltip={{children: 'Admin Panel', side:'right'}}
                    className="text-sm font-medium h-10 border border-transparent rounded-lg text-red-600 hover:text-red-700 hover:bg-red-50 hover:border-red-200 dark:text-red-400 dark:hover:text-red-300 dark:hover:bg-red-950/20 dark:hover:border-red-800 transition-all duration-200"
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
            <SidebarGroupLabel className="text-xs font-semibold text-sidebar-foreground/70 px-4 pb-2">
              Communities
            </SidebarGroupLabel>
            <SidebarMenu className="px-2 space-y-1">
            {COMMUNITIES.map((community) => (
              <SidebarMenuItem key={community.id}>
                <Link href={`/community/${community.id}`} className="w-full">
                   <SidebarMenuButton 
                    isActive={community.id !== 'all' && pathname === `/community/${community.id}`}
                    tooltip={{children: community.name, side:'right'}}
                    className={cn(
                      "text-sm font-medium h-9 transition-all duration-200 border border-transparent rounded-lg",
                      community.id !== 'all' && pathname === `/community/${community.id}`
                        ? "bg-blue-50 text-blue-600 border-blue-200 dark:bg-blue-950/20 dark:text-blue-400 dark:border-blue-800"
                        : "text-sidebar-foreground hover:bg-sidebar-accent hover:text-sidebar-accent-foreground hover:border-sidebar-border"
                    )}
                   >
                    {community.icon && <community.icon className="h-4 w-4 flex-shrink-0" />}
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
            <SidebarGroupLabel className="text-xs font-semibold text-sidebar-foreground/70 px-4 pb-2">
              Browse by Tags
            </SidebarGroupLabel>
            <div className="px-4">
              <TagsSidebar />
            </div>
          </SidebarGroup>
        </ScrollArea>
      </SidebarContent>

      <SidebarFooter className="p-4 border-t border-sidebar-border">
        <div className="text-xs text-center text-sidebar-foreground/70 group-data-[collapsible=icon]:hidden font-medium">
          Built by Devdatta Talele, for VIT students
        </div>
      </SidebarFooter>
    </Sidebar>
  );
}
