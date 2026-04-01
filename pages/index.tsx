import Head from 'next/head';
import React from 'react';
import Header from '../components/Header';
import Main from '../components/Main';
import Layout from '../Layout';

const Home = () => {
  return (
    <div>
      <Head>
        <title>B3TRADE - Simulador de Investimentos</title>
      </Head>
      <Layout>
        <Header />
        <Main />
      </Layout>
    </div>
  );
};

export default Home;
