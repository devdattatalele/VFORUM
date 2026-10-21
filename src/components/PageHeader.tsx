import { cn } from "@/lib/utils"

// Title, optional eyebrow and description, and actions on the right.
export default function PageHeader({
  eyebrow,
  title,
  description,
  actions,
  className,
}: {
  eyebrow?: string
  title: React.ReactNode
  description?: React.ReactNode
  actions?: React.ReactNode
  className?: string
}) {
  return (
    <div
      className={cn(
        "mb-8 flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between",
        className
      )}
    >
      <div className="min-w-0 space-y-2">
        {eyebrow && <Eyebrow>{eyebrow}</Eyebrow>}
        <h1 className="text-3xl font-semibold tracking-tight md:text-4xl">
          {title}
        </h1>
        {description && (
          <p className="max-w-2xl text-muted-foreground">{description}</p>
        )}
      </div>
      {actions && <div className="flex shrink-0 gap-2">{actions}</div>}
    </div>
  )
}

// Small mono label with the orange dot, as on vosslabs.org.
export function Eyebrow({ children }: { children: React.ReactNode }) {
  return (
    <p className="inline-flex items-center gap-2 font-mono text-xs font-medium uppercase tracking-[0.14em] text-brand">
      <span aria-hidden className="h-1.5 w-1.5 rounded-full bg-brand" />
      {children}
    </p>
  )
}

// Section title with a count or link on the right and a rule below.
export function SectionHeader({
  title,
  meta,
  className,
}: {
  title: React.ReactNode
  meta?: React.ReactNode
  className?: string
}) {
  return (
    <div
      className={cn(
        "mb-4 flex items-baseline justify-between gap-4 border-b pb-3",
        className
      )}
    >
      <h2 className="text-base font-semibold">{title}</h2>
      {meta && <div className="text-sm text-muted-foreground">{meta}</div>}
    </div>
  )
}
