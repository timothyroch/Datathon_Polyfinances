import { useState } from "react"
import { UploadCloud, FileText, Trash2, Loader2 } from "lucide-react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Progress } from "@/components/ui/progress"
// using native textarea instead of missing Textarea component

type FileItem = {
  id: string
  file: File
  progress: number
  status: "pending" | "uploading" | "done"
}

export default function Ingestion() {
  const [files, setFiles] = useState<FileItem[]>([])
  const [context, setContext] = useState("")

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

  return (
    <div className="p-8 space-y-8">
      <div className="max-w-5xl mx-auto space-y-8">
        <Card className="border border-gray-200 shadow-sm bg-white/80 backdrop-blur-md">
          <CardHeader>
            <CardTitle className="text-2xl font-semibold text-gray-900">
              Data Ingestion & Upload
            </CardTitle>
            <p className="text-sm text-gray-500">
              Upload CSV, JSON, or PDF documents to feed Indorex AI with new insights.
            </p>
          </CardHeader>

          <CardContent className="space-y-6">
            {/* Dropzone */}
            <label
              htmlFor="fileInput"
              className="border-2 border-dashed border-gray-300 rounded-xl flex flex-col items-center justify-center py-16 cursor-pointer hover:border-blue-400 transition"
            >
              <UploadCloud size={36} className="text-blue-500 mb-3" />
              <span className="text-gray-700 font-medium">Click or drag files here</span>
              <span className="text-sm text-gray-400">Supported: .csv, .json, .pdf</span>
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
                        <p className="text-sm font-medium text-gray-800">{file.name}</p>
                        <p className="text-xs text-gray-500">
                          {(file.size / 1024).toFixed(1)} KB • {file.type || "unknown"}
                        </p>
                      </div>
                    </div>

                    <div className="flex items-center gap-2">
                      {status === "uploading" ? (
                        <Loader2 className="animate-spin text-blue-500" size={18} />
                      ) : status === "done" ? (
                        <span className="text-green-600 text-xs font-medium">Uploaded</span>
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

            {/* Progress summary */}
            {files.some((f) => f.status === "uploading") && (
              <div className="pt-2">
                <Progress
                  value={
                    files.reduce((sum, f) => sum + f.progress, 0) / files.length
                  }
                  className="h-2"
                />
                <p className="text-xs text-gray-500 mt-1">
                  Uploading... {Math.round(
                    files.reduce((sum, f) => sum + f.progress, 0) / files.length
                  )}
                  %
                </p>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Context Card */}
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
              onChange={(e) => setContext((e.target as HTMLTextAreaElement).value)}
              className="min-h-[120px] border-gray-300 focus-visible:ring-blue-400 w-full p-2 rounded"
            />
            <div className="text-right mt-4">
              <Button className="bg-blue-600 hover:bg-blue-700 text-white shadow">
                Send to AI
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}