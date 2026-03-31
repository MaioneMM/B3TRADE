import React, { useEffect, useState, useCallback } from 'react';
import Head from 'next/head';
import axios from 'axios';
import Header from '../../components/Header';
import Layout from '../../Layout';
import AuthGuard from '../../components/AuthGuard';
import { PortfolioProvider } from '../../context/PortfolioContext';

// ─── Tipos ───
interface CommodityQuote {
  symbol: string;
  shortName: string;
  longName: string;
  currency: string;
  regularMarketPrice: number;
  regularMarketChange: number;
  regularMarketChangePercent: number;
  regularMarketDayHigh: number;
  regularMarketDayLow: number;
  regularMarketPreviousClose: number;
  regularMarketTime: string;
  fiftyTwoWeekHigh: number;
  fiftyTwoWeekLow: number;
  error?: string;
}

// ─── Catálogo de Commodities ───
const COMMODITY_CATALOG = [
  {
    category: '🛢️ Energia',
    color: '#ff8c00',
    items: [
      { ticker: 'CL=F',  label: 'Petróleo WTI',        unit: 'USD/barril', icon: '🛢️' },
      { ticker: 'BZ=F',  label: 'Petróleo Brent',       unit: 'USD/barril', icon: '🛢️' },
      { ticker: 'NG=F',  label: 'Gás Natural',           unit: 'USD/MMBtu',  icon: '🔥' },
      { ticker: 'HO=F',  label: 'Óleo de Aquecimento',  unit: 'USD/galão',  icon: '🏭' },
    ],
  },
  {
    category: '🥇 Metais',
    color: '#ffd700',
    items: [
      { ticker: 'GC=F',  label: 'Ouro',    unit: 'USD/oz', icon: '🥇' },
      { ticker: 'SI=F',  label: 'Prata',   unit: 'USD/oz', icon: '🥈' },
      { ticker: 'HG=F',  label: 'Cobre',   unit: 'USD/lb', icon: '🟤' },
      { ticker: 'PL=F',  label: 'Platina', unit: 'USD/oz', icon: '⬜' },
    ],
  },
  {
    category: '🌽 Agrícolas',
    color: '#4caf50',
    items: [
      { ticker: 'ZS=F',  label: 'Soja',            unit: 'USD/bushel', icon: '🫘' },
      { ticker: 'ZC=F',  label: 'Milho Chicago',   unit: 'USD/bushel', icon: '🌽' },
      { ticker: 'ZW=F',  label: 'Trigo Chicago',   unit: 'USD/bushel', icon: '🌾' },
      { ticker: 'KC=F',  label: 'Café Contrato C', unit: 'USD/lb',     icon: '☕' },
      { ticker: 'SB=F',  label: 'Açúcar NY nº11',  unit: 'USD/lb',     icon: '🍬' },
      { ticker: 'CT=F',  label: 'Algodão nº2',     unit: 'USD/lb',     icon: '🩶' },
      { ticker: 'CC=F',  label: 'Cacau NY',        unit: 'USD/t',      icon: '🍫' },
    ],
  },
];

const ALL_TICKERS = COMMODITY_CATALOG.flatMap(c => c.items.map(i => i.ticker));
const TICKER_META: Record<string, { label: string; unit: string; icon: string }> = {};
COMMODITY_CATALOG.forEach(c => c.items.forEach(i => (TICKER_META[i.ticker] = { label: i.label, unit: i.unit, icon: i.icon })));

// ─── Helpers ───
const fmt = (n: number, decimals = 2) =>
  n?.toLocaleString('en-US', { minimumFractionDigits: decimals, maximumFractionDigits: decimals });

const SkeletonCard = () => (
  <div style={{
    background: 'rgba(255,255,255,0.03)',
    border: '1px solid rgba(255,255,255,0.07)',
    borderRadius: '12px',
    padding: '1.2rem',
    animation: 'pulse 1.5s ease-in-out infinite',
  }}>
    <div style={{ height: '14px', width: '40%', background: '#333', borderRadius: '4px', marginBottom: '12px' }} />
    <div style={{ height: '28px', width: '60%', background: '#2a2a2a', borderRadius: '4px', marginBottom: '10px' }} />
    <div style={{ height: '12px', width: '80%', background: '#252525', borderRadius: '4px' }} />
  </div>
);

// ─── Main Page ───
const CommoditiesPage: React.FC = () => {
  const [quotes, setQuotes] = useState<Record<string, CommodityQuote>>({});
  const [loading, setLoading] = useState(true);
  const [lastUpdate, setLastUpdate] = useState<Date | null>(null);

  const fetchQuotes = useCallback(async () => {
    try {
      const res = await axios.get(`/api/commodity?tickers=${ALL_TICKERS.join(',')}`);
      const map: Record<string, CommodityQuote> = {};
      res.data.results.forEach((q: CommodityQuote) => {
        map[q.symbol] = q;
      });
      setQuotes(map);
      setLastUpdate(new Date());
    } catch (err) {
      console.error('Falha ao buscar commodities', err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchQuotes();
    const interval = setInterval(fetchQuotes, 1000);
    return () => clearInterval(interval);
  }, [fetchQuotes]);

  return (
    <PortfolioProvider>
      <AuthGuard>
        <Head>
          <title>B3Trade — Commodities Globais</title>
          <meta name="description" content="Acompanhe em tempo real os preços das principais commodities globais: petróleo, ouro, prata, soja, milho, café e mais." />
        </Head>
        <Layout>
          <Header />

          <div style={{ maxWidth: '1100px', margin: '0 auto', padding: '2rem 1.5rem' }}>

            {/* ── Page Title ── */}
            <div style={{ marginBottom: '2.5rem' }}>
              <h1 style={{ fontSize: '2rem', fontWeight: 800, margin: 0, letterSpacing: '-0.03em' }}>
                Commodities Globais
              </h1>
              <p style={{ color: '#888', marginTop: '0.4rem', fontSize: '0.9rem' }}>
                Preços em tempo real das principais commodities do mercado mundial • cotados em <strong style={{ color: '#26a69a' }}>USD</strong>
              </p>
              {lastUpdate && (
                <p style={{ color: '#555', fontSize: '0.78rem', marginTop: '0.2rem' }}>
                  Última atualização: {lastUpdate.toLocaleTimeString('pt-BR')} &nbsp;•&nbsp; atualiza a cada 1s
                </p>
              )}
            </div>

            {/* ── Categories ── */}
            {COMMODITY_CATALOG.map(cat => (
              <section key={cat.category} style={{ marginBottom: '3rem' }}>

                {/* Category Header */}
                <div style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '10px',
                  marginBottom: '1.2rem',
                  paddingBottom: '0.6rem',
                  borderBottom: `2px solid ${cat.color}22`,
                }}>
                  <span style={{
                    fontSize: '1.1rem',
                    fontWeight: 700,
                    color: cat.color,
                    letterSpacing: '-0.01em',
                  }}>
                    {cat.category}
                  </span>
                  <div style={{ flex: 1, height: '1px', background: `${cat.color}22` }} />
                </div>

                {/* Cards Grid */}
                <div style={{
                  display: 'grid',
                  gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))',
                  gap: '1rem',
                }}>
                  {cat.items.map(item => {
                    const q = quotes[item.ticker];

                    if (loading && !q) return <SkeletonCard key={item.ticker} />;

                    if (!q || q.error) {
                      return (
                        <div key={item.ticker} style={{
                          background: 'rgba(239,83,80,0.06)',
                          border: '1px solid rgba(239,83,80,0.2)',
                          borderRadius: '12px',
                          padding: '1.2rem',
                        }}>
                          <span style={{ color: '#888', fontSize: '0.85rem' }}>{item.icon} {item.label} — indisponível</span>
                        </div>
                      );
                    }

                    const isUp = q.regularMarketChange >= 0;
                    const changeColor = isUp ? '#26a69a' : '#ef5350';
                    const changeSign = isUp ? '+' : '';
                    const priceDec = item.unit.includes('oz') || item.unit.includes('lb') ? 4 : 2;

                    return (
                      <div key={item.ticker} style={{
                        background: 'rgba(255,255,255,0.03)',
                        border: `1px solid ${isUp ? 'rgba(38,166,154,0.15)' : 'rgba(239,83,80,0.12)'}`,
                        borderRadius: '12px',
                        padding: '1.3rem 1.4rem',
                        transition: 'transform 0.15s, box-shadow 0.15s',
                        cursor: 'default',
                        position: 'relative',
                        overflow: 'hidden',
                      }}
                      onMouseEnter={e => {
                        (e.currentTarget as HTMLElement).style.transform = 'translateY(-2px)';
                        (e.currentTarget as HTMLElement).style.boxShadow = `0 8px 24px ${changeColor}22`;
                      }}
                      onMouseLeave={e => {
                        (e.currentTarget as HTMLElement).style.transform = 'translateY(0)';
                        (e.currentTarget as HTMLElement).style.boxShadow = 'none';
                      }}
                      >
                        {/* Glow bar */}
                        <div style={{
                          position: 'absolute', top: 0, left: 0, right: 0, height: '2px',
                          background: `linear-gradient(90deg, transparent, ${changeColor}, transparent)`,
                          opacity: 0.6,
                        }} />

                        {/* Header */}
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '0.75rem' }}>
                          <div>
                            <span style={{ fontSize: '1.3rem' }}>{item.icon}</span>
                            <div style={{ fontSize: '0.78rem', color: '#888', marginTop: '2px' }}>{item.ticker}</div>
                          </div>
                          <div style={{
                            background: `${changeColor}18`,
                            color: changeColor,
                            borderRadius: '20px',
                            padding: '3px 10px',
                            fontSize: '0.8rem',
                            fontWeight: 700,
                          }}>
                            {changeSign}{fmt(q.regularMarketChangePercent)}%
                          </div>
                        </div>

                        {/* Name */}
                        <div style={{ fontSize: '0.92rem', fontWeight: 600, color: '#ccc', marginBottom: '0.5rem' }}>
                          {item.label}
                        </div>

                        {/* Price */}
                        <div style={{ display: 'flex', alignItems: 'baseline', gap: '6px', marginBottom: '0.6rem' }}>
                          <span style={{ fontSize: '0.85rem', color: '#26a69a', fontWeight: 600 }}>USD</span>
                          <span style={{ fontSize: '1.7rem', fontWeight: 800, color: '#f0f0f0', letterSpacing: '-0.03em' }}>
                            {fmt(q.regularMarketPrice, priceDec)}
                          </span>
                        </div>

                        {/* Change absolute */}
                        <div style={{ fontSize: '0.82rem', color: changeColor, marginBottom: '0.8rem', fontWeight: 600 }}>
                          {changeSign}{fmt(q.regularMarketChange, priceDec)} hoje
                        </div>

                        {/* Divider */}
                        <div style={{ height: '1px', background: '#2a2a2a', marginBottom: '0.8rem' }} />

                        {/* Day range */}
                        <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.77rem', color: '#777' }}>
                          <span>Mín: <strong style={{ color: '#ef5350' }}>{fmt(q.regularMarketDayLow, priceDec)}</strong></span>
                          <span>Máx: <strong style={{ color: '#26a69a' }}>{fmt(q.regularMarketDayHigh, priceDec)}</strong></span>
                        </div>

                        {/* Unit label */}
                        <div style={{ fontSize: '0.7rem', color: '#444', marginTop: '6px', textAlign: 'right' }}>
                          {item.unit}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </section>
            ))}

          </div>

          {/* Pulse animation */}
          <style>{`
            @keyframes pulse {
              0%, 100% { opacity: 1; }
              50% { opacity: 0.4; }
            }
          `}</style>

        </Layout>
      </AuthGuard>
    </PortfolioProvider>
  );
};

export default CommoditiesPage;
