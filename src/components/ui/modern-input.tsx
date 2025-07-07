import * as React from "react"
import { cn } from "@/lib/utils"

export interface InputProps
  extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string
  error?: string
  icon?: React.ReactNode
}

const Input = React.forwardRef<HTMLInputElement, InputProps>(
  ({ className, type, label, error, icon, ...props }, ref) => {
    const [focused, setFocused] = React.useState(false)
    const [hasValue, setHasValue] = React.useState(false)

    const handleFocus = () => setFocused(true)
    const handleBlur = (e: React.FocusEvent<HTMLInputElement>) => {
      setFocused(false)
      setHasValue(e.target.value !== "")
      props.onBlur?.(e)
    }

    const shouldFloatLabel = focused || hasValue || props.value

    if (!label) {
      return (
        <div className="relative">
          {icon && (
            <div className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400">
              {icon}
            </div>
          )}
          <input
            type={type}
            className={cn(
              "flex h-10 w-full rounded-md border border-gray-700 bg-gray-800 px-3 py-2 text-sm text-gray-100 placeholder:text-gray-400 focus:border-brand-primary focus:ring-1 focus:ring-brand-primary focus:outline-none disabled:cursor-not-allowed disabled:opacity-50",
              icon && "pl-10",
              error && "border-brand-danger focus:border-brand-danger focus:ring-brand-danger",
              className
            )}
            ref={ref}
            {...props}
          />
          {error && (
            <p className="mt-1 text-sm text-brand-danger">{error}</p>
          )}
        </div>
      )
    }

    return (
      <div className="relative">
        {icon && (
          <div className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 z-10">
            {icon}
          </div>
        )}
        <input
          type={type}
          className={cn(
            "peer flex h-14 w-full rounded-md border border-gray-700 bg-gray-800 px-3 pt-6 pb-2 text-sm text-gray-100 placeholder:text-transparent focus:border-brand-primary focus:ring-1 focus:ring-brand-primary focus:outline-none disabled:cursor-not-allowed disabled:opacity-50",
            icon && "pl-10",
            error && "border-brand-danger focus:border-brand-danger focus:ring-brand-danger",
            className
          )}
          placeholder={label}
          onFocus={handleFocus}
          onBlur={handleBlur}
          ref={ref}
          {...props}
        />
        <label
          className={cn(
            "absolute left-3 transition-all duration-200 ease-out pointer-events-none text-gray-400",
            icon && "left-10",
            shouldFloatLabel
              ? "top-2 text-xs font-medium"
              : "top-1/2 transform -translate-y-1/2 text-sm",
            focused && "text-brand-primary",
            error && "text-brand-danger"
          )}
        >
          {label}
        </label>
        {error && (
          <p className="mt-1 text-sm text-brand-danger">{error}</p>
        )}
      </div>
    )
  }
)
Input.displayName = "Input"

export { Input }
