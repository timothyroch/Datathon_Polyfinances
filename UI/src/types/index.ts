export type Stock = {
  ticker: string
  name?: string
  sector?: string
  shares: number
  price?: number
}

export type AISuggestion = {
  ticker: string
  action: "increase" | "decrease" | "buy" | "sell" | "hold"
  amountPct?: number        // e.g. 10 means +10% or -10% of current shares
  newShares?: number        // absolute shares target (if provided, use this)
  reason: string
}

export type AIResponse = {
  summary: string
  suggestions: AISuggestion[]
}

export type PortfolioSnapshot = {
  id: string
  timestamp: string
  portfolio: Stock[]
  changeReason: string
  source: "user" | "ai"
}
