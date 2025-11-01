import Dashboard from "./pages/Dashboard"

export default function App() {
  console.log("App mounted")

  return (
    <div className="min-h-screen bg-black text-white">
      <header className="border-b border-white/20 p-4 flex justify-between items-center">
        <h1 className="text-xl font-bold">Indorex AI</h1>
        <p className="text-sm text-gray-400">Turning Regulation into Financial Insight</p>
      </header>

      <main className="p-4">
        <Dashboard />
      </main>
    </div>
  )
}
