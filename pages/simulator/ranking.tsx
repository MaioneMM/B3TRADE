import Head from 'next/head';
import Header from '../../components/Header';
import AuthGuard from '../../components/AuthGuard';
import { PortfolioProvider } from '../../context/PortfolioContext';
import RankingDashboard from '../../components/RankingDashboard';

const RankingPage = () => {
  return (
    <AuthGuard>
      <PortfolioProvider>
        <Head>
          <title>B3TRADE - Pódio de Traders</title>
        </Head>
        <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column' }}>
          <Header />
          <div style={{ flex: 1, padding: '1rem' }}>
            <RankingDashboard />
          </div>
        </div>
      </PortfolioProvider>
    </AuthGuard>
  );
};

export default RankingPage;
