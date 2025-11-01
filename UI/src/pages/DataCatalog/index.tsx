import { useEffect, useState } from "react"

type Quote = {
  symbol: string
  shortName?: string
  regularMarketPrice?: number
  regularMarketChangePercent?: number
}

export default function DataCatalog() {
  const [quotes, setQuotes] = useState<Quote[]>([])
  const [loading, setLoading] = useState(true)

useEffect(() => {
  async function fetchData() {
    try {
      setLoading(true);
      const symbols = ["AAPL", "MSFT", "GOOGL", "TSLA", "NVDA"];
      const res = await fetch(`http://localhost:4000/api/quote?symbols=${symbols.join(",")}`);
      const json = await res.json();
      setQuotes(json.quoteResponse?.result || []);
    } catch (err) {
      console.error("Fetch error:", err);
    } finally {
      setLoading(false);
    }
  }

  fetchData();
}, []);


  return (
    <div className="p-8">
      <h1 className="text-2xl font-bold mb-4">📊 Stock Catalog</h1>

      {loading && <p>Loading...</p>}

      {!loading && (
        <table className="min-w-full border border-gray-300 rounded-md shadow-sm">
          <thead className="bg-gray-100 text-gray-700">
            <tr>
              <th className="p-2 text-left">Symbol</th>
              <th className="p-2 text-left">Name</th>
              <th className="p-2 text-right">Price</th>
              <th className="p-2 text-right">Change (%)</th>
            </tr>
          </thead>
          <tbody>
            {quotes.map((q) => (
              <tr
                key={q.symbol}
                className="border-t hover:bg-gray-50 transition-colors duration-150"
              >
                <td className="p-2 font-medium">{q.symbol}</td>
                <td className="p-2 text-gray-700">{q.shortName || "—"}</td>
                <td className="p-2 text-right font-mono">
                  {q.regularMarketPrice?.toFixed(2) ?? "—"}
                </td>
                <td
                  className={`p-2 text-right font-mono ${
                    (q.regularMarketChangePercent ?? 0) >= 0
                      ? "text-green-600"
                      : "text-red-600"
                  }`}
                >
                  {q.regularMarketChangePercent?.toFixed(2) ?? "—"}%
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  )
}
