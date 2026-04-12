/* ============================================================
   app.js — Finwise
   Features: watchlist, search, sort, filter, dark/light theme
   API: Finnhub (https://finnhub.io)
   ============================================================ */

// ── Config ──────────────────────────────────────────────────
const API_KEY  = "d76ip19r01qtg3ndorpgd76ip19r01qtg3ndorq0";
const BASE_URL = "https://finnhub.io/api/v1";

// Default watchlist
const WATCHLIST = ["AAPL", "GOOGL", "MSFT", "TSLA", "AMZN", "META", "AVG0", "BABA", "DIS"];

// Company name lookup (Finnhub quote endpoint doesn't return names)
const COMPANY_NAMES = {
  AAPL:  "Apple Inc.",
  GOOGL: "Alphabet Inc.",
  MSFT:  "Microsoft Corp.",
  TSLA:  "Tesla Inc.",
  AMZN:  "Amazon.com Inc.",
  META:  "Meta Platforms Inc.",
  AVG0 : "AVG Technologies",
  BABA : "Alibaba Group Holding Ltd",
  DIS  : "The Walt Disney Company",
};
// Holds the raw watchlist data so we can re-sort/filter without re-fetching
let watchlistData = [];


// ── Theme Toggle ─────────────────────────────────────────────
const html      = document.documentElement;
const themeBtn  = document.getElementById("theme-toggle");
const themeIcon = document.getElementById("theme-icon");

function getTheme() {
  return localStorage.getItem("Finwise-theme") || "dark";
}

function applyTheme(theme) {
  html.setAttribute("data-theme", theme);
  themeIcon.textContent = theme === "dark" ? "☀" : "☾";
  localStorage.setItem("Finwise-theme", theme);
}

function toggleTheme() {
  const current = getTheme();
  applyTheme(current === "dark" ? "light" : "dark");
}

themeBtn.addEventListener("click", toggleTheme);

// Apply saved theme on load
applyTheme(getTheme());


// ── API ───────────────────────────────────────────────────────
async function fetchQuote(symbol) {
  const url = `${BASE_URL}/quote?symbol=${symbol.toUpperCase()}&token=${API_KEY}`;
  const res  = await fetch(url);

  if (!res.ok) throw new Error(`HTTP ${res.status}`);

  const data = await res.json();
  return data;
}


// ── Card Builder ──────────────────────────────────────────────
function buildCard(symbol, data, staggerIndex = 0) {
  const { c, d, dp, h, l, o, pc } = data;

  // c = current price, d = $ change, dp = % change
  if (!c || c === 0) return null;

  const isUp       = d >= 0;
  const arrowIcon  = isUp ? "▲" : "▼";
  const changeAbs  = Math.abs(d).toFixed(2);
  const changePct  = Math.abs(dp).toFixed(2);

  const card = document.createElement("div");
  card.className = "stock-card";
  card.style.animationDelay = `${staggerIndex * 60}ms`;

  // Store data for filtering/sorting
  card.dataset.symbol  = symbol;
  card.dataset.price   = c;
  card.dataset.change  = d;
  card.dataset.gainloss = isUp ? "gainer" : "loser";

  card.innerHTML = `
    <div class="card-top">
      <div>
        <div class="symbol">${symbol}</div>
        <div class="company-name">${COMPANY_NAMES[symbol] || "—"}</div>
      </div>
      <span class="badge ${isUp ? "positive" : "negative"}">
        ${arrowIcon} ${changePct}%
      </span>
    </div>

    <div class="price">$${c.toFixed(2)}</div>
    <div class="change ${isUp ? "positive" : "negative"}">
      ${arrowIcon} ${isUp ? "+" : "-"}$${changeAbs} today
    </div>

    <div class="details">
      <div class="detail-row">
        <span class="detail-label">Open</span>
        <span class="detail-value">$${o.toFixed(2)}</span>
      </div>
      <div class="detail-row">
        <span class="detail-label">High</span>
        <span class="detail-value">$${h.toFixed(2)}</span>
      </div>
      <div class="detail-row">
        <span class="detail-label">Low</span>
        <span class="detail-value">$${l.toFixed(2)}</span>
      </div>
      <div class="detail-row">
        <span class="detail-label">Prev</span>
        <span class="detail-value">$${pc.toFixed(2)}</span>
      </div>
    </div>
  `;

  return card;
}


// ── Watchlist Loader ──────────────────────────────────────────
async function loadWatchlist() {
  const grid = document.getElementById("stocks-grid");
  grid.innerHTML = `<p class="loading-text">Fetching market data<span class="dots"></span></p>`;
  hideError();

  // Reset controls
  document.getElementById("filter-select").value = "all";
  document.getElementById("sort-select").value   = "default";

  try {
    const results = await Promise.all(
      WATCHLIST.map(sym =>
        fetchQuote(sym)
          .then(data => ({ sym, data }))
          .catch(() => null)
      )
    );

    // Store valid results globally so sort/filter can use them
    watchlistData = results.filter(r => r && r.data.c && r.data.c !== 0);

    renderWatchlist(watchlistData);
    updateTimestamp();

  } catch (err) {
    showError("Could not load stock data. Check your API key or internet connection.");
    grid.innerHTML = "";
  }
}


// ── Render Watchlist (from in-memory data) ────────────────────
function renderWatchlist(items) {
  const grid = document.getElementById("stocks-grid");
  grid.innerHTML = "";

  if (items.length === 0) {
    grid.innerHTML = `<p class="no-results">No stocks match this filter.</p>`;
    return;
  }

  items.forEach(({ sym, data }, i) => {
    const card = buildCard(sym, data, i);
    if (card) grid.appendChild(card);
  });
}


// ── Sort & Filter ─────────────────────────────────────────────
function applyFiltersAndSort() {
  if (watchlistData.length === 0) return;

  const filterVal = document.getElementById("filter-select").value;
  const sortVal   = document.getElementById("sort-select").value;

  // 1. Filter
  let filtered = watchlistData.filter(({ sym, data }) => {
    if (filterVal === "gainers") return data.d >= 0;
    if (filterVal === "losers")  return data.d < 0;
    return true;
  });

  // 2. Sort
  filtered = [...filtered].sort((a, b) => {
    switch (sortVal) {
      case "price-asc":    return a.data.c - b.data.c;
      case "price-desc":   return b.data.c - a.data.c;
      case "change-asc":   return a.data.dp - b.data.dp;
      case "change-desc":  return b.data.dp - a.data.dp;
      case "name-asc": return (COMPANY_NAMES[a.sym] || a.sym).localeCompare(COMPANY_NAMES[b.sym] || b.sym);
      default: return 0; // keep original order
    }
  });

  renderWatchlist(filtered);
}


// ── Stock Search ──────────────────────────────────────────────
async function searchStock() {
  const raw    = document.getElementById("search-input").value.trim();
  const symbol = raw.toUpperCase();
  const section = document.getElementById("search-result");
  const cards  = document.getElementById("search-result-cards");

  if (!symbol) {
    showError("Please enter a stock symbol first.");
    return;
  }

  hideError();
  section.style.display = "block";
  cards.innerHTML = `<p class="loading-text">Looking up ${symbol}<span class="dots"></span></p>`;

  try {
    const data = await fetchQuote(symbol);

    if (!data.c || data.c === 0) {
      cards.innerHTML = `<p class="no-results">No data found for "${symbol}". It may be an invalid symbol or market is closed.</p>`;
      return;
    }

    cards.innerHTML = "";
    const card = buildCard(symbol, data, 0);
    if (card) cards.appendChild(card);

  } catch (err) {
    cards.innerHTML = `<p class="no-results">Could not fetch data for "${symbol}". Try again.</p>`;
  }
}

function clearSearch() {
  document.getElementById("search-result").style.display = "none";
  document.getElementById("search-result-cards").innerHTML = "";
  document.getElementById("search-input").value = "";
}


// ── Helpers ───────────────────────────────────────────────────
function updateTimestamp() {
  const now = new Date();
  const time = now.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
  document.getElementById("last-updated").textContent = `Updated ${time}`;
}

function showError(msg) {
  const box = document.getElementById("error-box");
  box.textContent = msg;
  box.style.display = "block";
}

function hideError() {
  document.getElementById("error-box").style.display = "none";
}

// ── Enter key on search ────────────────────────────────────────
document.getElementById("search-input").addEventListener("keydown", e => {
  if (e.key === "Enter") searchStock();
});

// ── Init ──────────────────────────────────────────────────────
loadWatchlist();
