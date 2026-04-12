# Finwise

A real-time stock tracking web application built with vanilla JavaScript, HTML, and CSS.

---

## Overview

Finwise fetches live stock market data from a public API and presents it through a clean, responsive interface. Users can monitor a default watchlist of popular stocks, search for any symbol, and interact with the data through sorting and filtering controls. The application also supports a dark and light theme that persists across sessions.

---

## API

**Finnhub Stock API**
Site: https://finnhub.io
Endpoint used: `GET /quote`

The quote endpoint returns the current price, daily change, percentage change, open, high, low, and previous close for a given stock symbol. A free API key is required and can be obtained at https://finnhub.io/register.

---

## Features

### Core Features

- **Live stock data** — Fetches real-time quotes for a default watchlist of 10 stocks using the Fetch API
- **Symbol search** — Allows users to look up any valid stock symbol and view its current quote
- **Filter** — Filters the watchlist to show only gaining or losing stocks
- **Sort** — Sorts watchlist stocks by price (ascending or descending), percentage change, or company name alphabetically
- **Dark / Light theme** — Toggle between themes; the user's preference is saved to localStorage and restored on the next visit
- **Loading states** — Animated indicators are shown while data is being fetched
- **Error handling** — Descriptive error messages are displayed for failed API calls or invalid symbols
- **Responsive design** — Layout adjusts for mobile, tablet, and desktop screen sizes

### JavaScript Concepts Used

- `Array.prototype.filter` — for filtering gainers and losers
- `Array.prototype.sort` — for sorting by price, change, and name
- `Array.prototype.map` — for parallel API calls via `Promise.all`
- `async / await` with `fetch` — for asynchronous API integration
- `localStorage` — for persisting the user's theme preference
- DOM manipulation — for dynamically building and rendering stock cards

---

## Technologies

| Technology | Purpose |
|---|---|
| HTML5 | Page structure and markup |
| CSS3 | Styling, theming via CSS variables, animations |
| JavaScript (ES6+) | Application logic, API calls, DOM rendering |
| Finnhub API | Real-time stock quote data |
| Google Fonts | Typography (Syne, DM Mono) |

No frameworks or libraries are used. The project is built entirely with vanilla web technologies.

---

## Project Structure

```
Finwise/
├── index.html      # Page structure and markup
├── style.css       # All styles, theme variables, responsive layout
├── app.js          # API integration, rendering, search, sort, filter, theme logic
└── README.md       # Project documentation
```

---

## Watchlist

The default watchlist includes the following symbols:

Apple (AAPL), Alphabet (GOOGL), Microsoft (MSFT), Tesla (TSLA), Amazon (AMZN), Meta (META), AVG Technologies (AVG0), Alibaba (BABA), Disney (DIS)

The watchlist can be modified by editing the `WATCHLIST` array in `app.js`.

---

## Notes

- Market data is only available during US market trading hours (9:30 AM to 4:00 PM ET, Monday to Friday). Outside of these hours, some symbols may return no data.
- The Finnhub `/quote` endpoint does not return company names. A local mapping object in `app.js` provides names for the default watchlist symbols. Searched symbols that are not in this mapping will display a dash in place of the company name.
