import Link from "next/link"
import Wordmark from "@/components/layout/Wordmark"

const LINKS = [
  { href: "/qna", label: "Forum" },
  { href: "/events", label: "Events" },
  { href: "/communities", label: "Communities" },
  { href: "/about", label: "About" },
  { href: "https://github.com/devdattatalele/VFORUM", label: "GitHub" },
]

export default function SiteFooter() {
  return (
    <footer className="mt-20 border-t">
      <div className="container flex flex-col gap-6 py-10 md:flex-row md:items-start md:justify-between">
        <div className="max-w-sm space-y-2">
          <Wordmark className="text-base" />
          <p className="text-sm text-muted-foreground">
            Questions from VIT students, answered by VIT students. Built by
            Devdatta Talele. Open source under the MIT license.
          </p>
        </div>
        <nav aria-label="Footer" className="flex flex-wrap gap-x-6 gap-y-2">
          {LINKS.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className="font-mono text-xs uppercase tracking-wider text-muted-foreground hover:text-foreground"
            >
              {link.label}
            </Link>
          ))}
        </nav>
      </div>
    </footer>
  )
}
