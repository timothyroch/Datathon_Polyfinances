import * as React from "react"
import { cn } from "@/lib/utils"

export type Tone = "zinc" | "green" | "red" | "amber" | "indigo" | "blue"

const toneCls: Record<Tone, string> = {
  zinc: "bg-zinc-100 text-zinc-700 dark:bg-zinc-800 dark:text-zinc-200",
  green: "bg-emerald-100 text-emerald-700 dark:bg-emerald-900/40 dark:text-emerald-300",
  red: "bg-red-100 text-red-700 dark:bg-red-900/40 dark:text-red-300",
  amber: "bg-amber-100 text-amber-700 dark:bg-amber-900/40 dark:text-amber-300",
  indigo: "bg-indigo-100 text-indigo-700 dark:bg-indigo-900/40 dark:text-indigo-300",
  blue: "bg-blue-100 text-blue-700 dark:bg-blue-900/40 dark:text-blue-300",
}

type Props = React.HTMLAttributes<HTMLDivElement> & { tone?: Tone }

export function ToneBadge({ tone = "zinc", className, ...props }: Props) {
  return (
    <div
      className={cn(
        "inline-flex items-center rounded-full border px-2 py-0.5 text-xs font-medium",
        toneCls[tone],
        className
      )}
      {...props}
    />
  )
}

export default ToneBadge
