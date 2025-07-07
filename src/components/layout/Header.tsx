"use client";

import Link from 'next/link';
import { LogIn, LogOut, UserCircle, Settings, LifeBuoy, MessageSquare, Github } from 'lucide-react';
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
import { SidebarTrigger, useSidebar } from '@/components/ui/sidebar';
import { ThemeToggle } from '@/components/ui/theme-toggle';
import { cn } from '@/lib/utils';
import React from 'react';

export default function Header() {
  const { user, signOut, loading } = useAuth();
  const { isMobile } = useSidebar();

  return (
    <header className="sticky top-0 z-40 w-full border-b border-gray-800 bg-gray-900/95 backdrop-blur supports-[backdrop-filter]:bg-gray-900/60">
      <div className="container flex h-16 items-center justify-between px-4">
        {/* Left side - Sidebar trigger */}
        <div className="flex items-center gap-4">
          <SidebarTrigger className="h-8 w-8 text-gray-300 hover:text-white hover:bg-gray-800" />
          
          {/* Mobile brand */}
          {isMobile && (
            <Link href="/" className="flex items-center gap-2">
              <div className="w-6 h-6 bg-gradient-to-br from-blue-500 to-blue-600 rounded-md">
                <div className="w-1 h-1 bg-white/90 rounded-full absolute top-0.5 left-0.5"></div>
                <div className="w-1 h-1 bg-yellow-400 rounded-full absolute bottom-0.5 left-0.5"></div>
                <div className="w-1 h-1 bg-blue-300 rounded-full absolute bottom-1 right-1"></div>
              </div>
              <span className="font-semibold text-white">VForums</span>
            </Link>
          )}
        </div>

        {/* Right side - Actions */}
        <div className="flex items-center gap-2">
          {/* GitHub Link */}
          <Button 
            variant="ghost" 
            size="icon" 
            asChild
            className={cn(
              "h-8 w-8 rounded-md",
              "text-gray-400 hover:text-white hover:bg-gray-800",
              "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 focus-visible:ring-offset-2 focus-visible:ring-offset-gray-900"
            )}
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
            <div className="h-8 w-8 rounded-full bg-gray-800 animate-pulse" />
          ) : user ? (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button 
                  variant="ghost" 
                  className={cn(
                    "h-8 w-8 rounded-full p-0",
                    "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 focus-visible:ring-offset-2 focus-visible:ring-offset-gray-900"
                  )}
                >
                  <Avatar className="h-8 w-8">
                    <AvatarImage src={user.photoURL || undefined} alt={user.displayName || 'User'} />
                    <AvatarFallback className="bg-blue-500 text-white text-xs">
                      {user.displayName ? user.displayName.charAt(0).toUpperCase() : <UserCircle className="h-4 w-4" />}
                    </AvatarFallback>
                  </Avatar>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent 
                align="end" 
                className="w-56 bg-gray-800 border-gray-700"
                sideOffset={4}
              >
                <DropdownMenuLabel className="text-gray-200">
                  <div className="flex flex-col space-y-1">
                    <p className="text-sm font-medium">{user.displayName || 'User'}</p>
                    <p className="text-xs text-gray-400">{user.email}</p>
                  </div>
                </DropdownMenuLabel>
                
                <DropdownMenuSeparator className="bg-gray-700" />
                
                <DropdownMenuItem asChild>
                  <Link 
                    href="/settings" 
                    className="flex items-center gap-2 text-gray-300 hover:text-white focus:text-white cursor-pointer"
                  >
                    <Settings className="h-4 w-4" />
                    Settings
                  </Link>
                </DropdownMenuItem>
                
                <DropdownMenuItem asChild>
                  <Link 
                    href="/help" 
                    className="flex items-center gap-2 text-gray-300 hover:text-white focus:text-white cursor-pointer"
                  >
                    <LifeBuoy className="h-4 w-4" />
                    Help & Support
                  </Link>
                </DropdownMenuItem>
                
                <DropdownMenuItem asChild>
                  <Link 
                    href="/qna" 
                    className="flex items-center gap-2 text-gray-300 hover:text-white focus:text-white cursor-pointer"
                  >
                    <MessageSquare className="h-4 w-4" />
                    Q&A Forum
                  </Link>
                </DropdownMenuItem>
                
                <DropdownMenuSeparator className="bg-gray-700" />
                
                <DropdownMenuItem 
                  onClick={signOut}
                  className="flex items-center gap-2 text-red-400 hover:text-red-300 focus:text-red-300 cursor-pointer hover:bg-red-950/20 focus:bg-red-950/20"
                >
                  <LogOut className="h-4 w-4" />
                  Sign Out
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          ) : (
            <Button 
              asChild 
              variant="default" 
              size="sm"
              className="h-8 px-3"
            >
              <Link 
                href="/auth" 
                className="flex items-center gap-2"
              >
                <LogIn className="h-4 w-4" />
                Sign In
              </Link>
            </Button>
          )}
        </div>
      </div>
    </header>
  );
}
