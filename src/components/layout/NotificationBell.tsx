"use client"

import { useCallback, useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { formatDistanceToNow } from "date-fns"
import { Bell } from "lucide-react"
import { Button } from "@/components/ui/button"
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover"
import { useAuth } from "@/contexts/AuthContext"
import { idToken } from "@/lib/client-auth"
import { NOTIFICATION_TEXT } from "@/lib/notify"
import {
  getMyNotifications,
  markNotificationsRead,
} from "@/lib/services/notificationService"
import type { AppNotification } from "@/lib/types"
import { cn } from "@/lib/utils"

type State = { items: AppNotification[]; unread: number }

// ponytail: polls every minute while the tab is visible, plus on focus and
// open. Switch to a Firestore listener if people need it instant.
export default function NotificationBell() {
  const { user } = useAuth()
  const router = useRouter()
  const [open, setOpen] = useState(false)
  const [state, setState] = useState<State>({ items: [], unread: 0 })

  const refresh = useCallback(async () => {
    try {
      setState(await getMyNotifications(await idToken()))
    } catch {
      // Signed out or offline; keep what is shown.
    }
  }, [])

  useEffect(() => {
    if (!user) return
    refresh()
    const onFocus = () => refresh()
    const timer = window.setInterval(() => {
      if (document.visibilityState === "visible") refresh()
    }, 60_000)
    window.addEventListener("focus", onFocus)
    return () => {
      window.clearInterval(timer)
      window.removeEventListener("focus", onFocus)
    }
  }, [user, refresh])

  if (!user) return null

  const markRead = (ids?: string[]) => {
    setState((s) => ({
      items: s.items.map((n) =>
        !ids || ids.includes(n.id) ? { ...n, read: true } : n
      ),
      unread: ids
        ? Math.max(
            0,
            s.unread -
              s.items.filter((n) => ids.includes(n.id) && !n.read).length
          )
        : 0,
    }))
    idToken()
      .then((token) => markNotificationsRead(token, ids))
      .catch(() => {})
  }

  const openNotification = (n: AppNotification) => {
    setOpen(false)
    if (!n.read) markRead([n.id])
    router.push(
      `/qna/${n.questionId}${n.commentId ? `#comment-${n.commentId}` : ""}`
    )
  }

  return (
    <Popover
      open={open}
      onOpenChange={(next) => {
        setOpen(next)
        if (next) refresh()
      }}
    >
      <PopoverTrigger asChild>
        <Button
          variant="ghost"
          size="icon"
          className="relative h-8 w-8 border border-transparent text-muted-foreground hover:border-border hover:text-foreground"
          aria-label={
            state.unread
              ? `Notifications, ${state.unread} unread`
              : "Notifications"
          }
        >
          <Bell className="h-4 w-4" />
          {state.unread > 0 && (
            <span className="absolute -right-1 -top-1 flex h-4 min-w-4 items-center justify-center rounded-full bg-red-500 px-1 text-[10px] font-semibold leading-none text-white">
              {state.unread > 9 ? "9+" : state.unread}
            </span>
          )}
        </Button>
      </PopoverTrigger>
      <PopoverContent align="end" className="w-80 p-0">
        <div className="flex items-center justify-between border-b px-4 py-2">
          <p className="text-sm font-semibold">Notifications</p>
          {state.unread > 0 && (
            <Button
              variant="ghost"
              size="sm"
              className="h-7 text-xs"
              onClick={() => markRead()}
            >
              Mark all read
            </Button>
          )}
        </div>
        {state.items.length === 0 ? (
          <p className="px-4 py-8 text-center text-sm text-muted-foreground">
            Nothing yet. Answers to your questions show up here.
          </p>
        ) : (
          <ul className="max-h-96 divide-y overflow-y-auto">
            {state.items.map((n) => (
              <li key={n.id}>
                <button
                  type="button"
                  onClick={() => openNotification(n)}
                  className={cn(
                    "flex w-full gap-3 px-4 py-3 text-left text-sm transition-colors hover:bg-muted",
                    !n.read && "bg-primary/5"
                  )}
                >
                  <span
                    aria-hidden
                    className={cn(
                      "mt-1.5 h-2 w-2 shrink-0 rounded-full",
                      n.read ? "bg-transparent" : "bg-primary"
                    )}
                  />
                  <span className="min-w-0">
                    <span className="block text-foreground">
                      <span className="font-semibold">
                        {n.actor.displayName ?? "Someone"}
                      </span>{" "}
                      {NOTIFICATION_TEXT[n.type]}{" "}
                      <span className="font-medium">{n.questionTitle}</span>
                    </span>
                    <span className="text-xs text-muted-foreground">
                      {formatDistanceToNow(new Date(n.createdAt), {
                        addSuffix: true,
                      })}
                    </span>
                  </span>
                </button>
              </li>
            ))}
          </ul>
        )}
      </PopoverContent>
    </Popover>
  )
}
