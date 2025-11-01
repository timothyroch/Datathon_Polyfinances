import { usePortfolioStore } from "../store/portfolioStore"

export default function HistoryList() {
  const history = usePortfolioStore((s) => s.history)

  return (
    <div className="rounded-2xl bg-surface p-4 border border-white/5">
      <h2 className="text-lg font-semibold mb-3">Change History</h2>
      {history.length === 0 && <p className="text-sm text-white/60">No changes yet.</p>}
      <ul className="space-y-3">
        {history.map((h) => (
          <li key={h.id} className="border border-white/5 rounded p-3">
            <div className="text-xs text-white/60">
              {new Date(h.timestamp).toLocaleString()} · {h.source === "ai" ? "AI" : "User"}
            </div>
            <div className="text-sm">{h.changeReason}</div>
          </li>
        ))}
      </ul>
    </div>
  )
}
