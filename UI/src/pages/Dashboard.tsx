import { useState } from "react"
import PortfolioTable from "../components/PortfolioTable"
import ChatBox from "../components/ChatBox"
import SuggestionDiff from "../components/SuggestionDiff"
import HistoryList from "../components/HistoryList"
import type { AIResponse } from "../types"

export default function Dashboard() {
  const [ai, setAI] = useState<AIResponse | null>(null)

  return (
    <div className="mx-auto max-w-7xl p-4 grid md:grid-cols-3 gap-4">
      <div className="md:col-span-1 space-y-4">
        <PortfolioTable />
        <HistoryList />
      </div>

      <div className="md:col-span-2 space-y-4">
        <ChatBox onAI={(resp) => setAI(resp)} />
        <SuggestionDiff ai={ai} />
      </div>
    </div>
  )
}
