from http.server import ThreadingHTTPServer, SimpleHTTPRequestHandler
from urllib.parse import urlparse
from pathlib import Path
import json
import urllib.request

BASE_DIR = Path(__file__).resolve().parent
PORT = 8000


def fetch_json(url):
    req = urllib.request.Request(
        url,
        headers={
            'User-Agent': 'Mozilla/5.0',
            'Accept': 'application/json',
        },
    )
    with urllib.request.urlopen(req, timeout=20) as response:
        return json.loads(response.read().decode('utf-8'))


def fetch_text(url):
    req = urllib.request.Request(
        url,
        headers={
            'User-Agent': 'Mozilla/5.0',
            'Accept': 'text/csv,text/plain',
        },
    )
    with urllib.request.urlopen(req, timeout=20) as response:
        return response.read().decode('utf-8')


def parse_fred_value(csv_text):
    lines = [line.strip() for line in csv_text.strip().splitlines() if line.strip()]
    if len(lines) < 2:
        return None

    for line in reversed(lines[1:]):
        parts = [part.strip() for part in line.split(',')]
        if len(parts) >= 2:
            try:
                return float(parts[1])
            except ValueError:
                continue
    return None


def fetch_quotes():
    quotes = {}

    try:
        gold = fetch_json('https://api.gold-api.com/price/XAU')
        quotes['XAUUSD'] = float(gold['price'])
    except Exception:
        quotes['XAUUSD'] = None

    try:
        btc = fetch_json('https://api.coinbase.com/v2/prices/BTC-USD/spot')
        quotes['BTCUSD'] = float(btc['data']['amount'])
    except Exception:
        quotes['BTCUSD'] = None

    try:
        xbr = fetch_json('https://www.alphavantage.co/query?function=BRENT&interval=monthly&apikey=demo')
        data = xbr.get('data') or []
        if data:
            quotes['XBRUSD'] = float(data[0]['value'])
        else:
            quotes['XBRUSD'] = None
    except Exception:
        quotes['XBRUSD'] = None

    try:
        us30y = fetch_json('https://query1.finance.yahoo.com/v8/finance/chart/%5ETYX')
        quotes['US30Y'] = float(us30y['chart']['result'][0]['meta']['regularMarketPrice'])
    except Exception:
        quotes['US30Y'] = None

    return quotes


class QuoteHandler(SimpleHTTPRequestHandler):
    def do_GET(self):
        path = urlparse(self.path).path

        if path == '/api/quotes':
            payload = json.dumps(fetch_quotes()).encode('utf-8')
            self.send_response(200)
            self.send_header('Content-Type', 'application/json; charset=utf-8')
            self.send_header('Cache-Control', 'no-store')
            self.send_header('Content-Length', str(len(payload)))
            self.end_headers()
            self.wfile.write(payload)
            return

        if path in ('/', '/index.html'):
            self.path = '/index.html'

        return super().do_GET()

    def log_message(self, format, *args):
        return


if __name__ == '__main__':
    handler = QuoteHandler
    httpd = ThreadingHTTPServer(('0.0.0.0', PORT), handler)
    print(f'Serving on http://localhost:{PORT}')
    httpd.serve_forever()
