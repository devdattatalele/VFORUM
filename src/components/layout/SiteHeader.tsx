"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { Search } from "lucide-react"
import AccountMenu from "@/components/layout/AccountMenu"
import MobileNav from "@/components/layout/MobileNav"
import NotificationBell from "@/components/layout/NotificationBell"
import Wordmark from "@/components/layout/Wordmark"
import { isActivePath } from "@/components/layout/nav"
import { Button } from "@/components/ui/button"
import { SearchBar } from "@/components/ui/search-bar"
import { ThemeToggle } from "@/components/ui/theme-toggle"
import { useAuth } from "@/contexts/AuthContext"
import { NAV_LINKS } from "@/lib/constants"
import { cn } from "@/lib/utils"

export default function SiteHeader() {
  const pathname = usePathname()
  const { user, loading } = useAuth()

  return (
    <header className="sticky top-0 z-40 border-b bg-background/80 backdrop-blur supports-[backdrop-filter]:bg-background/70">
      <div className="container flex h-16 items-center gap-8">
        <Wordmark />
        <nav
          aria-label="Main"
          className="hidden h-full items-stretch gap-6 md:flex"
        >
          {NAV_LINKS.map((link) => {
            const active = isActivePath(pathname, link.href)
            return (
              <Link
                key={link.href}
                href={link.href}
                aria-current={active ? "page" : undefined}
                className={cn(
                  "relative flex items-center text-sm text-muted-foreground transition-colors hover:text-foreground",
                  active &&
                    "text-foreground after:absolute after:inset-x-0 after:bottom-0 after:h-0.5 after:bg-brand"
                )}
              >
                {link.label}
              </Link>
            )
          })}
        </nav>

        <div className="ml-auto flex items-center gap-1.5">
          <SearchBar className="hidden w-64 lg:block" />
          <Button
            variant="ghost"
            size="icon"
            asChild
            className="lg:hidden"
            aria-label="Search"
          >
            <Link href="/search">
              <Search className="h-4 w-4" />
            </Link>
          </Button>
          {user && (
            <Button asChild size="sm" className="ml-1 hidden sm:inline-flex">
              <Link href="/qna/ask">Ask a question</Link>
            </Button>
          )}
          <NotificationBell />
          <ThemeToggle />
          {loading ? (
            <div className="h-8 w-8 animate-pulse rounded-full bg-muted" />
          ) : user ? (
            <AccountMenu />
          ) : (
            <Button variant="ghost" size="sm" asChild>
              <Link href="/auth">Sign in</Link>
            </Button>
          )}
          <MobileNav />
        </div>
      </div>
    </header>
  )
}
