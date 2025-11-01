import type { AIResponse, AISuggestion, Stock } from "../types"

function pick<T>(arr: T[], n = 2): T[] {
  const a = [...arr]
  const out: T[] = []
  while (a.length && out.length < n) {
    out.push(a.splice(Math.floor(Math.random() * a.length), 1)[0])
  }
  return out
}

/**
 * Mock AI: generates plausible suggestions based on current portfolio.
 * Replace later with a real LLM call.
 */
export async function askAI(input: {
  message: string
  portfolio: Stock[]
  documents: string[] // names only (for MVP)
}): Promise<AIResponse> {
  await new Promise((r) => setTimeout(r, 650))

  const techTickers = input.portfolio.filter((s) => (s.sector || "").toLowerCase().includes("tech")).map((s) => s.ticker)
  const nonTechTickers = input.portfolio.filter((s) => !(s.sector || "").toLowerCase().includes("tech")).map((s) => s.ticker)

  const suggestions: AISuggestion[] = [
    ...pick(techTickers, 1).map((t) => ({
      ticker: t,
      action: "decrease" as const,
      amountPct: 10,
      reason: "Reduce concentration risk in Tech under new regulation context.",
    })),
    ...pick(nonTechTickers.length ? nonTechTickers : ["XOM"], 1).map((t) => ({
      ticker: t,
      action: "increase" as const,
      amountPct: 5,
      reason: "Increase exposure to defensive/beneficiary sector per policy signals.",
    })),
  ]

  return {
    summary:
      "Balance sector exposure: trim Tech slightly, add to defensives. Rationale based on uploaded docs and portfolio context.",
    suggestions,
  }
}
