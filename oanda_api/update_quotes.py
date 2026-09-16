import json
import urllib.parse
import urllib.request
from pathlib import Path

BASE_DIR = Path(__file__).resolve().parent
SYMBOLS = {
    'BTCUSD': 'BTC-USD',
    'XBRUSD': 'BZ=F',
    'US30Y': '^TYX',
}


def fetch_quote(symbol):
    url = 'https://query1.finance.yahoo.com/v8/finance/chart/' + urllib.parse.quote(symbol, safe='') + '?range=5d&interval=1d'
    request = urllib.request.Request(url, headers={'User-Agent': 'Mozilla/5.0', 'Accept': 'application/json'})
    with urllib.request.urlopen(request, timeout=30) as response:
        result = json.loads(response.read().decode())['chart']['result'][0]
    meta = result['meta']
    values = result['indicators']['quote'][0]

    def last(values):
        return next((value for value in reversed(values) if value is not None), None)

    return {
        'price': meta.get('regularMarketPrice'),
        'previousClose': meta.get('chartPreviousClose') or meta.get('previousClose'),
        'high': last(values.get('high', [])) or meta.get('regularMarketDayHigh'),
        'low': last(values.get('low', [])) or meta.get('regularMarketDayLow'),
    }


def fetch_xauusd():
    payload = json.dumps({
        'symbols': {'tickers': ['OANDA:XAUUSD'], 'query': {'types': []}},
        'columns': ['close', 'change_abs', 'high', 'low'],
    }).encode('utf-8')
    request = urllib.request.Request(
        'https://scanner.tradingview.com/global/scan',
        data=payload,
        headers={'User-Agent': 'Mozilla/5.0', 'Content-Type': 'application/json'},
        method='POST',
    )
    with urllib.request.urlopen(request, timeout=30) as response:
        row = json.loads(response.read().decode())['data'][0]['d']
    return {'price': row[0], 'previousClose': row[0] - row[1], 'high': row[2], 'low': row[3]}


if __name__ == '__main__':
    quotes = {'XAUUSD': None}
    try:
        quotes['XAUUSD'] = fetch_xauusd()
    except Exception as error:
        print(f'XAUUSD: {error}')
    for name, symbol in SYMBOLS.items():
        try:
            quotes[name] = fetch_quote(symbol)
        except Exception as error:
            print(f'{name}: {error}')
            quotes[name] = None
    (BASE_DIR / 'quotes.json').write_text(json.dumps(quotes, indent=2) + '\n', encoding='utf-8')
