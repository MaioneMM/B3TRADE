import axios from 'axios';
// import { logHost } from '../../../utils/logHost';
import { NextApiRequest, NextApiResponse } from 'next';

interface LooseObject {
  [key: string]: any;
}

const YF_HEADERS = {
  'User-Agent':
    'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
};

// Campos do TradingView scanner (brazil)
const TV_COLUMNS = [
  'market_cap_basic',         // [0] market cap
  'price_earnings_ttm',       // [1] P/L
  'earnings_per_share_basic_ttm', // [2] LPA
  'dividends_yield',          // [3] dividend yield
  'average_volume_10d_calc',  // [4] vol médio 10 dias
  'open',                     // [5] abertura do dia
  'close',                    // [6] fechamento recente
  'high',                     // [7] máxima do dia
  'low',                      // [8] mínima do dia
];

const validRanges = [
  '1d', '5d', '1mo', '3mo', '6mo', '1y', '2y', '5y', '10y', 'ytd', 'max',
];

// ─── Cache Server-Side ───────────────────────────────────────────────────────
const CACHE_TTL_MS = 30_000;

interface CacheEntry {
  data: any;
  fetchedAt: number;
}

const cache = new Map<string, CacheEntry>();

const isCacheValid = (entry: CacheEntry) =>
  Date.now() - entry.fetchedAt < CACHE_TTL_MS;

export default async (req: NextApiRequest, res: NextApiResponse) => {
  if (req.headers['user-agent']?.includes('python-requests')) {
    res.setHeader('Cache-Control', 's-maxage=2592000, stale-while-revalidate');
    res.status(403).json({
      error: true,
      message:
        'Your limit exceeded, please email us at brapi@protonmail.com for more information',
    });
    return;
  }

  const { slugs } = req.query;
  const { interval } = req.query;
  const { range } = req.query;

  const allSlugs = (slugs || '').toString().split(',');

  if (!slugs) return;

  // Substituímos o cache da Vercel (Edge) por no-store, 
  // pois o cache que importa agora é o nosso em memória (Server-Side)
  res.setHeader('Cache-Control', 'no-store');

  const startTime = Date.now();

  const responseAllSlugs = async () => {
    const promises = allSlugs.map(async (slug) => {
      const symbol = slug.toString().toUpperCase();

      try {
        const chartInterval = interval && range ? String(interval) : '1d';
        const chartRange    = interval && range ? String(range)    : '5d';
        
        const cacheKey = `${symbol}-${chartInterval}-${chartRange}`;
        const cached = cache.get(cacheKey);

        // Se tem cache válido em memória, retorna instantâneo sem bater no Yahoo Finance
        if (cached && isCacheValid(cached)) {
          return cached.data;
        }

        // ─── Requisição 1: Yahoo Finance v8 (cotação + histórico) ───
        const chartPromise = axios.get(
          `https://query1.finance.yahoo.com/v8/finance/chart/${symbol}.SA` +
            `?includePrePost=false&interval=${chartInterval}&useYfid=true&range=${chartRange}`,
          { headers: YF_HEADERS },
        );

        // ─── Requisição 2: Yahoo Finance v8 (Apenas 1 dia para pegar o fechamento de ontem garantido) ───
        const metaPromise = axios.get(
          `https://query1.finance.yahoo.com/v8/finance/chart/${symbol}.SA?interval=1d&range=1d`,
          { headers: YF_HEADERS },
        );

        // ─── Requisição 3: TradingView scanner (dados enriquecidos) ───
        const tvPromise = axios.post(
          'https://scanner.tradingview.com/brazil/scan',
          {
            symbols: {
              tickers: [`BMFBOVESPA:${symbol}`],
              query: { types: [] },
            },
            columns: TV_COLUMNS,
          },
          { headers: { 'Content-Type': 'application/json' } },
        );

        // Executa em paralelo
        const [chartResponse, metaResponse, tvResponse] = await Promise.all([
          chartPromise,
          metaPromise.catch(() => null),
          tvPromise.catch(() => null), 
        ]);

        const chartResult = chartResponse.data?.chart?.result?.[0];
        if (!chartResult) {
          throw new Error(`Não encontramos a ação ${symbol}`);
        }

        const meta = chartResult.meta;
        const metaResult = metaResponse?.data?.chart?.result?.[0]?.meta || {};
        const tvData: any[] = tvResponse?.data?.data?.[0]?.d ?? [];

        // ─── Dados do TradingView ───
        const marketCap       = tvData[0] ?? null;
        const priceEarnings   = tvData[1] ?? null;
        const earningsPerShare= tvData[2] ?? null;
        const dividendYield   = tvData[3] ?? null;
        const avgVolume10d    = tvData[4] ?? null;
        const tvOpen          = tvData[5] ?? null;
        // tvData[6..8] = close, high, low (cross-check com meta)

        // ─── Dados do Yahoo Finance (Priorizando a consulta de 1 dia para precisão) ───
        const regularMarketPrice = 
          metaResult.regularMarketPrice ?? meta.regularMarketPrice;
        
        const regularMarketPreviousClose = 
          metaResult.chartPreviousClose ?? meta.previousClose ?? meta.chartPreviousClose;

        const regularMarketChange = 
          regularMarketPrice - regularMarketPreviousClose;
        
        const regularMarketChangePercent = 
          (regularMarketChange / regularMarketPreviousClose) * 100;

        const regularMarketOpen =
          metaResult.regularMarketOpen ?? tvOpen ?? chartResult.indicators?.quote?.[0]?.open?.[0] ?? null;

        // ─── Histórico (se solicitado) ───
        const getHistory = () => {
          const { timestamp } = chartResult;
          const { low, high, open, close, volume } =
            chartResult.indicators.quote[0];
          return (timestamp ?? []).map((_: number, i: number) => ({
            date: timestamp[i],
            open: open[i],
            high: high[i],
            low: low[i],
            close: close[i],
            volume: volume[i],
          }));
        };

        // ─── Monta response ───
        const quote: LooseObject = {
          symbol,
          shortName:  meta.shortName,
          longName:   meta.longName,
          currency:   meta.currency,
          marketCap,

          regularMarketPrice:         regularMarketPrice,
          regularMarketChange:        regularMarketChange,
          regularMarketChangePercent: regularMarketChangePercent,
          regularMarketTime:          new Date((metaResult.regularMarketTime ?? meta.regularMarketTime) * 1000),
          regularMarketDayHigh:       metaResult.regularMarketDayHigh ?? meta.regularMarketDayHigh,
          regularMarketDayLow:        metaResult.regularMarketDayLow ?? meta.regularMarketDayLow,
          regularMarketDayRange:      `${metaResult.regularMarketDayLow ?? meta.regularMarketDayLow} - ${metaResult.regularMarketDayHigh ?? meta.regularMarketDayHigh}`,
          regularMarketVolume:        metaResult.regularMarketVolume ?? meta.regularMarketVolume,
          regularMarketPreviousClose: regularMarketPreviousClose,
          regularMarketOpen,

          fiftyTwoWeekRange:              `${meta.fiftyTwoWeekLow} - ${meta.fiftyTwoWeekHigh}`,
          fiftyTwoWeekLow:                meta.fiftyTwoWeekLow,
          fiftyTwoWeekHigh:               meta.fiftyTwoWeekHigh,
          fiftyTwoWeekLowChange:          meta.regularMarketPrice - meta.fiftyTwoWeekLow,
          fiftyTwoWeekLowChangePercent:
            ((meta.regularMarketPrice - meta.fiftyTwoWeekLow) / meta.fiftyTwoWeekLow) * 100,
          fiftyTwoWeekHighChange:         meta.regularMarketPrice - meta.fiftyTwoWeekHigh,
          fiftyTwoWeekHighChangePercent:
            ((meta.regularMarketPrice - meta.fiftyTwoWeekHigh) / meta.fiftyTwoWeekHigh) * 100,

          // Dados fundamentalistas (sempre incluídos, null se indisponível)
          priceEarnings,
          earningsPerShare,
          dividendYield,
          averageDailyVolume10Day: avgVolume10d,

          // Logo da ação
          logourl: `https://icons.brapi.dev/icons/${symbol}.svg`,
        };

        if (interval && range) {
          quote.validRanges = validRanges;
          quote.historicalDataPrice = getHistory();
        }

        cache.set(cacheKey, { data: quote, fetchedAt: Date.now() });

        return quote;
      } catch (err: any) {
        const chartInterval = interval && range ? String(interval) : '1d';
        const chartRange    = interval && range ? String(range)    : '5d';
        const cacheKey = `${symbol}-${chartInterval}-${chartRange}`;
        const stale = cache.get(cacheKey);
        
        if (stale) {
          return { ...stale.data, stale: true };
        }

        throw new Error(
          err.message?.startsWith('Não encontramos')
            ? err.message
            : `Não encontramos a ação ${symbol}`,
        );
      }
    });

    const took = `${Date.now() - startTime}ms`;

    await Promise.all(promises)
      .then((results) => {
        res.status(200).json({ results, requestedAt: new Date(), took });
      })
      .catch((err) => {
        res.status(404).json({ error: err.message });
      });
  };

  await responseAllSlugs();

  // logHost(req, 'quote');
};
