import { useState } from "react"
import data from "@/data/portfolio.json"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Progress } from "@/components/ui/progress"
import { ArrowUpRight, ArrowDownRight } from "lucide-react"

type Stock = {
  ticker: string
  name: string
  sector: string
  shares: number
  price: number
}

export default function PortfolioView() {
  const [portfolio, setPortfolio] = useState<Stock[]>(data)

  const updateStock = (ticker: string, field: keyof Stock, value: string) => {
    setPortfolio((p) =>
      p.map((stock) =>
        stock.ticker === ticker
          ? { ...stock, [field]: field === "shares" || field === "price" ? Number(value) : value }
          : stock
      )
    )
  }

  const totalValue = portfolio.reduce((sum, s) => sum + s.shares * s.price, 0)
  const topStock = [...portfolio].sort((a, b) => b.shares * b.price - a.shares * a.price)[0]

  return (
    <div className="p-8 space-y-8 bg-gradient-to-b from-white to-gray-50 rounded-xl min-h-screen">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-semibold tracking-tight text-gray-800">
          Portfolio Overview
        </h1>
        <Button className="bg-blue-600 hover:bg-blue-700 text-white rounded-lg px-4 shadow-sm transition">
          + Add Stock
        </Button>
      </div>

      <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
        {portfolio.map((stock) => {
          const value = stock.shares * stock.price
          const weight = (value / totalValue) * 100
          const isTop = stock.ticker === topStock.ticker

          return (
            <Card
              key={stock.ticker}
              className={`relative group transition-all duration-300 border border-gray-200 bg-white hover:shadow-md ${
                isTop ? "ring-2 ring-blue-400/40" : ""
              }`}
            >
              <CardHeader className="pb-3">
                <div className="flex justify-between items-center">
                  <CardTitle className="text-lg font-semibold text-gray-900">
                    {stock.name}
                  </CardTitle>
                  <span className="text-gray-500 font-mono">{stock.ticker}</span>
                </div>
                <p className="text-xs text-gray-500">{stock.sector}</p>
              </CardHeader>

              <CardContent className="space-y-3">
                <div className="flex gap-2 items-center">
                  <span className="text-sm w-16 text-gray-600">Shares</span>
                  <Input
                    type="number"
                    value={stock.shares}
                    onChange={(e) => updateStock(stock.ticker, "shares", e.target.value)}
                    className="bg-white border-gray-300 focus-visible:ring-blue-400"
                  />
                </div>

                <div className="flex gap-2 items-center">
                  <span className="text-sm w-16 text-gray-600">Price</span>
                  <Input
                    type="number"
                    value={stock.price}
                    onChange={(e) => updateStock(stock.ticker, "price", e.target.value)}
                    className="bg-white border-gray-300 focus-visible:ring-blue-400"
                  />
                </div>

                <div className="flex justify-between items-center pt-2">
                  <span className="text-sm text-gray-600">Value</span>
                  <span className="font-medium text-gray-900">
                    ${value.toLocaleString()}
                  </span>
                </div>

                <Progress value={weight} className="h-2 bg-gray-100" />
                <div className="flex justify-between text-xs text-gray-500">
                  <span>{weight.toFixed(1)}% of portfolio</span>
                  {Math.random() > 0.5 ? (
                    <span className="text-green-600 flex items-center gap-1">
                      <ArrowUpRight size={12} /> +{(Math.random() * 5).toFixed(2)}%
                    </span>
                  ) : (
                    <span className="text-red-600 flex items-center gap-1">
                      <ArrowDownRight size={12} /> -{(Math.random() * 4).toFixed(2)}%
                    </span>
                  )}
                </div>
              </CardContent>
            </Card>
          )
        })}
      </div>

      <Card className="bg-gray-50 border-gray-200 shadow-sm">
        <CardContent className="p-6 text-right">
          <h2 className="text-xl font-semibold text-gray-800">
            Total Value:{" "}
            <span className="text-blue-600">
              ${totalValue.toLocaleString()}
            </span>
          </h2>
          <p className="text-sm text-gray-500 mt-1">
            Portfolio contains {portfolio.length} assets across{" "}
            {[...new Set(portfolio.map((p) => p.sector))].length} sectors.
          </p>
        </CardContent>
      </Card>
    </div>
  )
}
