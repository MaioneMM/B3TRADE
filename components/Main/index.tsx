import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { Container } from './styles';

// Linhas do terminal animado
const terminalLines = [
  { type: 'command', text: '$ curl https://b3trade.dev/api/quote/PETR4' },
  { type: 'info', text: 'HTTP request sent, awaiting response...' },
  { type: 'success', text: '✓ 200 OK (142 ms)' },
  { type: 'json', text: '{' },
  { type: 'json', text: '  "results": [{' },
  { type: 'json-key', text: '    "symbol":', value: '"PETR4",' },
  { type: 'json-key', text: '    "currency":', value: '"BRL",' },
  { type: 'json-key', text: '    "regularMarketPrice":', value: '49.74,' },
  { type: 'json-key', text: '    "regularMarketChange":', value: '0.33,' },
  { type: 'json-key', text: '    "regularMarketChangePercent":', value: '0.67,' },
  { type: 'json-key', text: '    "marketCap":', value: '647831871488,' },
  { type: 'json-key', text: '    "fiftyTwoWeekHigh":', value: '50.69,' },
  { type: 'json-key', text: '    "fiftyTwoWeekLow":', value: '28.86' },
  { type: 'json', text: '  }],' },
  { type: 'json-key', text: '  "requestedAt":', value: '"2026-03-30T20:00:00Z"' },
  { type: 'json', text: '}' },
];

const partners = [
  'BANESTES', 'TORO', 'SUNO', 'PRIMO', 'PicPay', 'SUPERNOVA',
];

const stats = [
  { value: '10M+', label: 'Requisições/mês' },
  { value: '50K+', label: 'Desenvolvedores' },
  { value: '99.9%', label: 'Uptime' },
  { value: '< 150ms', label: 'Latência média' },
];

const features = [
  {
    icon: '📈',
    title: 'Cotações em tempo real',
    desc: 'Preços de ações da B3 com delay mínimo de 15 minutos via Yahoo Finance.',
  },
  {
    icon: '📊',
    title: 'Dados Históricos (OHLCV)',
    desc: 'Séries históricas completas para backtests e análises quantitativas.',
  },
  {
    icon: '🔗',
    title: 'API REST simples',
    desc: 'Sem autenticação obrigatória. Integre em minutos com qualquer linguagem.',
  },
  {
    icon: '🪙',
    title: 'Criptomoedas',
    desc: 'Bitcoin, Ethereum e centenas de ativos em BRL ou outras moedas.',
  },
  {
    icon: '💱',
    title: 'Câmbio',
    desc: 'Taxas de câmbio em tempo real: USD-BRL, EUR-BRL e muito mais.',
  },
  {
    icon: '📋',
    title: 'Dados Fundamentalistas',
    desc: 'P/L, LPA e outros indicadores fundamentalistas via módulos opcionais.',
  },
];

const TerminalWindow: React.FC = () => {
  const [visibleLines, setVisibleLines] = useState(0);

  useEffect(() => {
    if (visibleLines >= terminalLines.length) return;
    const delay = visibleLines === 0 ? 600 : visibleLines < 3 ? 500 : 120;
    const t = setTimeout(() => setVisibleLines((v) => v + 1), delay);
    return () => clearTimeout(t);
  }, [visibleLines]);

  const getColor = (type: string) => {
    switch (type) {
      case 'command': return '#a5f3a0';
      case 'info': return '#94a3b8';
      case 'success': return '#4ade80';
      case 'json': return '#e2e8f0';
      case 'json-key': return '#93c5fd';
      default: return '#e2e8f0';
    }
  };

  return (
    <div className="terminal">
      <div className="terminal-bar">
        <span className="dot red" />
        <span className="dot yellow" />
        <span className="dot green" />
        <span className="terminal-title">b3trade — terminal</span>
      </div>
      <div className="terminal-body">
        {terminalLines.slice(0, visibleLines).map((line, i) => (
          <div key={i} className="terminal-line">
            {line.type === 'json-key' ? (
              <>
                <span style={{ color: '#93c5fd' }}>{line.text} </span>
                <span style={{ color: '#fbbf24' }}>{line.value}</span>
              </>
            ) : (
              <span style={{ color: getColor(line.type) }}>{line.text}</span>
            )}
          </div>
        ))}
        {visibleLines < terminalLines.length && (
          <span className="cursor">▋</span>
        )}
      </div>
    </div>
  );
};

const Main: React.FC = () => {
  return (
    <Container>
      {/* Glow orbs de fundo */}
      <div className="bg-orb orb-1" />
      <div className="bg-orb orb-2" />

      {/* ── HERO ── */}
      <section className="hero">
        <div className="hero-left">
          <div className="hero-badge">
            <span className="badge-dot" />
            API gratuita da B3 e criptomoedas
          </div>

          <h1 className="hero-title">
            Acesse o{' '}
            <span className="gradient-text">mercado financeiro</span>
            {' '}em poucos segundos
          </h1>

          <p className="hero-desc">
            A API mais fácil do Brasil para cotações da Bovespa, dados históricos,
            fundamentos e criptomoedas — integrada em minutos, sem cartão de crédito.
          </p>

          <div className="hero-actions">
            <Link href="/docs" className="btn-primary">
              Ver Documentação →
            </Link>
            <Link href="/quotes" className="btn-secondary">
              Ver Cotações
            </Link>
          </div>

          <p className="hero-hint">✓ Sem cartão de crédito &nbsp;·&nbsp; ✓ Sem autenticação</p>
        </div>

        <div className="hero-right">
          <TerminalWindow />
        </div>
      </section>

      {/* ── STATS ── */}
      <section className="stats-section">
        {stats.map((s) => (
          <div key={s.label} className="stat-card">
            <span className="stat-value">{s.value}</span>
            <span className="stat-label">{s.label}</span>
          </div>
        ))}
      </section>

      {/* ── PARCEIROS ── */}
      <section className="partners-section">
        <p className="partners-label">Usado por times em</p>
        <div className="partners-logos">
          {partners.map((p) => (
            <span key={p} className="partner-logo">{p}</span>
          ))}
        </div>
      </section>

      {/* ── FEATURES ── */}
      <section className="features-section">
        <div className="section-header">
          <h2>Tudo que você precisa, <span className="gradient-text">pronto pra usar</span></h2>
          <p>Dados financeiros do Brasil disponíveis em uma API REST simples e bem documentada.</p>
        </div>
        <div className="features-grid">
          {features.map((f) => (
            <div key={f.title} className="feature-card">
              <div className="feature-icon">{f.icon}</div>
              <h3>{f.title}</h3>
              <p>{f.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* ── CTA FINAL ── */}
      <section className="cta-section">
        <div className="cta-card">
          <h2>Pronto para começar?</h2>
          <p>Faça sua primeira requisição em segundos. Sem burocracia.</p>
          <div className="cta-code">
            <code>curl https://b3trade.dev/api/quote/PETR4</code>
          </div>
          <div className="cta-actions">
            <Link href="/docs" className="btn-primary">
              Acessar Documentação
            </Link>
            <Link href="/about" className="btn-ghost">
              Saber mais sobre nós
            </Link>
          </div>
        </div>
      </section>
    </Container>
  );
};

export default Main;
