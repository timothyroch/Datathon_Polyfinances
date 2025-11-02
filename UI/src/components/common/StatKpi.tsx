import { ToneBadge } from "../ui/badge"

export default function StatKpi({
  label,
  value,
  delta,
}: {
  label: string
  value: string | number
  delta?: number
}) {
  const variant = delta === undefined ? "default" : delta >= 0 ? "green" : "red"

  return (
    <div className="rounded-xl border border-zinc-200/70 p-4 dark:border-zinc-800">
      <p className="text-xs text-zinc-500">{label}</p>
      <div className="mt-1 flex items-center gap-2">
        <span className="text-2xl font-semibold">{value}</span>
        {typeof delta === "number" && (
          <ToneBadge tones={variant}>
            {delta >= 0 ? "+" : ""}
            {delta}%
          </ToneBadge>
        )}
      </div>
    </div>
  )
}
