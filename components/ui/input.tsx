import { forwardRef, type InputHTMLAttributes, type TextareaHTMLAttributes } from "react"
import { cn } from "@/lib/utils"

const fieldBase =
  "w-full rounded-lg border bg-cream-50 px-4 py-3 text-sm text-ink-900 placeholder:text-ink-400 outline-none transition-colors duration-150"

interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  label?: string
  error?: string
  hint?: string
}

export const Input = forwardRef<HTMLInputElement, InputProps>(function Input(
  { label, error, hint, className, id, ...props },
  ref,
) {
  const fieldId = id ?? props.name
  return (
    <div className="flex flex-col gap-1.5">
      {label && (
        <label htmlFor={fieldId} className="text-sm font-medium text-ink-900">
          {label}
        </label>
      )}
      <input
        ref={ref}
        id={fieldId}
        aria-invalid={error ? true : undefined}
        {...props}
        className={cn(
          fieldBase,
          error ? "border-danger focus:border-danger" : "border-cream-300 focus:border-ink-900",
          className,
        )}
      />
      {hint && !error && <p className="text-xs text-ink-400">{hint}</p>}
      {error && <p className="text-xs text-danger">{error}</p>}
    </div>
  )
})

interface TextareaProps extends TextareaHTMLAttributes<HTMLTextAreaElement> {
  label?: string
  error?: string
}

export const Textarea = forwardRef<HTMLTextAreaElement, TextareaProps>(function Textarea(
  { label, error, className, id, ...props },
  ref,
) {
  const fieldId = id ?? props.name
  return (
    <div className="flex flex-col gap-1.5">
      {label && (
        <label htmlFor={fieldId} className="text-sm font-medium text-ink-900">
          {label}
        </label>
      )}
      <textarea
        ref={ref}
        id={fieldId}
        aria-invalid={error ? true : undefined}
        {...props}
        className={cn(
          fieldBase,
          "resize-y leading-relaxed",
          error ? "border-danger focus:border-danger" : "border-cream-300 focus:border-ink-900",
          className,
        )}
      />
      {error && <p className="text-xs text-danger">{error}</p>}
    </div>
  )
})
