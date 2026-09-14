const http = require('http');
const fs = require('fs');
const path = require('path');
const https = require('https');

const PORT = process.env.PORT || 3000;
const OANDA_API_KEY = process.env.OANDA_API_KEY;
const instruments = ['XAUUSD', 'BTCUSD', 'XBRUSD', 'US30Y'];
const fallbackQuotes = {
  XAUUSD: 0,
  BTCUSD: 0,
  XBRUSD: 0,
  US30Y: 0,
};

function sendJson(res, statusCode, data) {
  res.writeHead(statusCode, { 'Content-Type': 'application/json; charset=utf-8' });
  res.end(JSON.stringify(data));
}

function getQuote(instrument) {
  return new Promise((resolve, reject) => {
    if (!OANDA_API_KEY) {
      resolve(fallbackQuotes[instrument]);
      return;
    }

    const url = new URL(`https://api-fxtrade.oanda.com/v3/instruments/${instrument}/price`);
    const req = https.get(
      url,
      {
        headers: {
          Authorization: `Bearer ${OANDA_API_KEY}`,
          'Accept-Datetime-Format': 'RFC3339',
        },
      },
      (res) => {
        let body = '';
        res.on('data', (chunk) => {
          body += chunk;
        });
        res.on('end', () => {
          if (res.statusCode >= 400 || !body) {
            reject(new Error(`OANDA request failed for ${instrument}: ${res.statusCode || 'no response'}`));
            return;
          }

          try {
            const data = JSON.parse(body);
            if (data && typeof data.price !== 'undefined') {
              resolve(Number(data.price));
            } else {
              reject(new Error(`Invalid price payload for ${instrument}`));
            }
          } catch (error) {
            reject(new Error(`Failed to parse response for ${instrument}: ${error.message}`));
          }
        });
      }
    );

    req.on('error', reject);
  });
}

async function fetchQuotes() {
  const promises = instruments.map(async (instrument) => {
    const value = await getQuote(instrument);
    return [instrument, value];
  });

  const entries = await Promise.all(promises);
  return Object.fromEntries(entries);
}

function serveFile(res, filePath) {
  fs.readFile(filePath, (error, content) => {
    if (error) {
      res.writeHead(500, { 'Content-Type': 'text/plain; charset=utf-8' });
      res.end('Internal Server Error');
      return;
    }

    const ext = path.extname(filePath).toLowerCase();
    const types = {
      '.html': 'text/html; charset=utf-8',
      '.js': 'application/javascript; charset=utf-8',
      '.css': 'text/css; charset=utf-8',
      '.json': 'application/json; charset=utf-8',
    };

    res.writeHead(200, { 'Content-Type': types[ext] || 'text/plain; charset=utf-8' });
    res.end(content);
  });
}

const server = http.createServer(async (req, res) => {
  const url = new URL(req.url, `http://${req.headers.host}`);

  if (url.pathname === '/api/quotes') {
    try {
      const quotes = await fetchQuotes();
      sendJson(res, 200, quotes);
    } catch (error) {
      sendJson(res, 500, {
        error: error.message,
      });
    }
    return;
  }

  if (url.pathname === '/' || url.pathname === '/index.html') {
    serveFile(res, path.join(__dirname, 'index.html'));
    return;
  }

  res.writeHead(404, { 'Content-Type': 'text/plain; charset=utf-8' });
  res.end('Not Found');
});

server.listen(PORT, () => {
  console.log(`OANDA quote page running at http://localhost:${PORT}`);
});
