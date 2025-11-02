import { useState } from "react"
import { UploadCloud, FileText, Trash2, Loader2 } from "lucide-react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Progress } from "@/components/ui/progress"

// Import the user's current holdings (ensure tsconfig has "resolveJsonModule": true)
import portfolio from "@/data/portfolio.json"

type FileItem = {
  id: string
  file: File
  progress: number
  status: "pending" | "uploading" | "done"
}

const API_URL =
  import.meta.env.VITE_API_URL ||
  "https://1pixxoj603.execute-api.us-east-1.amazonaws.com/prod/"

export default function Ingestion() {
  const [files, setFiles] = useState<FileItem[]>([])
  const [context, setContext] = useState("")
  const [loading, setLoading] = useState(false)
  const [response, setResponse] = useState("")

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files) return
    const newFiles = Array.from(e.target.files).map((f) => ({
      id: crypto.randomUUID(),
      file: f,
      progress: 0,
      status: "pending" as const,
    }))
    setFiles((prev) => [...prev, ...newFiles])
  }

  const handleDelete = (id: string) => {
    setFiles((prev) => prev.filter((f) => f.id !== id))
  }

  const handleSendToAI = async () => {
    setLoading(true)
    setResponse("")
    try {
      // Build a compact payload: user context + current portfolio + file metadata
      const payload = {
        context,
        portfolio, // comes from src/data/portfolio.json
        files: files.map((f) => ({
          name: f.file.name,
          type: f.file.type || "unknown",
          size: f.file.size,
        })),
      }

      // Compose a friendly analysis request
      const message = [
        "You are a financial analysis assistant.",
        "Analyze the user's current stock portfolio and any provided context.",
        "Return a concise, structured assessment (exposure by sector, concentration risks, notable metrics, and a short summary).",
        "",
        "Input JSON:",
        JSON.stringify(payload, null, 2),
      ].join("\n")

      const res = await fetch(API_URL, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ message }),
      })

      // The GAAB proxy usually returns { answer, ... } — fall back to text if different
      const data = await res.json().catch(() => ({} as any))
      const answer =
        (data && (data.answer || data.output || data.response)) ??
        JSON.stringify(data, null, 2)

      setResponse(answer || "No response from AI.")
    } catch (err: any) {
      console.error(err)
      setResponse(
        err?.message
          ? `Error contacting AI: ${err.message}`
          : "Error contacting AI."
      )
    } finally {
      setLoading(false)
    }
  }

  const averageProgress =
    files.length > 0
      ? Math.round(files.reduce((sum, f) => sum + f.progress, 0) / files.length)
      : 0

  return (
    <div className="p-8 space-y-8">
      <div className="max-w-5xl mx-auto space-y-8">
        {/* Upload Card */}
        <Card className="border border-gray-200 shadow-sm bg-white/80 backdrop-blur-md">
          <CardHeader>
            <CardTitle className="text-2xl font-semibold text-gray-900">
              Data Ingestion & Upload
            </CardTitle>
            <p className="text-sm text-gray-500">
              Upload CSV, JSON, or PDF documents to feed Indorex AI with new
              insights.
            </p>
          </CardHeader>

          <CardContent className="space-y-6">
            {/* Dropzone */}
            <label
              htmlFor="fileInput"
              className="border-2 border-dashed border-gray-300 rounded-xl flex flex-col items-center justify-center py-16 cursor-pointer hover:border-blue-400 transition"
            >
              <UploadCloud size={36} className="text-blue-500 mb-3" />
              <span className="text-gray-700 font-medium">
                Click or drag files here
              </span>
              <span className="text-sm text-gray-400">
                Supported: .csv, .json, .pdf
              </span>
              <Input
                id="fileInput"
                type="file"
                multiple
                onChange={handleFileChange}
                className="hidden"
              />
            </label>

            {/* File list */}
            {files.length > 0 && (
              <div className="space-y-3">
                {files.map(({ id, file, progress, status }) => (
                  <div
                    key={id}
                    className="flex items-center justify-between border border-gray-200 rounded-lg p-3 hover:bg-gray-50 transition"
                  >
                    <div className="flex items-center gap-3">
                      <FileText className="text-gray-400" size={20} />
                      <div>
                        <p className="text-sm font-medium text-gray-800">
                          {file.name}
                        </p>
                        <p className="text-xs text-gray-500">
                          {(file.size / 1024).toFixed(1)} KB •{" "}
                          {file.type || "unknown"}
                        </p>
                      </div>
                    </div>

                    <div className="flex items-center gap-2">
                      {status === "uploading" ? (
                        <Loader2 className="animate-spin text-blue-500" size={18} />
                      ) : status === "done" ? (
                        <span className="text-green-600 text-xs font-medium">
                          Uploaded
                        </span>
                      ) : null}
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => handleDelete(id)}
                        className="hover:bg-red-50 text-red-500"
                      >
                        <Trash2 size={16} />
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            )}

            {/* Progress summary (for future real uploads) */}
            {files.some((f) => f.status === "uploading") && (
              <div className="pt-2">
                <Progress value={averageProgress} className="h-2" />
                <p className="text-xs text-gray-500 mt-1">
                  Uploading... {averageProgress}%
                </p>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Context + Send to AI */}
        <Card className="border border-gray-200 bg-gray-50 shadow-sm">
          <CardHeader>
            <CardTitle className="text-lg font-semibold text-gray-800">
              Context Description (optional)
            </CardTitle>
          </CardHeader>
          <CardContent>
            <textarea
              placeholder="Add notes about what this data represents or what you’d like the AI to focus on..."
              value={context}
              onChange={(e) => setContext(e.target.value)}
              className="min-h-[120px] border-gray-300 focus-visible:ring-blue-400 w-full p-2 rounded"
            />
            <div className="flex items-center justify-end mt-4 gap-3">
              <Button
                className="bg-blue-600 hover:bg-blue-700 text-white shadow"
                onClick={handleSendToAI}
                disabled={loading}
              >
                {loading ? "Analyzing..." : "Send to AI"}
              </Button>
            </div>

            {response && (
              <div className="mt-6 p-4 border border-gray-200 rounded-lg bg-white shadow-sm text-gray-800">
                <p className="font-medium">AI Response</p>
                <pre className="mt-2 whitespace-pre-wrap text-sm">
                  {response}
                </pre>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
