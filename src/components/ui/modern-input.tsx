"use client"

import * as React from "react"
import { cn } from "@/lib/utils"
import { cva, type VariantProps } from "class-variance-authority"

const inputVariants = cva(
  "flex w-full rounded-md text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 transition-all duration-200",
  {
    variants: {
      variant: {
        default: "border border-gray-700 bg-gray-800 focus:border-blue-500 focus:ring-1 focus:ring-blue-500",
        ghost: "border-0 bg-transparent focus:bg-gray-800 focus:border-gray-700",
        filled: "border-0 bg-gray-800 focus:bg-gray-700 focus:ring-1 focus:ring-blue-500",
      },
      size: {
        default: "h-10 px-3 py-2",
        sm: "h-9 px-3",
        lg: "h-11 px-4",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "default",
    },
  }
)

export interface InputProps
  extends React.InputHTMLAttributes<HTMLInputElement>,
    VariantProps<typeof inputVariants> {
  label?: string
  error?: string
  helperText?: string
  floating?: boolean
}

const Input = React.forwardRef<HTMLInputElement, InputProps>(
  ({ className, type, variant, size, label, error, helperText, floating = false, ...props }, ref) => {
    const [isFocused, setIsFocused] = React.useState(false)
    const [hasValue, setHasValue] = React.useState(false)

    const handleFocus = () => setIsFocused(true)
    const handleBlur = (e: React.FocusEvent<HTMLInputElement>) => {
      setIsFocused(false)
      setHasValue(e.target.value !== "")
      props.onBlur?.(e)
    }

    if (floating && label) {
      return (
        <div className="relative">
          <input
            type={type}
            className={cn(
              inputVariants({ variant, size }),
              "peer placeholder-transparent",
              error && "border-red-500 focus:border-red-500 focus:ring-red-500",
              className
            )}
            ref={ref}
            onFocus={handleFocus}
            onBlur={handleBlur}
            placeholder={label}
            {...props}
          />
          <label
            className={cn(
              "absolute left-3 transition-all duration-200 pointer-events-none",
              "peer-placeholder-shown:top-1/2 peer-placeholder-shown:-translate-y-1/2 peer-placeholder-shown:text-base peer-placeholder-shown:text-muted-foreground",
              "peer-focus:top-2 peer-focus:text-xs peer-focus:text-blue-500 peer-focus:-translate-y-0",
              (isFocused || hasValue) && "top-2 text-xs text-blue-500 -translate-y-0"
            )}
          >
            {label}
          </label>
          {error && (
            <p className="mt-2 text-sm text-red-500">{error}</p>
          )}
          {helperText && !error && (
            <p className="mt-2 text-sm text-muted-foreground">{helperText}</p>
          )}
        </div>
      )
    }

    return (
      <div className="space-y-2">
        {label && (
          <label className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70">
            {label}
          </label>
        )}
        <input
          type={type}
          className={cn(
            inputVariants({ variant, size }),
            error && "border-red-500 focus:border-red-500 focus:ring-red-500",
            className
          )}
          ref={ref}
          {...props}
        />
        {error && (
          <p className="text-sm text-red-500">{error}</p>
        )}
        {helperText && !error && (
          <p className="text-sm text-muted-foreground">{helperText}</p>
        )}
      </div>
    )
  }
)
Input.displayName = "Input"

export { Input, inputVariants }
