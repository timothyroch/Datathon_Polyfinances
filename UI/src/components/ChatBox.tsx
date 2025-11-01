import { useState } from "react"
import { askAI } from "../api/aiClient"
import { usePortfolioStore } from "../store/portfolioStore"
import type { AIResponse } from "../types"
import FileUpload from "./FileUpload"

export default function ChatBox({ onAI }: { onAI: (resp: AIResponse) => void }) {
  const [message, setMessage] = useState("")
  const [files, setFiles] = useState<File[]>([])
  const [loading, setLoading] = useState(false)
  const portfolio = usePortfolioStore((s) => s.stocks)

  async function send() {
    if (!message.trim()) return
    setLoading(true)
    try {
      const resp = await askAI({
        message,
        portfolio,
        documents: files.map((f) => f.name),
      })
      onAI(resp)
    } finally {
      setLoading(false)
      setMessage("")
    }
  }

  return (
    <div className="rounded-2xl bg-surface p-4 border border-white/5">
      <h2 className="text-lg font-semibold mb-3">Chat with Indorex AI</h2>

      <div className="mb-2">
        <FileUpload onFilesUploaded={setFiles} />
        {files.length > 0 && (
          <p className="text-xs text-white/60 mt-2">
            {files.length} document(s) attached
          </p>
        )}
      </div>

      <div className="flex gap-2">
        <input
          className="flex-1 bg-transparent border border-white/10 rounded px-3 py-2"
          placeholder="Ask about your portfolio or the uploaded documents…"
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && send()}
        />
        <button
          className="bg-accent/80 hover:bg-accent text-black font-medium rounded px-4 disabled:opacity-50"
          onClick={send}
          disabled={loading}
        >
          {loading ? "Thinking…" : "Send"}
        </button>
      </div>
    </div>
  )
}
