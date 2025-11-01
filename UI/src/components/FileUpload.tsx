import { useState } from "react"

type FileUploadProps = {
  onFilesUploaded: (files: File[]) => void
}

export default function FileUpload({ onFilesUploaded }: FileUploadProps) {
  const [files, setFiles] = useState<File[]>([])

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newFiles = Array.from(e.target.files || [])
    setFiles(newFiles)
    onFilesUploaded(newFiles)
  }

  return (
    <div className="p-4 bg-surface border border-white/10 rounded-xl">
      <h2 className="text-lg font-semibold mb-2 text-white/90">Upload Documents</h2>
      <input
        type="file"
        multiple
        onChange={handleFileChange}
        className="block w-full text-sm text-gray-300
                   file:mr-4 file:py-2 file:px-4
                   file:rounded-md file:border-0
                   file:text-sm file:font-semibold
                   file:bg-accent file:text-white
                   hover:file:bg-indigo-500"
      />
      {files.length > 0 && (
        <ul className="mt-3 text-sm text-gray-400 space-y-1">
          {files.map((f) => (
            <li key={f.name}>📄 {f.name}</li>
          ))}
        </ul>
      )}
    </div>
  )
}