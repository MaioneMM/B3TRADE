import React from 'react';
import Head from 'next/head';
import Header from '../../components/Header';
import Layout from '../../Layout';
import PortfolioDashboard from '../../components/PortfolioDashboard';
import { PortfolioProvider } from '../../context/PortfolioContext';
import AuthGuard from '../../components/AuthGuard';

const DashboardView = () => {
  return (
    <PortfolioProvider>
      <AuthGuard>
        <div>
          <Head>
            <title>Minha Carteira - B3Trade</title>
          </Head>
          <Layout>
            <Header />
            <PortfolioDashboard />
          </Layout>
        </div>
      </AuthGuard>
    </PortfolioProvider>
  );
};

export default DashboardView;
