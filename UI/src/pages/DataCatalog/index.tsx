import { useEffect, useMemo, useRef, useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { ToneBadge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Skeleton } from "@/components/ui/skeleton"
import { RefreshCcw, TrendingDown, TrendingUp, Plus, Search, X } from "lucide-react"

type FinnhubQuote = {
  c?: number // current price
  d?: number // change
  dp?: number // percent change
  pc?: number // previous close
}

type QuoteRow = {
  symbol: string
  c?: number
  dp?: number
  pc?: number
}

type SearchHit = {
  symbol: string
  displaySymbol?: string
  description?: string
}

// 🔑 For dev only – fine to keep here now.
// Move to server/env for production.
const FINNHUB_KEY = "d435rb9r01qvk0jab6tgd435rb9r01qvk0jab6u0"

export default function DataCatalog() {
  // Watchlist & quotes
  const [symbols, setSymbols] = useState<string[]>(["AAPL", "MSFT", "GOOGL", "TSLA", "NVDA"])
  const [quotes, setQuotes] = useState<Record<string, QuoteRow>>({})
  const [loading, setLoading] = useState<boolean>(true)
  const [refreshing, setRefreshing] = useState<boolean>(false)
  const [error, setError] = useState<string | null>(null)
  const lastUpdatedRef = useRef<Date | null>(null)

  // Search
  const [query, setQuery] = useState("")
  const [searching, setSearching] = useState(false)
  const [hits, setHits] = useState<SearchHit[]>([])
  const searchDebounceRef = useRef<ReturnType<typeof setTimeout> | null>(null)
  const [showSuggestions, setShowSuggestions] = useState(false)

  const nf = useMemo(() => new Intl.NumberFormat("en-US", { maximumFractionDigits: 2 }), [])

  async function fetchQuote(symbol: string): Promise<QuoteRow> {
    const url = `https://finnhub.io/api/v1/quote?symbol=${encodeURIComponent(symbol)}&token=${FINNHUB_KEY}`
    const res = await fetch(url)
    if (!res.ok) throw new Error(`Quote failed for ${symbol}: ${res.status}`)
    const data: FinnhubQuote = await res.json()
    return { symbol, c: data.c, dp: data.dp, pc: data.pc }
  }

  async function fetchAll() {
    setError(null)
    setLoading(true)
    try {
      const rows = await Promise.all(symbols.map(fetchQuote))
      const map: Record<string, QuoteRow> = {}
      for (const r of rows) map[r.symbol] = r
      setQuotes(map)
      lastUpdatedRef.current = new Date()
    } catch (e: any) {
      setError(e?.message ?? "Failed to load quotes")
    } finally {
      setLoading(false)
    }
  }

  async function refresh() {
    setRefreshing(true)
    try {
      const rows = await Promise.all(symbols.map(fetchQuote))
      const map: Record<string, QuoteRow> = {}
      for (const r of rows) map[r.symbol] = r
      setQuotes(map)
      lastUpdatedRef.current = new Date()
    } catch (e: any) {
      setError(e?.message ?? "Failed to refresh")
    } finally {
      setRefreshing(false)
    }
  }

  // Initial load & whenever symbols change
  useEffect(() => {
    fetchAll()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [)

  // Live search (debounced)
  useEffect(() => {
    if (searchDebounceRef.current) clearTimeout(searchDebounceRef.current)

    if (!query.trim()) {
      setHits([])
      setShowSuggestions(false)
      return
    }

    searchDebounceRef.current = setTimeout(async () => {
      try {
        setSearching(true)
        const url = `https://finnhub.io/api/v1/search?q=${encodeURIComponent(query)}&token=${FINNHUB_KEY}`
        const res = await fetch(url)
        if (!res.ok) throw new Error(`Search failed: ${res.status}`)
        const data = await res.json()
        const results: SearchHit[] = (data?.result || [])
          .filter((r: any) => !!r.symbol)
          .slice(0, 8)
          .map((r: any) => ({
            symbol: r.symbol,
            displaySymbol: r.displaySymbol,
            description: r.description,
          }))
        setHits(results)
        setShowSuggestions(true)
      } catch (e) {
        // fail quietly in UI; user can still add manually
      } finally {
        setSearching(false)
      }
    }, 300)

    return () => {
      if (searchDebounceRef.current) clearTimeout(searchDebounceRef.current)
    }
  }, [query])

  function addSymbol(sym: string) {
    const s = sym.trim().toUpperCase()
    if (!s) return
    if (symbols.includes(s)) return
    setSymbols((prev) => [...prev, s])
    setQuery("")
    setHits([])
    setShowSuggestions(false)
  }

  function removeSymbol(sym: string) {
    setSymbols((prev) => prev.filter((x) => x !== sym))
  }

  const rows: QuoteRow[] = useMemo(
    () => symbols.map((s) => quotes[s] ?? { symbol: s }),
    [symbols, quotes]
  )

  const topGainer = useMemo(
    () => rows.slice().sort((a, b) => (b.dp ?? -Infinity) - (a.dp ?? -Infinity))[0],
    [rows]
  )
  const topLoser = useMemo(
    () => rows.slice().sort((a, b) => (a.dp ?? Infinity) - (b.dp ?? Infinity))[0],
    [rows]
  )
  const avgChange = useMemo(() => {
    const vals = rows.map((r) => r.dp).filter((v): v is number => typeof v === "number")
    if (!vals.length) return null
    return vals.reduce((a, b) => a + b, 0) / vals.length
  }, [rows])

  return (
    <div className="p-6 space-y-6">
      {/* Header / Controls */}
      <Card className="border-gray-200">
        <CardHeader className="pb-2">
          <div className="flex items-center justify-between flex-wrap gap-3">
            <div className="flex items-center gap-3">
              <CardTitle className="text-xl">Market Snapshot</CardTitle>
              <ToneBadge variant="secondary">{symbols.length} symbols</ToneBadge>
              {avgChange !== null && (
                <ToneBadge className={avgChange >= 0 ? "bg-emerald-100 text-emerald-800" : "bg-rose-100 text-rose-800"}>
                  {avgChange >= 0 ? (
                    <TrendingUp size={14} className="mr-1" />
                  ) : (
                    <TrendingDown size={14} className="mr-1" />
                  )}
                  Avg {avgChange.toFixed(2)}%
                </ToneBadge>
              )}
            </div>
            <div className="flex items-center gap-2">
              <Button variant="outline" size="sm" onClick={refresh} disabled={refreshing || loading}>
                <RefreshCcw className={`mr-2 h-4 w-4 ${refreshing ? "animate-spin" : ""}`} />
                Refresh
              </Button>
              {lastUpdatedRef.current && (
                <span className="text-xs text-gray-500">
                  Updated {lastUpdatedRef.current.toLocaleTimeString()}
                </span>
              )}
            </div>
          </div>
        </CardHeader>

        <CardContent>
          <div className="relative max-w-xl">
            <div className="flex gap-2">
              <div className="relative flex-1">
                <Search className="absolute left-2 top-1/2 -translate-y-1/2 text-gray-400" size={16} />
                <Input
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                  placeholder="Search company or ticker (e.g., Tesla or TSLA)…"
                  className="pl-8"
                  onFocus={() => query && hits.length > 0 && setShowSuggestions(true)}
                />
                {/* Suggestion dropdown */}
                {showSuggestions && (hits.length > 0 || searching) && (
                  <div className="absolute z-10 mt-1 w-full rounded-md border bg-white shadow-md">
                    {searching && (
                      <div className="p-3 text-sm text-gray-500">Searching…</div>
                    )}
                    {!searching &&
                      hits.map((h) => (
                        <button
                          key={h.symbol}
                          onClick={() => addSymbol(h.symbol)}
                          className="w-full text-left px-3 py-2 text-sm hover:bg-gray-50"
                        >
                          <div className="flex items-center justify-between">
                            <span className="font-medium">{h.displaySymbol || h.symbol}</span>
                            <ToneBadge variant="outline">{h.symbol}</ToneBadge>
                          </div>
                          <div className="text-xs text-gray-500 truncate">{h.description}</div>
                        </button>
                      ))}
                  </div>
                )}
              </div>
              <Button onClick={() => addSymbol(query)}>
                <Plus className="mr-2 h-4 w-4" />
                Add
              </Button>
              {query && (
                <Button variant="ghost" onClick={() => { setQuery(""); setHits([]); setShowSuggestions(false); }}>
                  <X className="h-4 w-4" />
                </Button>
              )}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Highlights */}
      <div className="grid gap-4 sm:grid-cols-2">
        <Card className="border-emerald-200/60">
          <CardHeader className="pb-1">
            <CardTitle className="text-base flex items-center gap-2 text-emerald-700">
              <TrendingUp size={16} /> Top Gainer
            </CardTitle>
          </CardHeader>
          <CardContent>
            {loading ? (
              <div className="space-y-2">
                <Skeleton className="h-6 w-24" />
                <Skeleton className="h-8 w-32" />
              </div>
            ) : topGainer?.symbol ? (
              <div className="flex items-end justify-between">
                <div>
                  <div className="text-sm text-gray-500">{topGainer.symbol}</div>
                  <div className="text-2xl font-semibold">
                    {topGainer.c != null ? `$${nf.format(topGainer.c)}` : "—"}
                  </div>
                </div>
                <ToneBadge className="bg-emerald-100 text-emerald-800">
                  +{(topGainer.dp ?? 0).toFixed(2)}%
                </ToneBadge>
              </div>
            ) : (
              <div className="text-sm text-gray-500">No data</div>
            )}
          </CardContent>
        </Card>

        <Card className="border-rose-200/60">
          <CardHeader className="pb-1">
            <CardTitle className="text-base flex items-center gap-2 text-rose-700">
              <TrendingDown size={16} /> Top Loser
            </CardTitle>
          </CardHeader>
          <CardContent>
            {loading ? (
              <div className="space-y-2">
                <Skeleton className="h-6 w-24" />
                <Skeleton className="h-8 w-32" />
              </div>
            ) : topLoser?.symbol ? (
              <div className="flex items-end justify-between">
                <div>
                  <div className="text-sm text-gray-500">{topLoser.symbol}</div>
                  <div className="text-2xl font-semibold">
                    {topLoser.c != null ? `$${nf.format(topLoser.c)}` : "—"}
                  </div>
                </div>
                <ToneBadge className="bg-rose-100 text-rose-800">
                  {(topLoser.dp ?? 0).toFixed(2)}%
                </ToneBadge>
              </div>
            ) : (
              <div className="text-sm text-gray-500">No data</div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Cards grid */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {loading
          ? Array.from({ length: 6 }).map((_, i) => (
              <Card key={i}>
                <CardContent className="p-4 space-y-3">
                  <Skeleton className="h-5 w-24" />
                  <Skeleton className="h-8 w-28" />
                  <Skeleton className="h-4 w-20" />
                </CardContent>
              </Card>
            ))
          : rows.map((r) => {
              const up = (r.dp ?? 0) >= 0
              return (
                <Card
                  key={r.symbol}
                  className={`transition-all hover:shadow-md ${
                    up ? "border-emerald-200" : "border-rose-200"
                  }`}
                >
                  <CardContent className="p-4">
                    <div className="flex items-center justify-between mb-2">
                      <ToneBadge variant="secondary">{r.symbol}</ToneBadge>
                      <Button
                        size="sm"
                        variant="ghost"
                        className="text-gray-500"
                        onClick={() => removeSymbol(r.symbol)}
                        title="Remove from watchlist"
                      >
                        <X size={16} />
                      </Button>
                    </div>
                    <div className="text-2xl font-semibold">
                      {r.c != null ? `$${nf.format(r.c)}` : "—"}
                    </div>
                    <div
                      className={`mt-1 text-sm flex items-center ${
                        up ? "text-emerald-600" : "text-rose-600"
                      }`}
                    >
                      {up ? <TrendingUp size={16} className="mr-1" /> : <TrendingDown size={16} className="mr-1" />}
                      {(r.dp ?? 0).toFixed(2)}%
                      {r.pc != null && (
                        <span className="ml-2 text-gray-400">
                          Prev: ${nf.format(r.pc)}
                        </span>
                      )}
                    </div>
                  </CardContent>
                </Card>
              )
            })}
      </div>

      {/* Table */}
      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-lg">All Symbols</CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Symbol</TableHead>
                  <TableHead className="text-right">Price</TableHead>
                  <TableHead className="text-right">Change (%)</TableHead>
                  <TableHead className="text-right">Prev Close</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {loading ? (
                  Array.from({ length: 5 }).map((_, i) => (
                    <TableRow key={i}>
                      <TableCell><Skeleton className="h-5 w-16" /></TableCell>
                      <TableCell className="text-right"><Skeleton className="h-5 w-16 ml-auto" /></TableCell>
                      <TableCell className="text-right"><Skeleton className="h-5 w-16 ml-auto" /></TableCell>
                      <TableCell className="text-right"><Skeleton className="h-5 w-16 ml-auto" /></TableCell>
                    </TableRow>
                  ))
                ) : rows.length ? (
                  rows.map((r) => {
                    const up = (r.dp ?? 0) >= 0
                    return (
                      <TableRow key={r.symbol} className="hover:bg-gray-50">
                        <TableCell>
                          <ToneBadge variant="outline">{r.symbol}</ToneBadge>
                        </TableCell>
                        <TableCell className="text-right">
                          {r.c != null ? `$${nf.format(r.c)}` : "—"}
                        </TableCell>
                        <TableCell className={`text-right ${up ? "text-emerald-600" : "text-rose-600"}`}>
                          {r.dp != null ? `${r.dp.toFixed(2)}%` : "—"}
                        </TableCell>
                        <TableCell className="text-right">
                          {r.pc != null ? `$${nf.format(r.pc)}` : "—"}
                        </TableCell>
                      </TableRow>
                    )
                  })
                ) : (
                  <TableRow>
                    <TableCell colSpan={4} className="text-center text-gray-500 py-10">
                      No data.
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>

      {/* Error banner */}
      {error && (
        <div className="rounded-md border border-rose-200 bg-rose-50 text-rose-800 p-3 text-sm">
          {error}
        </div>
      )}
    </div>
  )
}
