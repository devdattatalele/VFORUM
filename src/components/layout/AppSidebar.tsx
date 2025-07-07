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
      <SidebarHeader className="p-4">
        <div className="flex items-center gap-3">
          <div className="relative w-8 h-8 bg-gradient-to-br from-google-blue to-google-green rounded-lg shadow-sm">
            <div className="w-1.5 h-1.5 bg-google-red rounded-full absolute top-1 left-1"></div>
            <div className="w-1.5 h-1.5 bg-google-yellow rounded-full absolute bottom-1 left-1"></div>
            <div className="w-1.5 h-1.5 bg-google-blue rounded-full absolute bottom-1.5 right-1.5"></div>
          </div>
        </div>
        <span className="text-2xl font-bold font-headline text-sidebar-foreground group-data-[collapsible=icon]:hidden whitespace-nowrap">
          VForums And Events
        </span>
      </SidebarHeader>
      <SidebarContent className="p-0">
        <ScrollArea className="h-full">
          <SidebarMenu className="px-2 py-2">
             {NAV_LINKS.map((link) => (
              <SidebarMenuItem key={link.href}>
                <Link href={link.href} className="w-full">
                  <SidebarMenuButton
                    isActive={isNavLinkActive(link.href)}
                    tooltip={{children: link.label, side:'right'}}
                    className="text-base font-medium h-12"
                  >
                    <link.icon className="h-5 w-5" />
                    <span>{link.label}</span>
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
                    className="text-base font-medium h-12 text-red-600 hover:text-red-700 hover:bg-red-50 dark:text-red-400 dark:hover:text-red-300 dark:hover:bg-red-950/20"
                  >
                    <Crown className="h-5 w-5" />
                    <span>Admin Panel</span>
                  </SidebarMenuButton>
                </Link>
              </SidebarMenuItem>
            )}
          </SidebarMenu>
          
          <SidebarSeparator />

          <SidebarGroup className="pt-2">
            <SidebarGroupLabel className="text-sm font-semibold mb-2">Communities</SidebarGroupLabel>
            <SidebarMenu className="px-0">
            {COMMUNITIES.map((community) => (
              <SidebarMenuItem key={community.id}>
<Link href={`/community/${community.id}`} className="w-full">
                   <SidebarMenuButton 
                    isActive={community.id !== 'all' && pathname === `/community/${community.id}`}
                    tooltip={{children: community.name, side:'right'}}
                    className="text-sm font-medium h-10"
                   >
                    {community.icon && <community.icon className="h-4 w-4" />}
                    <span>{community.name}</span>
                  </SidebarMenuButton>
                </Link>
              </SidebarMenuItem>
            ))}
            </SidebarMenu>
          </SidebarGroup>

          <SidebarSeparator />

          {/* Tags Section */}
          <SidebarGroup className="pt-2 group-data-[collapsible=icon]:hidden">
            <SidebarGroupLabel className="text-sm font-semibold mb-2">Browse by Tags</SidebarGroupLabel>
            <div className="px-2">
              <TagsSidebar />
            </div>
          </SidebarGroup>
        </ScrollArea>
      </SidebarContent>

      <SidebarFooter className="p-2">
        <div className="text-sm text-center text-sidebar-foreground/70 group-data-[collapsible=icon]:hidden font-medium">
          Built by VIT students, for VIT students
            </div>
      </SidebarFooter>
    </Sidebar>
  );
}
