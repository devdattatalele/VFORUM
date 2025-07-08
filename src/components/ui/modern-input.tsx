import * as React from "react"
import { cn } from "@/lib/utils"

export interface InputProps
  extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string
  error?: string
  helperText?: string
}

const Input = React.forwardRef<HTMLInputElement, InputProps>(
  ({ className, type, label, error, helperText, placeholder, ...props }, ref) => {
    const [isFocused, setIsFocused] = React.useState(false)
    const [hasValue, setHasValue] = React.useState(false)
    const inputRef = React.useRef<HTMLInputElement>(null)

    React.useImperativeHandle(ref, () => inputRef.current!)

    const handleFocus = () => setIsFocused(true)
    const handleBlur = (e: React.FocusEvent<HTMLInputElement>) => {
      setIsFocused(false)
      setHasValue(!!e.target.value)
      props.onBlur?.(e)
    }

    React.useEffect(() => {
      if (inputRef.current) {
        setHasValue(!!inputRef.current.value)
      }
    }, [props.value, props.defaultValue])

    if (label) {
      return (
        <div className="relative space-y-1">
          <div className="relative">
            <input
              ref={inputRef}
              type={type}
              className={cn(
                "flex h-12 w-full rounded-md border border-neutral-300 bg-background px-3 pt-4 pb-2 text-base transition-all duration-200 ease-out",
                "placeholder:text-transparent",
                "focus:border-blue-500 focus:ring-1 focus:ring-blue-500 focus:outline-none",
                "disabled:cursor-not-allowed disabled:opacity-50",
                "dark:border-neutral-700 dark:bg-neutral-800 dark:focus:border-blue-500",
                error && "border-red-500 focus:border-red-500 focus:ring-red-500",
                className
              )}
              placeholder={placeholder || label}
              onFocus={handleFocus}
              onBlur={handleBlur}
              {...props}
            />
            <label
              className={cn(
                "absolute left-3 text-neutral-500 transition-all duration-200 ease-out pointer-events-none",
                "dark:text-neutral-400",
                (isFocused || hasValue) 
                  ? "top-1 text-xs text-blue-500 dark:text-blue-400" 
                  : "top-1/2 -translate-y-1/2 text-base",
                error && (isFocused || hasValue) && "text-red-500"
              )}
            >
              {label}
            </label>
          </div>
          {error && (
            <p className="text-sm text-red-500 animate-slideUp">
              {error}
            </p>
          )}
          {helperText && !error && (
            <p className="text-sm text-neutral-500 dark:text-neutral-400">
              {helperText}
            </p>
          )}
        </div>
      )
    }

    return (
      <input
        ref={inputRef}
        type={type}
        className={cn(
          "flex h-10 w-full rounded-md border border-neutral-300 bg-background px-3 py-2 text-base transition-all duration-200 ease-out",
          "placeholder:text-neutral-400 dark:placeholder:text-neutral-500",
          "focus:border-blue-500 focus:ring-1 focus:ring-blue-500 focus:outline-none",
          "disabled:cursor-not-allowed disabled:opacity-50",
          "dark:border-neutral-700 dark:bg-neutral-800 dark:focus:border-blue-500",
          error && "border-red-500 focus:border-red-500 focus:ring-red-500",
          className
        )}
        placeholder={placeholder}
        {...props}
      />
    )
  }
)
Input.displayName = "Input"

export { Input } 