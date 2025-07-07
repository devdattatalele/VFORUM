"use client";

import Link from 'next/link';
import { Zap, LogIn, LogOut, UserCircle, Settings, LifeBuoy, MessageSquare, Github } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/modern-button';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { NAV_LINKS } from '@/lib/constants';
import { usePathname } from 'next/navigation';
import { cn } from '@/lib/utils';
import { SidebarTrigger, useSidebar } from '@/components/ui/sidebar';
import { ThemeToggle } from '@/components/ui/theme-toggle';
import React from 'react';


export default function Header() {
  const { user, signOut, loading } = useAuth();
  const pathname = usePathname();
  const { isMobile, state: sidebarState } = useSidebar();

  // Use navigation links from constants (they are now accessible to everyone)
  const navLinks = NAV_LINKS;

  return (
    <header className="sticky top-0 z-40 w-full border-b border-gray-700 bg-brand-surface/95 backdrop-blur">
      <div className="container flex h-16 items-center justify-between px-4">
        {/* Left side - Sidebar trigger + Logo */}
        <div className="flex items-center gap-4">
          <div className="md:hidden">
            <SidebarTrigger className="h-8 w-8" />
          </div>
          {(isMobile || sidebarState === 'collapsed') && (
            <Link href="/" className="flex items-center gap-3 group">
              <div className="relative">
                <Zap className="h-7 w-7 text-brand-primary transition-colors group-hover:text-blue-400" />
              </div>
              <span className="text-lg font-semibold text-gray-100 hidden sm:block">
                VForums And Events
              </span>
            </Link>
          )}
        </div>

        {/* Center - Navigation (hidden on mobile) */}
        <nav className="hidden md:flex items-center gap-1">
          {navLinks.map((link) => (
            <Button
              key={link.href}
              variant="ghost"
              size="sm"
              asChild
              className={cn(
                "text-sm font-medium transition-colors duration-200",
                pathname === link.href || (link.href !== '/' && pathname.startsWith(link.href))
                  ? "text-brand-primary bg-brand-primary/10"
                  : "text-gray-300 hover:text-gray-100 hover:bg-gray-700/50"
              )}
            >
              <Link href={link.href}>
                <link.icon className="h-4 w-4 mr-2" />
                {link.label}
              </Link>
            </Button>
          ))}
        </nav>

        {/* Right side - Icon group with consistent 32x32 clickable areas */}
        <div className="flex items-center gap-1">
          {/* GitHub Link */}
          <Button 
            variant="ghost" 
            size="icon" 
            asChild
            className="h-8 w-8 text-gray-300 hover:text-gray-100 hover:bg-gray-700/50"
          >
            <Link 
              href="https://github.com/devdattatalele" 
              target="_blank" 
              rel="noopener noreferrer"
              aria-label="Visit GitHub Profile"
            >
              <Github className="h-4 w-4" />
            </Link>
          </Button>

          {/* Theme Toggle */}
          <ThemeToggle />
          
          {/* Auth Section */}
          {loading ? (
            <div className="h-8 w-8 rounded bg-gray-700 animate-pulse" />
          ) : user ? (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" className="h-8 w-8 rounded-full p-0">
                  <Avatar className="h-8 w-8">
                    <AvatarImage src={user.photoURL || undefined} alt={user.displayName || 'User'} />
                    <AvatarFallback className="bg-brand-primary text-white text-xs">
                      {user.displayName ? user.displayName.charAt(0).toUpperCase() : <UserCircle className="h-4 w-4" />}
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
                  <Link href="/about" className="flex items-center">
                    <LifeBuoy className="mr-2 h-4 w-4" />
                    About
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
            <Button variant="primary" size="sm" asChild>
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
