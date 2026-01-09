import express from "express";
import cors from "cors";

const app = express();
const port = process.env.PORT || 4000;

app.use(cors());

const EXCHANGE_URL = "https://open.er-api.com/v6/latest/KRW";
const YAHOO_CHART_URL = "https://query2.finance.yahoo.com/v8/finance/chart";
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
    if (data?.result !== "success") {
      throw new Error("Failed to fetch exchange data");
    }
    const rates = data?.rates || {};
    res.json({
      base: data.base_code,
      date: data.time_last_update_utc,
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
    const mapped = await Promise.all(
      STOCK_SYMBOLS.map(async (item) => {
        const response = await fetch(`${YAHOO_CHART_URL}/${item.symbol}`, {
          headers: { "User-Agent": "Mozilla/5.0" }
        });
        if (!response.ok) {
          throw new Error("Failed to fetch stock data");
        }
        const data = await response.json();
        const meta = data?.chart?.result?.[0]?.meta;
        const price = meta?.regularMarketPrice ?? null;
        const previousClose = meta?.chartPreviousClose ?? meta?.previousClose ?? null;
        const change = price !== null && previousClose !== null ? price - previousClose : null;
        const changePercent =
          change !== null && previousClose ? (change / previousClose) * 100 : null;
        return {
          symbol: item.symbol,
          name: item.name,
          price,
          change,
          changePercent,
          currency: meta?.currency ?? "KRW"
        };
      })
    );
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
