import * as React from "react"
import { cn } from "@/lib/utils"

const Card = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement> & {
    variant?: "default" | "elevated" | "outlined" | "ghost"
    hover?: boolean
  }
>(({ className, variant = "default", hover = true, ...props }, ref) => {
  const variants = {
    default: "bg-card text-card-foreground border border-border shadow-card",
    elevated: "bg-card text-card-foreground border border-border shadow-lg",
    outlined: "bg-card text-card-foreground border-2 border-border",
    ghost: "bg-transparent text-card-foreground border border-border/50"
  }

  return (
    <div
      ref={ref}
      className={cn(
        "rounded-lg p-6 space-y-4 transition-all duration-200 ease-out",
        variants[variant],
        hover && variant !== "ghost" && "hover:shadow-card-hover hover:-translate-y-0.5 hover:border-border/80",
        className
      )}
      {...props}
    />
  )
})
Card.displayName = "Card"

const CardHeader = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement>
>(({ className, ...props }, ref) => (
  <div
    ref={ref}
    className={cn("flex flex-col space-y-2", className)}
    {...props}
  />
))
CardHeader.displayName = "CardHeader"

const CardTitle = React.forwardRef<
  HTMLParagraphElement,
  React.HTMLAttributes<HTMLHeadingElement> & {
    size?: "sm" | "md" | "lg"
  }
>(({ className, size = "md", ...props }, ref) => {
  const sizes = {
    sm: "text-lg font-semibold leading-snug",
    md: "text-xl font-semibold leading-snug", 
    lg: "text-2xl font-semibold leading-tight"
  }

  return (
    <h3
      ref={ref}
      className={cn(
        "tracking-tight",
        sizes[size],
        className
      )}
      {...props}
    />
  )
})
CardTitle.displayName = "CardTitle"

const CardDescription = React.forwardRef<
  HTMLParagraphElement,
  React.HTMLAttributes<HTMLParagraphElement>
>(({ className, ...props }, ref) => (
  <p
    ref={ref}
    className={cn("text-base leading-relaxed text-muted-foreground", className)}
    {...props}
  />
))
CardDescription.displayName = "CardDescription"

const CardContent = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement>
>(({ className, ...props }, ref) => (
  <div ref={ref} className={cn("space-y-4", className)} {...props} />
))
CardContent.displayName = "CardContent"

const CardFooter = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement>
>(({ className, ...props }, ref) => (
  <div
    ref={ref}
    className={cn("flex items-center space-x-4", className)}
    {...props}
  />
))
CardFooter.displayName = "CardFooter"

export { Card, CardHeader, CardFooter, CardTitle, CardDescription, CardContent }
