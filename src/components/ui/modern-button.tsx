import * as React from "react"
import { Slot } from "@radix-ui/react-slot"
import { cva, type VariantProps } from "class-variance-authority"
import { cn } from "@/lib/utils"

const buttonVariants = cva(
  "inline-flex items-center justify-center whitespace-nowrap rounded-md text-sm font-medium transition-all duration-200 ease-out focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-blue-500 disabled:pointer-events-none disabled:opacity-50",
  {
    variants: {
      variant: {
        primary: "bg-blue-500 text-white hover:bg-blue-600 shadow-sm hover:shadow-md active:scale-95",
        secondary: "bg-neutral-700 text-neutral-200 hover:bg-neutral-600 shadow-sm hover:shadow-md active:scale-95 dark:bg-neutral-800 dark:hover:bg-neutral-700",
        outline: "border border-neutral-300 bg-background hover:bg-neutral-50 hover:border-neutral-400 active:scale-95 dark:border-neutral-700 dark:hover:bg-neutral-800",
        ghost: "hover:bg-neutral-100 hover:text-neutral-900 active:scale-95 dark:hover:bg-neutral-800 dark:hover:text-neutral-50",
        destructive: "bg-red-500 text-white hover:bg-red-600 shadow-sm hover:shadow-md active:scale-95",
        link: "text-blue-500 underline-offset-4 hover:underline hover:text-blue-600",
      },
      size: {
        sm: "h-8 px-3 text-xs",
        md: "h-10 px-4 py-2",
        lg: "h-12 px-6 py-3 text-base",
        icon: "h-10 w-10",
        "icon-sm": "h-8 w-8",
        "icon-lg": "h-12 w-12",
      },
    },
    defaultVariants: {
      variant: "primary",
      size: "md",
    },
  }
)

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {
  asChild?: boolean
  loading?: boolean
}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant, size, asChild = false, loading = false, disabled, children, ...props }, ref) => {
    const Comp = asChild ? Slot : "button"
    
    return (
      <Comp
        className={cn(buttonVariants({ variant, size, className }))}
        ref={ref}
        disabled={disabled || loading}
        {...props}
      >
        {loading ? (
          <>
            <svg className="animate-spin -ml-1 mr-2 h-4 w-4" fill="none" viewBox="0 0 24 24">
              <circle
                className="opacity-25"
                cx="12"
                cy="12"
                r="10"
                stroke="currentColor"
                strokeWidth="4"
              />
              <path
                className="opacity-75"
                fill="currentColor"
                d="M4 12a8 8 0 018-8v8H4z"
              />
            </svg>
            Loading...
          </>
        ) : (
          children
        )}
      </Comp>
    )
  }
)
Button.displayName = "Button"

export { Button, buttonVariants } 