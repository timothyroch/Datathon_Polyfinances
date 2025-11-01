import express from "express";
import fetch from "node-fetch";
import cors from "cors";

const app = express();
app.use(cors());
const PORT = 4000;

const FINNHUB_API_KEY = "d435rb9r01qvk0jab6tgd435rb9r01qvk0jab6u0";

app.get("/api/quote", async (req, res) => {
  const symbols = (req.query.symbols || "AAPL,MSFT,GOOGL,TSLA,NVDA").split(",");

  try {
    const results = await Promise.all(
      symbols.map(async (symbol) => {
        const url = `https://finnhub.io/api/v1/quote?symbol=${symbol}&token=${FINNHUB_API_KEY}`;
        const r = await fetch(url);

        if (!r.ok) {
          const text = await r.text();
          throw new Error(`Finnhub request failed (${r.status}): ${text}`);
        }

        const d = await r.json();
        return {
          symbol,
          regularMarketPrice: d.c,
          regularMarketChangePercent:
            d.pc && d.c ? ((d.c - d.pc) / d.pc) * 100 : null,
        };
      })
    );

    res.json({ quoteResponse: { result: results } });
  } catch (err) {
    console.error("Finnhub fetch error:", err);
    res.status(500).json({ error: err.message });
  }
});

app.listen(PORT, () =>
  console.log(`Server running on http://localhost:${PORT}`)
);
