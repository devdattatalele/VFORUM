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
import { Crown } from 'lucide-react'; 
import { useAuth } from '@/contexts/AuthContext';
import { isAdmin } from '@/lib/utils/userUtils';
import { useState } from 'react';

export default function AppSidebar() {
  const pathname = usePathname();
  const { user } = useAuth();
  const { isMobile, state } = useSidebar();
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
      className={cn(
        "group transition-all duration-200 ease-out",
        "bg-gray-900 border-r border-gray-800",
        // Responsive behavior
        "w-64 md:w-16 hover:md:w-64"
      )}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      <SidebarHeader className="p-4 border-b border-gray-800">
        <div className="flex items-center gap-3">
          <div className="relative w-8 h-8 bg-gradient-to-br from-blue-500 to-blue-600 rounded-lg shadow-sm flex-shrink-0">
            <div className="w-1.5 h-1.5 bg-white/90 rounded-full absolute top-1 left-1"></div>
            <div className="w-1.5 h-1.5 bg-yellow-400 rounded-full absolute bottom-1 left-1"></div>
            <div className="w-1.5 h-1.5 bg-blue-300 rounded-full absolute bottom-1.5 right-1.5"></div>
          </div>
          <span className="text-xl font-semibold text-white group-data-[collapsible=icon]:hidden whitespace-nowrap transition-opacity duration-200">
            VForums & Events
          </span>
        </div>
      </SidebarHeader>

      <SidebarContent className="p-0">
        <ScrollArea className="h-full">
          {/* Main Navigation */}
          <SidebarGroup className="p-4">
            <SidebarMenu className="space-y-1">
              {NAV_LINKS.map((link) => (
                <SidebarMenuItem key={link.href}>
                  <Link href={link.href} className="w-full">
                    <SidebarMenuButton
                      isActive={isNavLinkActive(link.href)}
                      tooltip={{children: link.label, side:'right'}}
                      className={cn(
                        "w-full justify-start h-10 px-3 rounded-md text-sm font-medium transition-all duration-200",
                        "text-gray-300 hover:text-white hover:bg-gray-800",
                        "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 focus-visible:ring-offset-2 focus-visible:ring-offset-gray-900",
                        isNavLinkActive(link.href) && "bg-blue-500 text-white hover:bg-blue-600"
                      )}
                    >
                      <link.icon className="h-5 w-5 flex-shrink-0" />
                      <span className="group-data-[collapsible=icon]:hidden ml-3 transition-opacity duration-200">
                        {link.label}
                      </span>
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
                      className={cn(
                        "w-full justify-start h-10 px-3 rounded-md text-sm font-medium transition-all duration-200",
                        "text-red-400 hover:text-red-300 hover:bg-red-950/20",
                        "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-red-500 focus-visible:ring-offset-2 focus-visible:ring-offset-gray-900",
                        pathname === '/admin' && "bg-red-500 text-white hover:bg-red-600"
                      )}
                    >
                      <Crown className="h-5 w-5 flex-shrink-0" />
                      <span className="group-data-[collapsible=icon]:hidden ml-3 transition-opacity duration-200">
                        Admin Panel
                      </span>
                    </SidebarMenuButton>
                  </Link>
                </SidebarMenuItem>
              )}
            </SidebarMenu>
          </SidebarGroup>
          
          <SidebarSeparator className="border-gray-800 mx-4" />

          {/* Communities Section */}
          <SidebarGroup className="p-4 pt-2">
            <SidebarGroupLabel className="text-sm font-semibold text-gray-400 mb-3 group-data-[collapsible=icon]:hidden">
              Communities
            </SidebarGroupLabel>
            <SidebarMenu className="space-y-1">
              {COMMUNITIES.map((community) => (
                <SidebarMenuItem key={community.id}>
                  <Link href={`/community/${community.id}`} className="w-full">
                    <SidebarMenuButton 
                      isActive={community.id !== 'all' && pathname === `/community/${community.id}`}
                      tooltip={{children: community.name, side:'right'}}
                      className={cn(
                        "w-full justify-start h-9 px-3 rounded-md text-sm font-medium transition-all duration-200",
                        "text-gray-400 hover:text-gray-200 hover:bg-gray-800",
                        "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 focus-visible:ring-offset-2 focus-visible:ring-offset-gray-900",
                        community.id !== 'all' && pathname === `/community/${community.id}` && "bg-blue-500 text-white hover:bg-blue-600"
                      )}
                    >
                      {community.icon && <community.icon className="h-4 w-4 flex-shrink-0" />}
                      <span className="group-data-[collapsible=icon]:hidden ml-3 transition-opacity duration-200">
                        {community.name}
                      </span>
                    </SidebarMenuButton>
                  </Link>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroup>

          <SidebarSeparator className="border-gray-800 mx-4" />

          {/* Tags Section */}
          <SidebarGroup className="p-4 pt-2 group-data-[collapsible=icon]:hidden">
            <SidebarGroupLabel className="text-sm font-semibold text-gray-400 mb-3">
              Browse by Tags
            </SidebarGroupLabel>
            <div className="transition-opacity duration-200">
              <TagsSidebar />
            </div>
          </SidebarGroup>
        </ScrollArea>
      </SidebarContent>

      <SidebarFooter className="p-4 border-t border-gray-800">
        <div className="text-xs text-center text-gray-500 group-data-[collapsible=icon]:hidden font-medium transition-opacity duration-200">
          Built by VIT students, for VIT students
        </div>
      </SidebarFooter>
    </Sidebar>
  );
}
