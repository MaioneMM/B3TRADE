import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { Container } from './styles';
import { collection, query, limit, getDocs } from 'firebase/firestore';
import { db } from '../../lib/firebase';
import { getRankingIds } from '../../context/PortfolioContext';

interface RankingUser {
  uid: string;
  displayName: string;
  photoURL: string;
  pnl: number;
}

const RankingDashboard = () => {
  const [activeTab, setActiveTab] = useState<'week' | 'month' | 'year'>('month');
  const [users, setUsers] = useState<RankingUser[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchRanking = async () => {
      setLoading(true);
      try {
        const q = query(collection(db, 'users'), limit(100)); // Limita top 100 traders ativos do B3TRADE
        const snap = await getDocs(q);
        
        const { weekId, monthId, yearId } = getRankingIds();
        const results: RankingUser[] = [];
        
        snap.forEach(doc => {
          const data = doc.data();
          const rankings = data.rankings || {};
          let pnl = 0;
          
          if (activeTab === 'week' && rankings.weekId === weekId) pnl = rankings.weeklyPnl || 0;
          if (activeTab === 'month' && rankings.monthId === monthId) pnl = rankings.monthlyPnl || 0;
          if (activeTab === 'year' && rankings.yearId === yearId) pnl = rankings.yearlyPnl || 0;
          
          if (pnl !== 0 || Object.keys(rankings).length > 0) {
             results.push({
               uid: doc.id,
               displayName: data.nickname || data.displayName || 'Trader Anônimo',
               photoURL: data.photoURL || '',
               pnl
             });
          }
        });

        results.sort((a, b) => b.pnl - a.pnl);

        setUsers(results);
      } catch (err) {
        console.error("Erro ao puxar ranking", err);
      } finally {
        setLoading(false);
      }
    };

    fetchRanking();
  }, [activeTab]);

  return (
    <Container>
      <h1>Pódio dos Traders 🏆</h1>
      <p className="subtitle">
        Ranking Global medido por <strong>Lucro Financeiro Realizado (Fechado)</strong>.<br/>
        <span style={{ fontSize: '0.85rem', color: '#888' }}>
          *Aviso: Para evitar sobrecargas, este painel puxa resultados apenas no fechamento do dia!
        </span>
      </p>

      <div className="tabs">
        <button className={activeTab === 'week' ? 'active' : ''} onClick={() => setActiveTab('week')}>Esta Semana</button>
        <button className={activeTab === 'month' ? 'active' : ''} onClick={() => setActiveTab('month')}>Este Mês</button>
        <button className={activeTab === 'year' ? 'active' : ''} onClick={() => setActiveTab('year')}>Este Ano</button>
      </div>

      <div className="ranking-list">
        {loading ? (
          <div className="empty">Calculando pontuações globais...</div>
        ) : users.length === 0 ? (
          <div className="empty">Nenhum competidor realizou lucro ou prejuízo neste período.</div>
        ) : (
          users.map((u, idx) => {
            let posClass = '';
            if (idx === 0) posClass = 'gold';
            else if (idx === 1) posClass = 'silver';
            else if (idx === 2) posClass = 'bronze';

            return (
              <div className="row" key={u.uid}>
                <div className={`pos ${posClass}`}>
                  {idx === 0 ? '🥇' : idx === 1 ? '🥈' : idx === 2 ? '🥉' : `${idx + 1}º`}
                </div>
                {u.photoURL ? (
                  <img src={u.photoURL} alt="Avatar" className="avatar" />
                ) : (
                  <div className="avatar" />
                )}
                <div className="name">
                  <Link href={`/profile/${u.uid}`} style={{ color: '#fff', textDecoration: 'none' }}
                    onMouseEnter={e => (e.currentTarget.style.color = '#26a69a')}
                    onMouseLeave={e => (e.currentTarget.style.color = '#fff')}
                  >
                    {u.displayName}
                  </Link>
                </div>
                <div className={`pnl ${u.pnl > 0 ? 'positive' : u.pnl < 0 ? 'negative' : 'neutral'}`}>
                  {u.pnl > 0 ? '+' : ''}R$ {u.pnl.toFixed(2)}
                </div>
              </div>
            );
          })
        )}
      </div>
    </Container>
  );
};

export default RankingDashboard;
