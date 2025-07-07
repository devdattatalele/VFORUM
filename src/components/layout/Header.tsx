"use client";

import Link from 'next/link';
import { Zap, LogIn, LogOut, UserCircle, Moon, Sun, Settings, LifeBuoy, MessageSquare, Github } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { NAV_LINKS } from '@/lib/constants';
import { usePathname } from 'next/navigation';
import { cn } from '@/lib/utils';
import { SidebarTrigger, useSidebar } from '@/components/ui/sidebar';
import { useTheme } from "next-themes";
import React, { useEffect, useState } from 'react';


export default function Header() {
  const { user, signOut, loading } = useAuth();
  const pathname = usePathname();
  const { theme, setTheme } = useTheme();
  const [mounted, setMounted] = useState(false);
  const { isMobile, state: sidebarState } = useSidebar();

  useEffect(() => {
    setMounted(true);
  }, []);

  const toggleTheme = () => {
    setTheme(theme === 'light' ? 'dark' : 'light');
  };

  // Use navigation links from constants (they are now accessible to everyone)
  const navLinks = NAV_LINKS;

  return (
    <header className="sticky top-0 z-40 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container flex h-20 items-center justify-between px-4 sm:px-6 lg:px-8">
        <div className="flex items-center gap-4">
          {/* Show SidebarTrigger for everyone on mobile */}
          <div className="md:hidden">
            <SidebarTrigger />
          </div>
          {/* Show logo/brand text when sidebar is collapsed or on mobile */}
          {(isMobile || sidebarState === 'collapsed') && (
            <Link href="/" className="flex items-center gap-3">
              <div className="relative">
                <Zap className="h-8 w-8 text-google-blue flex-shrink-0" />
                <div className="absolute inset-0 h-8 w-8 flex-shrink-0">
                  <div className="w-2 h-2 bg-google-red rounded-full absolute top-1 right-1"></div>
                  <div className="w-1.5 h-1.5 bg-google-yellow rounded-full absolute bottom-1 left-1"></div>
                  <div className="w-1.5 h-1.5 bg-google-blue rounded-full absolute bottom-1.5 right-1.5"></div>
                </div>
              </div>
              <span className="text-xl font-bold font-headline text-foreground whitespace-nowrap">VForums And Events</span>
            </Link>
          )}
        </div>

        <div className="flex items-center gap-3">
          <nav className="hidden items-center gap-1 md:flex mr-2">
            {navLinks.map((link) => (
              <Button
                key={link.href}
                variant="ghost"
                size="sm"
                asChild
                className={cn(
                  "text-sm font-medium",
                  pathname === link.href || (link.href !== '/' && pathname.startsWith(link.href))
                    ? "text-primary"
                    : "text-muted-foreground hover:text-foreground"
                )}
              >
                <Link href={link.href}>
                  {link.label}
                </Link>
              </Button>
            ))}
          </nav>

          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <Button 
                  variant="ghost" 
                  size="icon" 
                  asChild
                  className="bg-black hover:bg-black/80 text-white shadow-lg hover:shadow-xl transition-all duration-200"
                >
                  <Link 
                    href="https://github.com/devdattatalele" 
                    target="_blank" 
                    rel="noopener noreferrer"
                    aria-label="Visit GitHub Profile"
                  >
                    <Github className="h-5 w-5" />
                  </Link>
                </Button>
              </TooltipTrigger>
              <TooltipContent>
                <p>Report issues or like the repo ⭐</p>
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>

          {mounted && (
            <Button variant="ghost" size="icon" onClick={toggleTheme} aria-label="Toggle theme">
              {theme === 'light' ? <Moon className="h-5 w-5" /> : <Sun className="h-5 w-5" />}
            </Button>
          )}
          
          {loading ? (
            <Button variant="outline" size="sm" disabled>Loading...</Button>
          ) : user ? (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" className="relative h-9 w-9 rounded-full">
                  <Avatar className="h-9 w-9">
                    <AvatarImage src={user.photoURL || undefined} alt={user.displayName || 'User'} />
                    <AvatarFallback>
                      {user.displayName ? user.displayName.charAt(0).toUpperCase() : <UserCircle size={20} />}
                    </AvatarFallback>
                  </Avatar>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent className="w-56" align="end" forceMount>
                <DropdownMenuLabel className="font-normal">
                  <div className="flex flex-col space-y-1">
                    <p className="text-sm font-medium leading-none">{user.displayName}</p>
                    <p className="text-xs leading-none text-muted-foreground">{user.email}</p>
                  </div>
                </DropdownMenuLabel>
                <DropdownMenuSeparator />
                <DropdownMenuItem asChild>
                  <Link href="/my-forums" className="flex items-center">
                    <MessageSquare className="mr-2 h-4 w-4" />
                    My Forums
                  </Link>
                </DropdownMenuItem>
                <DropdownMenuItem asChild>
                  <Link href="/help" className="flex items-center">
                    <LifeBuoy className="mr-2 h-4 w-4" />
                    Help
                  </Link>
                </DropdownMenuItem>
                <DropdownMenuItem asChild>
                  <Link href="/settings" className="flex items-center">
                    <Settings className="mr-2 h-4 w-4" />
                    Settings
                  </Link>
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={signOut}>
                  <LogOut className="mr-2 h-4 w-4" />
                  Sign Out
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          ) : (
            <Button variant="outline" size="sm" asChild>
              <Link href="/auth">
              <LogIn className="mr-2 h-4 w-4" />
              Sign In
              </Link>
            </Button>
          )}
        </div>
      </div>
    </header>
  );
}
