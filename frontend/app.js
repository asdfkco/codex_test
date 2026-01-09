const exchangeList = document.getElementById("exchange-list");
const exchangeDate = document.getElementById("exchange-date");
const cryptoList = document.getElementById("crypto-list");
const cryptoDate = document.getElementById("crypto-date");
const stockTable = document.getElementById("stock-table");
const stockDate = document.getElementById("stock-date");

const formatNumber = (value, digits = 2) => {
  if (value === null || value === undefined) {
    return "-";
  }
  return Number(value).toLocaleString("ko-KR", {
    minimumFractionDigits: digits,
    maximumFractionDigits: digits
  });
};

const formatWon = (value) => {
  if (value === null || value === undefined) {
    return "-";
  }
  return `${Number(value).toLocaleString("ko-KR")}원`;
};

const updateExchange = async () => {
  const response = await fetch("/api/exchange");
  if (!response.ok) {
    throw new Error("환율 데이터를 불러오지 못했습니다.");
  }
  const data = await response.json();
  exchangeDate.textContent = `기준일: ${data.date}`;
  const entries = Object.entries(data.rates || {});
  exchangeList.innerHTML = entries
    .map(
      ([currency, rate]) =>
        `<li><span>${currency}</span><span>${formatNumber(rate, 4)}</span></li>`
    )
    .join("");
};

const updateCrypto = async () => {
  const response = await fetch("/api/crypto");
  if (!response.ok) {
    throw new Error("코인 데이터를 불러오지 못했습니다.");
  }
  const data = await response.json();
  cryptoDate.textContent = `KRW 기준`; 
  const entries = Object.entries(data.prices || {});
  cryptoList.innerHTML = entries
    .map(
      ([symbol, price]) =>
        `<li><span>${symbol}</span><span>${formatWon(price)}</span></li>`
    )
    .join("");
};

const updateStocks = async () => {
  const response = await fetch("/api/stocks");
  if (!response.ok) {
    throw new Error("주식 데이터를 불러오지 못했습니다.");
  }
  const data = await response.json();
  stockDate.textContent = `업데이트: ${new Date(
    data.updatedAt
  ).toLocaleString("ko-KR")}`;
  stockTable.innerHTML = data.stocks
    .map((stock) => {
      const changeValue = stock.changePercent ?? 0;
      const changeClass = changeValue >= 0 ? "positive" : "negative";
      const changeText =
        stock.changePercent === null
          ? "-"
          : `${formatNumber(changeValue, 2)}%`;
      return `
        <div class="stock-row">
          <div class="stock-name">${stock.name}</div>
          <div class="stock-price">${formatWon(stock.price)}</div>
          <div class="stock-change ${changeClass}">${changeText}</div>
        </div>
      `;
    })
    .join("");
};

const loadAll = async () => {
  try {
    await Promise.all([updateExchange(), updateCrypto(), updateStocks()]);
  } catch (error) {
    console.error(error);
  }
};

loadAll();
setInterval(loadAll, 1000 * 60 * 5);
