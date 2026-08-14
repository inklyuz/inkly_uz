import { forwardRef, type InputHTMLAttributes, type TextareaHTMLAttributes } from "react"
import { cn } from "@/lib/utils"

const fieldBase =
  "w-full rounded-lg border bg-white px-4 py-3 text-sm text-[#141414] placeholder:text-[#6B7280] outline-none transition-colors duration-150"

interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  label?: React.ReactNode
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
        <label htmlFor={fieldId} className="text-sm font-medium text-[#141414]">
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
          error
            ? "border-[#DC2626] focus:border-[#DC2626]"
            : "border-[#E8E3DD] focus:border-[#FF6A00]",
          className,
        )}
      />
      {hint && !error && <p className="text-xs text-[#6B7280]">{hint}</p>}
      {error && <p className="text-xs text-[#DC2626]">{error}</p>}
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
        <label htmlFor={fieldId} className="text-sm font-medium text-[#141414]">
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
          error
            ? "border-[#DC2626] focus:border-[#DC2626]"
            : "border-[#E8E3DD] focus:border-[#FF6A00]",
          className,
        )}
      />
      {error && <p className="text-xs text-[#DC2626]">{error}</p>}
    </div>
  )
})
