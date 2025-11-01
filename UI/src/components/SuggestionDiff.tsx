import type { AIResponse } from "../types"
import { usePortfolioStore } from "../store/portfolioStore"

export default function SuggestionDiff({ ai }: { ai: AIResponse | null }) {
  const apply = usePortfolioStore((s) => s.applySuggestions)

  if (!ai) return null

  return (
    <div className="rounded-2xl bg-surface p-4 border border-white/5">
      <h2 className="text-lg font-semibold mb-2">AI Suggestions</h2>
      <p className="text-sm text-white/70 mb-4">{ai.summary}</p>
      <ul className="space-y-2">
        {ai.suggestions.map((s, i) => (
          <li key={i} className="text-sm border border-white/5 rounded p-2">
            <span className="font-mono">{s.ticker}</span> → <strong>{s.action}</strong>{" "}
            {s.newShares !== undefined ? `${s.newShares} shares` : s.amountPct !== undefined ? `${s.amountPct}%` : ""}
            <div className="text-white/60">{s.reason}</div>
          </li>
        ))}
      </ul>

      <div className="mt-4 flex gap-2">
        <button
          className="bg-lime/80 hover:bg-lime text-black font-medium rounded px-3 py-1.5"
          onClick={() => apply(ai.summary, ai.suggestions)}
        >
          Apply All
        </button>
      </div>
    </div>
  )
}