import express from "express";
import fetch from "node-fetch";
import cors from "cors";

const app = express();
app.use(cors());
const PORT = 4000;

// ✅ RapidAPI Yahoo Finance key (yours)
const RAPIDAPI_KEY = "86b2ab80c1msheec1b33946450f9p170a2cjsnf6df14fea82c";

app.get("/api/quote", async (req, res) => {
  const symbols = req.query.symbols || "AAPL,MSFT,GOOGL,TSLA,NVDA";

  try {
    // ✅ First, try Yahoo Finance (newer endpoint)
    const yahooUrl = `https://yahoo-finance15.p.rapidapi.com/api/yahoo/qu/quote/${symbols}`;
    const yahooResponse = await fetch(yahooUrl, {
      headers: {
        "X-RapidAPI-Key": RAPIDAPI_KEY,
        "X-RapidAPI-Host": "yahoo-finance15.p.rapidapi.com",
      },
    });

    if (yahooResponse.ok) {
      const yahooData = await yahooResponse.json();
      return res.json(yahooData);
    } else {
      console.warn("Yahoo failed:", yahooResponse.status, yahooResponse.statusText);
    }

    // ✅ Fallback: use FinancialModelingPrep (free, no key needed for demo)
    const fmpUrl = `https://financialmodelingprep.com/api/v3/quote/${symbols}?apikey=demo`;
    const fmpResponse = await fetch(fmpUrl);
    const fmpData = await fmpResponse.json();

    // match the Yahoo response shape for your frontend
    res.json({ quoteResponse: { result: fmpData } });
  } catch (err) {
    console.error("Fetch error:", err.message);
    res.status(500).json({ error: err.message });
  }
});

app.listen(PORT, () =>
  console.log(`✅ Server running on http://localhost:${PORT}`)
);
