"use client"

import Link from "next/link"
import {
  Zap,
  LogIn,
  LogOut,
  UserCircle,
  Settings,
  LifeBuoy,
  MessageSquare,
  Github,
} from "lucide-react"
import { useAuth } from "@/contexts/AuthContext"
import { Button } from "@/components/ui/button"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { NAV_LINKS } from "@/lib/constants"
import { usePathname } from "next/navigation"
import { cn } from "@/lib/utils"
import { SidebarTrigger, useSidebar } from "@/components/ui/sidebar"
import { ThemeToggle } from "@/components/ui/theme-toggle"
import { SearchBar } from "@/components/ui/search-bar"
import React from "react"
import NotificationBell from "@/components/layout/NotificationBell"

export default function Header() {
  const { user, signOut, loading } = useAuth()
  const pathname = usePathname()
  const { isMobile, state: sidebarState } = useSidebar()

  // Use navigation links from constants (they are now accessible to everyone)
  const navLinks = NAV_LINKS

  const handleSearch = (query: string) => {
    if (query.trim()) {
      // Navigate to search results page
      window.location.href = `/search?q=${encodeURIComponent(query.trim())}`
    }
  }

  return (
    <header className="sticky top-0 z-40 w-full border-b border-border bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container flex h-16 items-center justify-between gap-4 px-4">
        {/* Left side - Sidebar trigger + Logo */}
        <div className="flex flex-shrink-0 items-center gap-4">
          <div className="md:hidden">
            <SidebarTrigger className="h-8 w-8" />
          </div>
          {(isMobile || sidebarState === "collapsed") && (
            <Link href="/" className="group flex items-center gap-3">
              <div className="relative">
                <Zap className="h-7 w-7 text-blue-500 transition-colors group-hover:text-blue-600" />
              </div>
              <span className="hidden whitespace-nowrap text-lg font-semibold text-foreground sm:block">
                VForums And Events
              </span>
            </Link>
          )}
        </div>

        {/* Center - Search Bar */}
        <div className="mx-4 max-w-2xl flex-1">
          <SearchBar
            placeholder="Search forums, events, communities..."
            onSearch={handleSearch}
          />
        </div>

        {/* Right side - Navigation + Actions */}
        <div className="flex flex-shrink-0 items-center gap-2">
          {/* Navigation (hidden on mobile) */}
          <nav className="mr-4 hidden items-center gap-1 lg:flex">
            {navLinks.map((link) => (
              <Button
                key={link.href}
                variant="ghost"
                size="sm"
                asChild
                className={cn(
                  "border border-transparent text-sm font-medium transition-colors duration-200",
                  pathname === link.href ||
                    (link.href !== "/" && pathname.startsWith(link.href))
                    ? "border-blue-200 bg-blue-50 text-blue-500 dark:border-blue-800 dark:bg-blue-950/20"
                    : "text-muted-foreground hover:border-border hover:text-foreground"
                )}
              >
                <Link href={link.href}>
                  <link.icon className="mr-2 h-4 w-4" />
                  {link.label}
                </Link>
              </Button>
            ))}
          </nav>

          {/* Actions */}
          <div className="flex items-center gap-2">
            {/* GitHub Link */}
            <Button
              variant="ghost"
              size="icon-sm"
              asChild
              className="h-8 w-8 border border-transparent text-muted-foreground hover:border-border hover:text-foreground"
            >
              <Link
                href="https://github.com/devdattatalele/VFORUM"
                target="_blank"
                rel="noopener noreferrer"
                aria-label="Visit GitHub Profile"
              >
                <Github className="h-4 w-4" />
              </Link>
            </Button>

            <NotificationBell />

            {/* Theme Toggle */}
            <ThemeToggle />

            {/* Auth Section */}
            {loading ? (
              <div className="h-8 w-8 animate-pulse rounded-full border border-border bg-muted" />
            ) : user ? (
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button
                    variant="ghost"
                    className="h-8 w-8 rounded-full border border-transparent p-0 hover:border-border hover:bg-muted"
                  >
                    <Avatar className="h-8 w-8">
                      <AvatarImage
                        src={user.photoURL || undefined}
                        alt={user.displayName || "User"}
                      />
                      <AvatarFallback className="bg-blue-500 text-xs text-white">
                        {user.displayName ? (
                          user.displayName.charAt(0).toUpperCase()
                        ) : (
                          <UserCircle className="h-4 w-4" />
                        )}
                      </AvatarFallback>
                    </Avatar>
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent
                  className="w-56 border border-border"
                  align="end"
                  forceMount
                >
                  <DropdownMenuLabel className="font-normal">
                    <div className="flex flex-col space-y-1">
                      <p className="text-sm font-medium leading-none">
                        {user.displayName}
                      </p>
                      <p className="text-xs leading-none text-muted-foreground">
                        {user.email}
                      </p>
                    </div>
                  </DropdownMenuLabel>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem asChild>
                    <Link href={`/u/${user.uid}`} className="flex items-center">
                      <UserCircle className="mr-2 h-4 w-4" />
                      Your profile
                    </Link>
                  </DropdownMenuItem>
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
              <Button
                variant="primary"
                size="sm"
                asChild
                className="border border-transparent"
              >
                <Link href="/auth">
                  <LogIn className="mr-2 h-4 w-4" />
                  Sign In
                </Link>
              </Button>
            )}
          </div>
        </div>
      </div>
    </header>
  )
}
