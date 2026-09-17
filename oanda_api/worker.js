const API_URLS = {
  'OANDA:XAUUSD': 'https://scanner.tradingview.com/global/scan',
  'COINBASE:BTCUSD': 'https://scanner.tradingview.com/global/scan',
};

async function fetchJson(url, options = {}) {
  const res = await fetch(url, {
    ...options,
    headers: {
      'User-Agent': 'Mozilla/5.0',
      ...(options.headers || {}),
    },
    cf: { cacheEverything: true },
  });

  if (!res.ok) {
    throw new Error(`HTTP ${res.status} for ${url}`);
  }
  return res.json();
}

function lastDefined(arr) {
  if (!Array.isArray(arr)) return null;
  for (let i = arr.length - 1; i >= 0; i--) {
    if (arr[i] != null) return arr[i];
  }
  return null;
}

async function getTradingView(symbol) {
  const payload = {
    symbols: { tickers: [symbol], query: { types: [] } },
    columns: ['close', 'change_abs', 'high', 'low'],
  };

  const data = await fetchJson(API_URLS[symbol], {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload),
  });

  const row = (data.data || [])[0];
  if (!row) return null;
  const d = row.d || [];
  return {
    price: d[0],
    previousClose: d[0] - d[1],
    high: d[2],
    low: d[3],
  };
}

async function getYahoo(symbol, yahooSymbol) {
  const data = await fetchJson(`https://query1.finance.yahoo.com/v8/finance/chart/${encodeURIComponent(yahooSymbol)}?range=1d&interval=1d`);
  const result = data?.chart?.result?.[0];
  if (!result) return null;
  const quote = result.indicators?.quote?.[0] || {};
  const meta = result.meta || {};
  return {
    price: meta.regularMarketPrice,
    previousClose: meta.chartPreviousClose ?? meta.previousClose,
    high: lastDefined(quote.high) ?? meta.regularMarketDayHigh,
    low: lastDefined(quote.low) ?? meta.regularMarketDayLow,
  };
}

export default {
  async fetch(request, env, ctx) {
    const url = new URL(request.url);

    if (url.pathname === '/api/quotes') {
      try {
        const [xauusd, btcusd, xbrusd, us30y] = await Promise.all([
          getTradingView('OANDA:XAUUSD'),
          getTradingView('COINBASE:BTCUSD'),
          getYahoo('XBRUSD', 'BZ=F'),
          getYahoo('US30Y', '^TYX'),
        ]);

        const payload = {
          XAUUSD: xauusd,
          BTCUSD: btcusd,
          XBRUSD: xbrusd,
          US30Y: us30y,
        };

        return new Response(JSON.stringify(payload), {
          headers: {
            'Content-Type': 'application/json; charset=utf-8',
            'Access-Control-Allow-Origin': '*',
            'Cache-Control': 'no-store, no-cache, must-revalidate, max-age=0',
          },
        });
      } catch (error) {
        return new Response(JSON.stringify({ error: String(error) }), {
          status: 500,
          headers: {
            'Content-Type': 'application/json; charset=utf-8',
            'Access-Control-Allow-Origin': '*',
          },
        });
      }
    }

    return new Response('Not found', { status: 404 });
  },
};
