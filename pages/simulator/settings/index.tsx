import Head from 'next/head';
import Header from '../../../components/Header';
import Layout from '../../../Layout';
import AuthGuard from '../../../components/AuthGuard';
import { PortfolioProvider } from '../../../context/PortfolioContext';
import UserSettings from '../../../components/UserSettings';

const SettingsPage = () => {
  return (
    <PortfolioProvider>
      <AuthGuard>
        <div>
          <Head>
            <title>Configurações de Perfil - B3TRADE</title>
            <meta name="description" content="Personalize seu perfil de trader. Escolha seu nickname exclusivo que aparece no ranking e na plataforma." />
          </Head>
          <Layout>
            <Header />
            <UserSettings />
          </Layout>
        </div>
      </AuthGuard>
    </PortfolioProvider>
  );
};

export default SettingsPage;
