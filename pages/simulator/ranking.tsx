import Head from 'next/head';
import Header from '../../components/Header';
import Layout from '../../Layout';
import AuthGuard from '../../components/AuthGuard';
import { PortfolioProvider } from '../../context/PortfolioContext';
import RankingDashboard from '../../components/RankingDashboard';

const RankingPage = () => {
  return (
    <PortfolioProvider>
      <AuthGuard>
        <div>
          <Head>
            <title>Ranking - B3TRADE</title>
          </Head>
          <Layout>
            <Header />
            <RankingDashboard />
          </Layout>
        </div>
      </AuthGuard>
    </PortfolioProvider>
  );
};

export default RankingPage;
