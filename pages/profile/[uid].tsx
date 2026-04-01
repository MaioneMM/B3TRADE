import React, { useEffect, useState } from 'react';
import Head from 'next/head';
import { useRouter } from 'next/router';
import Header from '../../components/Header';
import Layout from '../../Layout';
import Link from 'next/link';
import { FiArrowLeft } from 'react-icons/fi';
import { db } from '../../lib/firebase';
import { doc, getDoc, collection, getDocs } from 'firebase/firestore';
import { Achievement, ALL_ACHIEVEMENTS } from '../../lib/achievements';
import BadgeIcon from '../../components/BadgeIcon';
import styled from 'styled-components';

const Container = styled.div`
  max-width: 900px;
  margin: 3rem auto;
  padding: 0 1.5rem;
`;

const ProfileCard = styled.div`
  background: rgba(255,255,255,0.04);
  border: 1px solid rgba(255,255,255,0.08);
  border-radius: 16px;
  padding: 2.5rem;
  display: flex;
  align-items: center;
  gap: 2rem;
  margin-bottom: 2rem;

  @media (max-width: 600px) {
    flex-direction: column;
    text-align: center;
  }

  img.avatar {
    width: 90px;
    height: 90px;
    border-radius: 50%;
    border: 3px solid #26a69a;
    box-shadow: 0 0 20px rgba(38,166,154,0.3);
  }

  .avatar-placeholder {
    width: 90px;
    height: 90px;
    border-radius: 50%;
    background: linear-gradient(135deg, #26a69a, #3b82f6);
    display: flex;
    align-items: center;
    justify-content: center;
    font-size: 2.5rem;
    border: 3px solid #26a69a;
  }

  .info {
    flex: 1;
    h1 { font-size: 2rem; font-weight: 800; color: #fff; margin-bottom: 4px; }
    .sub { color: #888; font-size: 0.9rem; }
    .tag {
      display: inline-block;
      background: rgba(38,166,154,0.15);
      border: 1px solid rgba(38,166,154,0.3);
      border-radius: 20px;
      padding: 3px 12px;
      font-size: 0.78rem;
      color: #26a69a;
      margin-top: 8px;
    }
  }
`;

const Section = styled.div`
  background: rgba(255,255,255,0.03);
  border: 1px solid rgba(255,255,255,0.07);
  border-radius: 12px;
  padding: 1.5rem;
  margin-bottom: 1.5rem;

  h2 {
    font-size: 0.85rem;
    font-weight: 700;
    color: #26a69a;
    text-transform: uppercase;
    letter-spacing: 0.08em;
    margin-bottom: 1.2rem;
  }

  .badges-grid {
    display: flex;
    flex-wrap: wrap;
    gap: 1.5rem;
  }

  .stats-grid {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(120px, 1fr));
    gap: 1rem;

    .stat {
      background: rgba(0,0,0,0.2);
      border-radius: 8px;
      padding: 1rem;
      text-align: center;

      .val { font-size: 1.3rem; font-weight: 800; color: #fff; }
      .lbl { font-size: 0.75rem; color: #888; margin-top: 4px; }
    }
  }
`;

interface PublicProfile {
  nickname: string;
  displayName: string;
  photoURL: string;
  achievements: Achievement[];
  ordersCount: number;
  weeklyPnl: number;
  monthlyPnl: number;
}

const ProfilePage = () => {
  const router = useRouter();
  const { uid } = router.query as { uid: string };
  const [profile, setProfile] = useState<PublicProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [notFound, setNotFound] = useState(false);

  useEffect(() => {
    if (!uid) return;
    const fetchProfile = async () => {
      setLoading(true);
      try {
        const userSnap = await getDoc(doc(db, 'users', uid));
        if (!userSnap.exists()) {
          setNotFound(true);
          return;
        }
        
        const data = userSnap.data() || {};
        const basicProfile: PublicProfile = {
          nickname: data.nickname || '',
          displayName: data.displayName || 'Trader Anônimo',
          photoURL: data.photoURL || '',
          achievements: data.achievements || [],
          ordersCount: data.totalOrders || 0, // Agora usamos o contador público!
          weeklyPnl: data.rankings?.weeklyPnl || 0,
          monthlyPnl: data.rankings?.monthlyPnl || 0,
        };

        setProfile(basicProfile);

        // Se o contador público não existir (caso raro ou erro de sync), 
        // tenta contar manualmente se formos o dono
        if (data.totalOrders === undefined) {
          try {
            const ordersSnap = await getDocs(collection(db, 'users', uid, 'orders'));
            setProfile(prev => prev ? { ...prev, ordersCount: ordersSnap.size } : null);
          } catch (err) {
            console.log("Acesso restrito às estatísticas detalhadas deste trader.");
          }
        }

      } catch (e) {
        console.error("Erro ao carregar perfil:", e);
        setNotFound(true);
      } finally {
        setLoading(false);
      }
    };
    fetchProfile();
  }, [uid]);

  const displayName = profile?.nickname || profile?.displayName || 'Trader Anônimo';

  return (
    <div>
      <Head>
        <title>{displayName} - Perfil B3Trade</title>
        <meta name="description" content={`Veja o perfil do trader ${displayName} no B3Trade — conquistas, performance e histórico de operações.`} />
      </Head>
      <Layout>
        <Header />
        <Container>
          <Link href="/simulator/ranking" style={{ display: 'inline-flex', alignItems: 'center', gap: '8px', color: '#26a69a', textDecoration: 'none', marginBottom: '1.5rem', fontSize: '0.9rem', fontWeight: 600 }}>
            <FiArrowLeft size={16} /> Voltar ao Ranking
          </Link>
          
          {loading && <p style={{ color: '#888', textAlign: 'center', marginTop: '4rem' }}>Carregando perfil...</p>}
          {notFound && <p style={{ color: '#ef5350', textAlign: 'center', marginTop: '4rem' }}>Perfil não encontrado.</p>}
          
          {profile && (
            <>
              <ProfileCard>
                {profile.photoURL
                  ? <img className="avatar" src={profile.photoURL} alt="Avatar" />
                  : <div className="avatar-placeholder">🧑‍💼</div>
                }
                <div className="info">
                  <h1>{displayName}</h1>
                  {profile.nickname && <p className="sub">{profile.displayName}</p>}
                  <span className="tag">🎯 Trader B3Trade</span>
                </div>
              </ProfileCard>

              <Section>
                <h2>📊 Estatísticas</h2>
                <div className="stats-grid">
                  <div className="stat">
                    <div className="val">{profile.ordersCount}</div>
                    <div className="lbl">Operações</div>
                  </div>
                  <div className="stat">
                    <div className="val" style={{ color: profile.weeklyPnl >= 0 ? '#26a69a' : '#ef5350' }}>
                      {profile.weeklyPnl >= 0 ? '+' : ''}R$ {profile.weeklyPnl.toFixed(0)}
                    </div>
                    <div className="lbl">P&L Semanal</div>
                  </div>
                  <div className="stat">
                    <div className="val" style={{ color: profile.monthlyPnl >= 0 ? '#26a69a' : '#ef5350' }}>
                      {profile.monthlyPnl >= 0 ? '+' : ''}R$ {profile.monthlyPnl.toFixed(0)}
                    </div>
                    <div className="lbl">P&L Mensal</div>
                  </div>
                  <div className="stat">
                    <div className="val">{profile.achievements.length}</div>
                    <div className="lbl">Conquistas</div>
                  </div>
                </div>
              </Section>

              <Section>
                <h2>🏅 Conquistas</h2>
                <div className="badges-grid">
                  {ALL_ACHIEVEMENTS.map(def => {
                    const earned = profile.achievements.find(a => a.id === def.id);
                    return (
                      <BadgeIcon
                        key={def.id}
                        achievement={earned || def as Achievement}
                        unlocked={!!earned}
                        size="md"
                        showTitle
                      />
                    );
                  })}
                </div>
              </Section>
            </>
          )}
        </Container>
      </Layout>
    </div>
  );
};

export default ProfilePage;
