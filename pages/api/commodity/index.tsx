import axios from 'axios';
import { NextApiRequest, NextApiResponse } from 'next';

const YF_HEADERS = {
  'User-Agent':
    'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
};

// ─── Cache Server-Side ───────────────────────────────────────────────────────
// Armazenado no módulo (sobrevive entre requests no mesmo processo Node.js).
// O Yahoo Finance só é consultado quando o cache expira — proteção contra rate limit.
const CACHE_TTL_MS = 30_000; // 30 segundos: mínimo seguro para o Yahoo Finance

interface CacheEntry {
  data: any[];
  fetchedAt: number; // timestamp em ms
}

const cache = new Map<string, CacheEntry>();

const isCacheValid = (entry: CacheEntry) =>
  Date.now() - entry.fetchedAt < CACHE_TTL_MS;

// ─── Busca real no Yahoo Finance ─────────────────────────────────────────────
async function fetchFromYahoo(symbol: string): Promise<any> {
  const response = await axios.get(
    `https://query1.finance.yahoo.com/v8/finance/chart/${symbol}?includePrePost=false&interval=1d&range=1d`,
    { headers: YF_HEADERS, timeout: 8000 },
  );

  const result = response.data?.chart?.result?.[0];
  if (!result) throw new Error(`Ticker ${symbol} não encontrado`);

  const meta = result.meta;
  const regularMarketChange = meta.regularMarketPrice - meta.chartPreviousClose;
  const regularMarketChangePercent = (regularMarketChange / meta.chartPreviousClose) * 100;

  return {
    symbol,
    shortName: meta.shortName || meta.longName || symbol,
    longName: meta.longName || symbol,
    currency: meta.currency,
    exchangeName: meta.exchangeName,
    regularMarketPrice: meta.regularMarketPrice,
    regularMarketChange,
    regularMarketChangePercent,
    regularMarketTime: new Date(meta.regularMarketTime * 1000),
    regularMarketDayHigh: meta.regularMarketDayHigh,
    regularMarketDayLow: meta.regularMarketDayLow,
    regularMarketPreviousClose: meta.chartPreviousClose,
    regularMarketVolume: meta.regularMarketVolume ?? null,
    fiftyTwoWeekHigh: meta.fiftyTwoWeekHigh,
    fiftyTwoWeekLow: meta.fiftyTwoWeekLow,
  };
}

// ─── Handler ─────────────────────────────────────────────────────────────────
export default async (req: NextApiRequest, res: NextApiResponse) => {
  const { tickers } = req.query;

  if (!tickers) {
    return res.status(400).json({ error: 'Parâmetro "tickers" é obrigatório. Ex: ?tickers=CL=F,GC=F' });
  }

  // Não cachear no browser/CDN — o cache está no servidor
  res.setHeader('Cache-Control', 'no-store');

  const tickerList = tickers.toString().split(',').map(t => t.trim().toUpperCase());
  const cacheKey = tickerList.sort().join(',');

  // ── Cache HIT: retorna dados em memória sem chamar o Yahoo Finance ──
  const cached = cache.get(cacheKey);
  if (cached && isCacheValid(cached)) {
    return res.status(200).json({
      results: cached.data,
      requestedAt: new Date(),
      cachedAt: new Date(cached.fetchedAt),
      fromCache: true,
    });
  }

  // ── Cache MISS: busca no Yahoo Finance e armazena ──
  const startTime = Date.now();

  const promises = tickerList.map(async (symbol) => {
    try {
      return await fetchFromYahoo(symbol);
    } catch (err: any) {
      // Se o ticker já estava em cache (mesmo expirado), retorna o valor antigo
      // ao invés de mostrar erro — graceful degradation
      const stale = cache.get(symbol);
      if (stale) {
        return { ...stale.data[0], stale: true };
      }
      return { symbol, error: `Não foi possível obter dados para ${symbol}` };
    }
  });

  const results = await Promise.all(promises);

  // Salva no cache (apenas resultados sem erro)
  const validResults = results.filter(r => !r.error);
  if (validResults.length > 0) {
    cache.set(cacheKey, { data: results, fetchedAt: Date.now() });
  }

  const took = `${Date.now() - startTime}ms`;

  return res.status(200).json({
    results,
    requestedAt: new Date(),
    fromCache: false,
    took,
  });
};
