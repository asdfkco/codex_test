import express from "express";
import cors from "cors";

const app = express();
const port = process.env.PORT || 4000;

app.use(cors());

const EXCHANGE_URL = "https://api.exchangerate.host/latest?base=KRW";
const CRYPTO_URL =
  "https://api.coingecko.com/api/v3/simple/price?ids=bitcoin,ethereum,ripple&vs_currencies=krw";
const STOCK_SYMBOLS = [
  { symbol: "005930.KS", name: "Samsung Electronics" },
  { symbol: "000660.KS", name: "SK Hynix" },
  { symbol: "035420.KS", name: "NAVER" },
  { symbol: "035720.KS", name: "Kakao" }
];

app.get("/api/health", (_req, res) => {
  res.json({ status: "ok" });
});

app.get("/api/exchange", async (_req, res) => {
  try {
    const response = await fetch(EXCHANGE_URL);
    if (!response.ok) {
      throw new Error("Failed to fetch exchange data");
    }
    const data = await response.json();
    const rates = data?.rates || {};
    res.json({
      base: data.base,
      date: data.date,
      rates: {
        USD: rates.USD,
        JPY: rates.JPY,
        EUR: rates.EUR,
        CNY: rates.CNY
      }
    });
  } catch (error) {
    res.status(502).json({ error: error.message });
  }
});

app.get("/api/crypto", async (_req, res) => {
  try {
    const response = await fetch(CRYPTO_URL);
    if (!response.ok) {
      throw new Error("Failed to fetch crypto data");
    }
    const data = await response.json();
    res.json({
      currency: "KRW",
      prices: {
        BTC: data.bitcoin?.krw,
        ETH: data.ethereum?.krw,
        XRP: data.ripple?.krw
      }
    });
  } catch (error) {
    res.status(502).json({ error: error.message });
  }
});

app.get("/api/stocks", async (_req, res) => {
  try {
    const symbols = STOCK_SYMBOLS.map((item) => item.symbol).join(",");
    const response = await fetch(
      `https://query1.finance.yahoo.com/v7/finance/quote?symbols=${symbols}`
    );
    if (!response.ok) {
      throw new Error("Failed to fetch stock data");
    }
    const data = await response.json();
    const quotes = data?.quoteResponse?.result || [];
    const mapped = STOCK_SYMBOLS.map((item) => {
      const quote = quotes.find((entry) => entry.symbol === item.symbol);
      return {
        symbol: item.symbol,
        name: item.name,
        price: quote?.regularMarketPrice ?? null,
        change: quote?.regularMarketChange ?? null,
        changePercent: quote?.regularMarketChangePercent ?? null,
        currency: quote?.currency ?? "KRW"
      };
    });
    res.json({
      updatedAt: new Date().toISOString(),
      stocks: mapped
    });
  } catch (error) {
    res.status(502).json({ error: error.message });
  }
});

app.listen(port, () => {
  console.log(`Backend listening on port ${port}`);
});
