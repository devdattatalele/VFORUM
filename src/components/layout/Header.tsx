
"use client";

import Link from 'next/link';
import { Zap, LogIn, LogOut, UserCircle, Moon, Sun } from 'lucide-react';
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
import { NAV_LINKS } from '@/lib/constants';
import { usePathname } from 'next/navigation';
import { cn } from '@/lib/utils';
import { SidebarTrigger } from '@/components/ui/sidebar';
import { useTheme } from "next-themes";
import React, { useEffect, useState } from 'react';


export default function Header() {
  const { user, signInWithGoogle, signOut, loading } = useAuth();
  const pathname = usePathname();
  const { theme, setTheme } = useTheme();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  const toggleTheme = () => {
    setTheme(theme === 'light' ? 'dark' : 'light');
  };

  return (
    <header className="sticky top-0 z-40 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container flex h-16 items-center justify-between px-4 sm:px-6 lg:px-8">
        <div className="flex items-center gap-4">
          <div className="md:hidden">
            <SidebarTrigger />
          </div>
          <Link href="/" className="flex items-center gap-2">
            <Zap className="h-7 w-7 text-primary" />
            <span className="text-xl font-bold font-headline text-foreground">Campus Tech Hub</span>
          </Link>
        </div>

        <nav className="hidden items-center gap-2 md:flex">
          {NAV_LINKS.map((link) => (
            <Button
              key={link.href}
              variant="ghost"
              asChild
              className={cn(
                "text-sm font-medium",
                pathname === link.href || (link.href !== '/' && pathname.startsWith(link.href))
                  ? "text-primary"
                  : "text-muted-foreground hover:text-foreground"
              )}
            >
              <Link href={link.href}>
                {/* <link.icon className="mr-2 h-4 w-4" /> */}
                {link.label}
              </Link>
            </Button>
          ))}
        </nav>

        <div className="flex items-center gap-3">
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
                {/* Add more items here like "Profile", "Settings" */}
                <DropdownMenuItem onClick={signOut}>
                  <LogOut className="mr-2 h-4 w-4" />
                  Sign Out
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          ) : (
            <Button variant="outline" size="sm" onClick={signInWithGoogle}>
              <LogIn className="mr-2 h-4 w-4" />
              Sign In
            </Button>
          )}
        </div>
      </div>
    </header>
  );
}
