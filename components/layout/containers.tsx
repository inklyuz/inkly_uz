import type { HTMLAttributes } from "react"
import { cn } from "@/lib/utils"

const containerVariants = {
  marketing: "mx-auto w-full max-w-7xl px-4 sm:px-6 lg:px-8",
  dashboard: "mx-auto w-full max-w-[1400px] px-4 sm:px-6 lg:px-8",
  auth: "mx-auto w-full max-w-md px-4 sm:px-6",
  article: "mx-auto w-full max-w-3xl px-4 sm:px-6",
  editor: "mx-auto w-full max-w-5xl px-4 sm:px-6 lg:px-8",
} as const

export type ContainerVariant = keyof typeof containerVariants

interface ContainerProps extends HTMLAttributes<HTMLDivElement> {
  variant?: ContainerVariant
}

export function Container({ variant = "marketing", className, ...props }: ContainerProps) {
  return <div className={cn(containerVariants[variant], className)} {...props} />
}

export function MarketingContainer(props: Omit<ContainerProps, "variant">) {
  return <Container variant="marketing" {...props} />
}

export function DashboardContainer(props: Omit<ContainerProps, "variant">) {
  return <Container variant="dashboard" {...props} />
}

export function AuthContainer(props: Omit<ContainerProps, "variant">) {
  return <Container variant="auth" {...props} />
}

export function ArticleContainer(props: Omit<ContainerProps, "variant">) {
  return <Container variant="article" {...props} />
}

export function EditorContainer(props: Omit<ContainerProps, "variant">) {
  return <Container variant="editor" {...props} />
}

export { containerVariants }
