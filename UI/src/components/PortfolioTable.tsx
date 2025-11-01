import { useState } from "react"
import { usePortfolioStore } from "../store/portfolioStore"
import { fmtNum } from "../utils/formatters"

export default function PortfolioTable() {
  const { stocks, addStock, removeStock, updateStock, logSnapshot } = usePortfolioStore()
  const [form, setForm] = useState({ ticker: "", shares: 0, sector: "", price: 0 })

  const onAdd = () => {
    if (!form.ticker || form.shares <= 0) return
    addStock({ ticker: form.ticker.toUpperCase(), shares: Math.floor(form.shares), sector: form.sector, price: form.price })
    logSnapshot(`Added ${form.ticker.toUpperCase()} (${form.shares} shares)`)
    setForm({ ticker: "", shares: 0, sector: "", price: 0 })
  }

  return (
    <div className="rounded-2xl bg-surface p-4 border border-white/5">
      <h2 className="text-lg font-semibold mb-3">Portfolio</h2>
      <table className="w-full text-sm">
        <thead className="text-white/60">
          <tr>
            <th className="text-left py-2">Ticker</th>
            <th className="text-right">Shares</th>
            <th className="text-right">Price</th>
            <th className="text-right">Value</th>
            <th></th>
          </tr>
        </thead>
        <tbody>
          {stocks.map((s) => {
            const value = (s.price || 0) * s.shares
            return (
              <tr key={s.ticker} className="border-t border-white/5">
                <td className="py-2">{s.ticker}</td>
                <td className="text-right">
                  <input
                    type="number"
                    className="w-20 bg-transparent border border-white/10 rounded px-2 py-1 text-right"
                    value={s.shares}
                    onChange={(e) => updateStock(s.ticker, { shares: Math.max(0, parseInt(e.target.value || "0")) })}
                  />
                </td>
                <td className="text-right">
                  <input
                    type="number"
                    className="w-24 bg-transparent border border-white/10 rounded px-2 py-1 text-right"
                    value={s.price ?? 0}
                    onChange={(e) => updateStock(s.ticker, { price: Math.max(0, Number(e.target.value || "0")) })}
                  />
                </td>
                <td className="text-right">{fmtNum(value)}</td>
                <td className="text-right">
                  <button
                    className="text-red-400 hover:text-red-300 text-xs"
                    onClick={() => {
                      removeStock(s.ticker)
                      usePortfolioStore.getState().logSnapshot(`Removed ${s.ticker}`)
                    }}
                  >
                    Remove
                  </button>
                </td>
              </tr>
            )
          })}
        </tbody>
      </table>

      <div className="mt-4 grid grid-cols-4 gap-2">
        <input
          placeholder="Ticker"
          className="bg-transparent border border-white/10 rounded px-2 py-1"
          value={form.ticker}
          onChange={(e) => setForm((f) => ({ ...f, ticker: e.target.value }))}
        />
        <input
          placeholder="Shares"
          type="number"
          className="bg-transparent border border-white/10 rounded px-2 py-1"
          value={form.shares}
          onChange={(e) => setForm((f) => ({ ...f, shares: Number(e.target.value) }))}
        />
        <input
          placeholder="Sector"
          className="bg-transparent border border-white/10 rounded px-2 py-1"
          value={form.sector}
          onChange={(e) => setForm((f) => ({ ...f, sector: e.target.value }))}
        />
        <button className="bg-accent/80 hover:bg-accent text-black font-medium rounded px-3" onClick={onAdd}>
          Add
        </button>
      </div>
    </div>
  )
}