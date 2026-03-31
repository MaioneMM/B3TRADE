import React from 'react';
import Head from 'next/head';
import Header from '../../components/Header';
import Layout from '../../Layout';
import MainSimulator from '../../components/MainSimulator';

import { PortfolioProvider } from '../../context/PortfolioContext';

import AuthGuard from '../../components/AuthGuard';

const Simulator = () => {
  return (
    <PortfolioProvider>
      <AuthGuard>
        <div>
          <Head>
            <title>B3Trade - Simulador de Trading B3</title>
          </Head>
          <Layout>
            <Header />
            <MainSimulator />
          </Layout>
        </div>
      </AuthGuard>
    </PortfolioProvider>
  );
};

export default Simulator;
