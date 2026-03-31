import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { usePortfolio } from '../../context/PortfolioContext';
import { DashboardContainer, SummaryGrid, MainContentGrid, PieContainer, TableWrapper } from './styles';

// Defines predefined colors for the chart
const COLORS = ['#26a69a', '#ef5350', '#29b6f6', '#ab47bc', '#ffa726', '#8d6e63', '#78909c'];

const PortfolioDashboard = () => {
  const { balance, positions, orders, isLoaded, resetPortfolio } = usePortfolio();
  
  const [livePrices, setLivePrices] = useState<Record<string, number>>({});
  const [loadingPrices, setLoadingPrices] = useState(false);
  
  const [showResetModal, setShowResetModal] = useState(false);
  const [confirmReset, setConfirmReset] = useState(false);

  // Fetch live prices for all positions on mount
  useEffect(() => {
    const fetchPrices = async () => {
      if (positions.length === 0) return;
      setLoadingPrices(true);
      
      const tickersToFetch = positions.map(p => p.ticker).join(',');
      try {
        const res = await axios.get(`/api/quote/${tickersToFetch}`);
        const newPrices: Record<string, number> = {};
        
        // Single ticker returns object, multiple returns array
        const results = Array.isArray(res.data.results) ? res.data.results : [res.data.results];
        
        results.forEach((r: any) => {
          if (r?.symbol) newPrices[r.symbol] = r.regularMarketPrice || 0;
        });
        setLivePrices(newPrices);
      } catch (err) {
        console.error("Failed to fetch dashboard quotes", err);
      } finally {
        setLoadingPrices(false);
      }
    };

    fetchPrices();
    
    // Auto-refresh every 30 seconds
    const interval = setInterval(fetchPrices, 30000);
    return () => clearInterval(interval);
  }, [positions]);

  if (!isLoaded) return <DashboardContainer><h2>Carregando carteira...</h2></DashboardContainer>;

  // 1. Calculate Metrics
  let totalInvestedCurrentValue = 0;
  let totalInvestedCost = 0;

  const positionsWithValuation = positions.map((p, index) => {
    const currentPrice = livePrices[p.ticker] || p.averagePrice;
    const currentValue = p.quantity * currentPrice;
    const costValue = p.quantity * p.averagePrice;
    
    totalInvestedCurrentValue += currentValue;
    totalInvestedCost += costValue;

    return {
      ...p,
      currentPrice,
      currentValue,
      costValue,
      color: COLORS[index % COLORS.length]
    };
  });

  const totalEquity = balance + totalInvestedCurrentValue;
  const portfolioPnL = totalInvestedCurrentValue - totalInvestedCost;
  const portfolioPnLPercent = totalInvestedCost > 0 ? (portfolioPnL / totalInvestedCost) * 100 : 0;

  // 2. Prepare Pie Chart Segments
  let currentAngle = 0;
  const segments = [];
  
  // Cash segment
  const cashPercent = totalEquity > 0 ? (balance / totalEquity) * 100 : 100;
  const cashAngle = (cashPercent / 100) * 360;
  segments.push({ color: '#4CAF50', start: currentAngle, end: currentAngle + cashAngle, label: 'Caixa Livre', percent: cashPercent });
  currentAngle += cashAngle;

  // Position segments
  positionsWithValuation.sort((a, b) => b.currentValue - a.currentValue).forEach(p => {
    const percent = totalEquity > 0 ? (p.currentValue / totalEquity) * 100 : 0;
    const angle = (percent / 100) * 360;
    segments.push({ color: p.color, start: currentAngle, end: currentAngle + angle, label: p.ticker, percent });
    currentAngle += angle;
  });

  const conicGradientStr = segments.map(s => `${s.color} ${s.start}deg ${s.end}deg`).join(', ');

  return (
    <DashboardContainer>
      {showResetModal && (
        <div style={{
          position: 'fixed', top: 0, left: 0, right: 0, bottom: 0,
          backgroundColor: 'rgba(0,0,0,0.85)',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          zIndex: 99999, animation: 'fadeIn 0.2s ease-out'
        }}>
          <div style={{
            background: '#1e1e24', padding: '2rem', borderRadius: '8px',
            border: '1px solid #ef5350', maxWidth: '450px', width: '90%',
            boxShadow: '0 10px 30px rgba(0,0,0,0.8)'
          }}>
            <h2 style={{ color: '#ef5350', marginTop: 0, display: 'flex', alignItems: 'center', gap: '10px' }}>
              ⚠️ Ação Irreversível
            </h2>
            <p style={{ fontSize: '0.90rem', color: '#ccc', lineHeight: 1.5 }}>
              Você está prestes a apagar todo o seu histórico de simulação. Todas as suas posições serão fechadas e seu poder de compra retornará aos <strong>R$ 100.000,00</strong> iniciais.
            </p>
            <div style={{ margin: '1.5rem 0', background: '#0a0a0c', padding: '1rem', borderRadius: '6px', border: '1px solid #333' }}>
              <label style={{ display: 'flex', alignItems: 'flex-start', gap: '10px', cursor: 'pointer', fontSize: '0.85rem', color: '#aaa', lineHeight: 1.4 }}>
                <input 
                  type="checkbox" 
                  checked={confirmReset} 
                  onChange={(e) => setConfirmReset(e.target.checked)} 
                  style={{ width: '18px', height: '18px', accentColor: '#ef5350', cursor: 'pointer', flexShrink: 0, marginTop: '2px' }}
                />
                Sim, eu entendo que perderei todos os meus ativos e meu histórico de performance será expurgado da nuvem.
              </label>
            </div>
            <div style={{ display: 'flex', gap: '1rem', justifyContent: 'flex-end' }}>
              <button 
                onClick={() => { setShowResetModal(false); setConfirmReset(false); }}
                style={{ padding: '0.6rem 1.2rem', background: 'transparent', border: '1px solid #555', color: '#ccc', borderRadius: '4px', cursor: 'pointer', fontWeight: 'bold' }}>
                Cancelar
              </button>
              <button 
                onClick={() => { resetPortfolio(); setShowResetModal(false); setConfirmReset(false); }}
                disabled={!confirmReset}
                style={{ 
                  padding: '0.6rem 1.5rem', 
                  background: confirmReset ? '#ef5350' : '#333', 
                  color: confirmReset ? '#fff' : '#666',
                  border: '1px solid', borderColor: confirmReset ? '#ef5350' : '#444', 
                  borderRadius: '4px', 
                  cursor: confirmReset ? 'pointer' : 'not-allowed',
                  fontWeight: 'bold', transition: '0.2s'
                }}>
                Zerar Simulador
              </button>
            </div>
          </div>
        </div>
      )}

      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
        <h1 style={{ margin: 0 }}>Minha Carteira</h1>
        <button 
          onClick={() => setShowResetModal(true)} 
          style={{ backgroundColor: 'transparent', color: '#ef5350', border: '1px solid #ef5350', padding: '0.5rem 1rem', borderRadius: '4px', cursor: 'pointer', fontSize: '0.9rem', fontWeight: 'bold' }}
        >
          Resetar Valores
        </button>
      </div>
      <SummaryGrid>
        <div className="card">
          <h3>Patrimônio Total</h3>
          <p>R$ {totalEquity.toFixed(2)}</p>
        </div>
        <div className="card">
          <h3>Lucro/Prejuízo Aberto</h3>
          <p>
             <span className={portfolioPnL >= 0 ? 'positive' : 'negative'}>
                {portfolioPnL >= 0 ? '+' : ''}R$ {portfolioPnL.toFixed(2)}
             </span>
             <span className="sub">({portfolioPnLPercent >= 0 ? '+' : ''}{portfolioPnLPercent.toFixed(2)}%)</span>
          </p>
        </div>
        <div className="card">
          <h3>Poder de Compra (Caixa)</h3>
          <p>R$ {balance.toFixed(2)}</p>
        </div>
      </SummaryGrid>

      <MainContentGrid>
        <div className="section-card">
           <h2>Alocação de Ativos</h2>
           {totalEquity === 0 ? (
             <p style={{ color: '#888' }}>Sua carteira está vazia.</p>
           ) : (
             <PieContainer>
               <div className="pie-wrapper" style={{ background: `conic-gradient(${conicGradientStr})` }}>
                  <div className="pie-hole" />
               </div>
               <ul className="legend">
                 {segments.map(s => (
                   <li key={s.label}>
                     <div className="label-col">
                       <span className="dot" style={{ background: s.color }}></span>
                       {s.label}
                     </div>
                     <strong>{s.percent.toFixed(1)}%</strong>
                   </li>
                 ))}
               </ul>
             </PieContainer>
           )}
        </div>

        <div className="section-card">
          <h2>Posições Abertas {loadingPrices && <span style={{ fontSize: '0.8rem', color: '#888' }}>(Atualizando...)</span>}</h2>
          <TableWrapper style={{ maxHeight: '300px', overflowY: 'auto' }}>
            <table>
              <thead>
                <tr>
                  <th>Ativo</th>
                  <th>Qtd</th>
                  <th>Preço Médio</th>
                  <th>Atual</th>
                  <th>L/P</th>
                </tr>
              </thead>
              <tbody>
                {positionsWithValuation.length === 0 && (
                  <tr><td colSpan={5} style={{ textAlign: 'center', color: '#888' }}>Nenhuma ação em custódia.</td></tr>
                )}
                {positionsWithValuation.map(p => {
                  const pnl = p.currentValue - p.costValue;
                  const pnlPercent = ((p.currentPrice - p.averagePrice) / p.averagePrice) * 100;
                  return (
                    <tr key={p.ticker}>
                      <td><strong style={{ color: p.color }}>{p.ticker}</strong></td>
                      <td>{p.quantity}</td>
                      <td>R$ {p.averagePrice.toFixed(2)}</td>
                      <td>R$ {p.currentPrice.toFixed(2)}</td>
                      <td className={pnl >= 0 ? 'positive' : 'negative'}>
                        R$ {pnl.toFixed(2)} <br/>
                        <span style={{ fontSize: '0.75rem' }}>({pnlPercent >= 0 ? '+' : ''}{pnlPercent.toFixed(2)}%)</span>
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </TableWrapper>
        </div>
      </MainContentGrid>

      <div className="section-card" style={{ background: '#1e1e24', padding: '1.5rem', borderRadius: '8px', border: '1px solid #333' }}>
        <h2 style={{ marginTop: 0, marginBottom: '1rem', fontSize: '1.25rem', borderBottom: '1px solid #333', paddingBottom: '0.5rem' }}>Extrato de Operações</h2>
        <TableWrapper style={{ maxHeight: '400px', overflowY: 'auto' }}>
          <table>
            <thead>
              <tr>
                <th>Data / Hora</th>
                <th>Ativo</th>
                <th>Operação</th>
                <th>Quantidade</th>
                <th>Preço</th>
                <th>Volume Financeiro</th>
              </tr>
            </thead>
            <tbody>
              {orders.length === 0 && (
                <tr><td colSpan={6} style={{ textAlign: 'center', color: '#888' }}>Nenhuma operação registrada no histórico.</td></tr>
              )}
              {orders.map((o, idx) => {
                const vol = o.quantity * o.price;
                
                // Tratar a data corretamente: se for timestamp em segundos do gráfico, converte pra ms.
                let dataO = new Date(o.time);
                const rawNumeric = typeof o.time === 'number' ? o.time : Number(o.time);
                if (!isNaN(rawNumeric) && rawNumeric < 10000000000 && rawNumeric > 0) {
                   dataO = new Date(rawNumeric * 1000);
                } else if (o.time && String(o.time).includes('T')) {
                   dataO = new Date(o.time);
                } else if (isNaN(dataO.getTime())) {
                   dataO = new Date(); // fallback
                }

                const dataStr = dataO.toLocaleString('pt-BR', { dateStyle: 'short', timeStyle: 'short' });
                return (
                  <tr key={idx}>
                    <td>{dataStr}</td>
                    <td><strong>{o.ticker}</strong></td>
                    <td>
                      {o.type === 'BUY' ? <span className="positive">COMPRA</span> : <span className="negative">VENDA</span>}
                    </td>
                    <td>{o.quantity}</td>
                    <td>R$ {o.price.toFixed(2)}</td>
                    <td>R$ {vol.toFixed(2)}</td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        </TableWrapper>
      </div>

    </DashboardContainer>
  );
};

export default PortfolioDashboard;
