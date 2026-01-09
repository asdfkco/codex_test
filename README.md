# 한국 주요 환율/코인/주식 대시보드

한국 주요 환율, 코인, 주식 시세를 한눈에 볼 수 있는 웹 앱과 백엔드를 구현했습니다.
무료로 사용할 수 있는 공개 API만 사용했으며, Docker Compose로 프론트엔드와 백엔드를 함께 실행할 수 있습니다.

## 사용한 무료 API

- 환율: [exchangerate.host](https://exchangerate.host)
- 코인: [CoinGecko](https://www.coingecko.com/)
- 주식: Yahoo Finance (공식 문서 없는 공개 엔드포인트)

## 실행 방법

```bash
docker compose up --build
```

- 프론트엔드: http://localhost:8080
- 백엔드: http://localhost:4000

## 백엔드 API

- `GET /api/exchange`: KRW 기준 USD/JPY/EUR/CNY 환율
- `GET /api/crypto`: BTC/ETH/XRP KRW 시세
- `GET /api/stocks`: 삼성전자/하이닉스/네이버/카카오 시세
