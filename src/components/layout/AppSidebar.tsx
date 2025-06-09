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
  SidebarSeparator
} from '@/components/ui/sidebar';
import { Zap } from 'lucide-react'; 
import { useAuth } from '@/contexts/AuthContext';


export default function AppSidebar() {
  const pathname = usePathname();
  const { user } = useAuth();
  
  const isNavLinkActive = (href: string) => {
     if (href === '/') return pathname === href;
     if (href.includes('[') && href.includes(']')) {
       const baseHref = href.substring(0, href.indexOf('['));
       return pathname.startsWith(baseHref);
     }
     return pathname.startsWith(href);
  };

  return (
    <Sidebar collapsible="icon" variant="sidebar" side="left">
      <SidebarHeader className="flex items-center gap-2 p-4 group-data-[collapsible=icon]:justify-center border-b border-sidebar-border">
        <Zap className="h-6 w-6 text-sidebar-primary flex-shrink-0" />
        <span className="text-lg font-bold font-headline text-sidebar-foreground group-data-[collapsible=icon]:hidden">
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
                  >
                    <link.icon />
                    <span>{link.label}</span>
                  </SidebarMenuButton>
                </Link>
              </SidebarMenuItem>
            ))}
          </SidebarMenu>
          
          <SidebarSeparator />

          <SidebarGroup className="pt-2">
            <SidebarGroupLabel>Communities</SidebarGroupLabel>
            <SidebarMenu className="px-0">
            {COMMUNITIES.map((community) => (
              <SidebarMenuItem key={community.id}>
                <Link href={community.id === 'all' ? '/qna' : `/community/${community.id}`} className="w-full">
                   <SidebarMenuButton 
                    isActive={community.id !== 'all' && pathname === `/community/${community.id}`}
                    tooltip={{children: community.name, side:'right'}}
                   >
                    {community.icon && <community.icon />}
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
            <SidebarGroupLabel>Browse by Tags</SidebarGroupLabel>
            <div className="px-2">
              <TagsSidebar />
            </div>
          </SidebarGroup>
        </ScrollArea>
      </SidebarContent>

      <SidebarFooter className="p-2">
        <div className="text-xs text-center text-sidebar-foreground/70 group-data-[collapsible=icon]:hidden">
          Built by VIT students, for VIT students
        </div>
      </SidebarFooter>
    </Sidebar>
  );
}
