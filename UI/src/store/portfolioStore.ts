import { create } from "zustand"
import { persist, createJSONStorage } from "zustand/middleware"
import type { AISuggestion, PortfolioSnapshot, Stock } from "../types"

type State = {
  stocks: Stock[]
  history: PortfolioSnapshot[]
}

type Actions = {
  addStock: (stock: Stock) => void
  removeStock: (ticker: string) => void
  updateStock: (ticker: string, partial: Partial<Stock>) => void
  logSnapshot: (reason: string, source?: "user" | "ai") => void
  applySuggestions: (summary: string, suggestions: AISuggestion[]) => void
  reset: () => void
}

const clone = <T,>(x: T): T => JSON.parse(JSON.stringify(x))

export const usePortfolioStore = create<State & Actions>()(
  persist(
    (set, get) => ({
      stocks: [
        { ticker: "AAPL", name: "Apple", sector: "Tech", shares: 10, price: 180 },
        { ticker: "XOM", name: "Exxon Mobil", sector: "Energy", shares: 5, price: 110 },
      ],
      history: [],

      addStock: (stock) => set((s) => ({ stocks: [...s.stocks, stock] })),
      removeStock: (ticker) =>
        set((s) => ({ stocks: s.stocks.filter((st) => st.ticker !== ticker) })),
      updateStock: (ticker, partial) =>
        set((s) => ({
          stocks: s.stocks.map((st) => (st.ticker === ticker ? { ...st, ...partial } : st)),
        })),

      logSnapshot: (reason, source = "user") => {
        const snap: PortfolioSnapshot = {
          id: crypto.randomUUID(),
          timestamp: new Date().toISOString(),
          portfolio: clone(get().stocks),
          changeReason: reason,
          source,
        }
        set((s) => ({ history: [snap, ...s.history] }))
      },

      applySuggestions: (summary, suggestions) => {
        const current = clone(get().stocks)
        const indexByTicker = new Map(current.map((s) => [s.ticker, s]))

        for (const sug of suggestions) {
          const row = indexByTicker.get(sug.ticker)
          if (!row) {
            if (sug.action === "buy" && sug.newShares && sug.newShares > 0) {
              indexByTicker.set(sug.ticker, {
                ticker: sug.ticker,
                shares: sug.newShares,
                name: sug.ticker,
              })
            }
            continue
          }

          if (sug.newShares !== undefined) {
            row.shares = Math.max(0, Math.floor(sug.newShares))
          } else if (sug.amountPct !== undefined) {
            const delta = Math.round((row.shares * sug.amountPct) / 100)
            row.shares = Math.max(0, row.shares + (sug.action === "decrease" || sug.action === "sell" ? -delta : delta))
          } else if (sug.action === "sell") {
            row.shares = 0
          }
        }

        set({ stocks: Array.from(indexByTicker.values()) })
        get().logSnapshot(summary, "ai")
      },

      reset: () => set({ stocks: [], history: [] }),
    }),
    {
      name: "indorex-portfolio",
      storage: createJSONStorage(() => localStorage),
      version: 1,
    }
  )
)
