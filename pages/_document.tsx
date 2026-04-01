import Document, { Html, Head, Main, NextScript } from 'next/document';
import { ServerStyleSheet } from 'styled-components';
import { GA_TRACKING_ID } from '../utils/gtag';

class MyDocument extends Document {
  static async getInitialProps(ctx: any) {
    const sheet = new ServerStyleSheet();
    const originalRenderPage = ctx.renderPage;
    try {
      ctx.renderPage = () =>
        originalRenderPage({
          enhanceApp: (App: any) => (props: any) =>
            sheet.collectStyles(<App {...props} />),
        });
      const initialProps = await Document.getInitialProps(ctx);

      return {
        ...initialProps,
        styles: (
          <>
            {initialProps.styles}
            {sheet.getStyleElement()}
          </>
        ),
      };
    } finally {
      sheet.seal();
    }
  }
  render() {
    return (
      <Html lang="pt-br">
        <Head>
          <link rel="preconnect" href="https://fonts.googleapis.com" />
          <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
          <link
            href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800;900&family=JetBrains+Mono:wght@400;500&display=swap"
            rel="stylesheet"
          />
          <link rel="icon" href="/favicon.svg" />
          <meta name="description" content="B3Trade - Simulador de Bolsa de Valores gratuito com dados reais da B3. Aprenda a investir, faça day trade virtual, e dispute no ranking global sem arriscar dinheiro real." />
          <meta
            name="keywords"
            content="simulador bolsa de valores, simulador B3, day trade virtual, simulador de investimentos, aprender a investir, trading simulator, home broker gratuito, simulador ações Brasil, rank traders, bolsa valores grátis, IBOVESPA, PETR4, VALE3, ITUB4, simulação financeira"
          />
          <meta name="theme-color" content="#0a0a0f" />
          <meta name="robots" content="index, follow" />
          <meta name="author" content="B3Trade" />

          {/* Open Graph (Facebook, LinkedIn, WhatsApp) */}
          <meta property="og:site_name" content="B3Trade" />
          <meta property="og:title" content="B3Trade - Simulador de Bolsa de Valores" />
          <meta property="og:type" content="website" />
          <meta property="og:image" content="https://b3trade.ga/og-image.png" />
          <meta property="og:image:width" content="1200" />
          <meta property="og:image:height" content="630" />
          <meta
            property="og:description"
            content="Simule investimentos na Bolsa de Valores brasileira com dados reais. Compre e venda ações, acompanhe seu PnL e dispute o ranking global de traders. Grátis e sem risco."
          />
          <meta property="og:url" content="https://b3trade.ga" />
          <meta property="og:locale" content="pt_BR" />

          {/* Twitter Cards */}
          <meta name="twitter:card" content="summary_large_image" />
          <meta name="twitter:title" content="B3Trade - Simulador de Bolsa de Valores" />
          <meta name="twitter:description" content="Simule investimentos na B3 com dados reais. Aprenda day trade sem arriscar dinheiro. Ranking global de traders." />
          <meta name="twitter:image" content="https://b3trade.ga/og-image.png" />

          <link rel="manifest" href="/manifest.json" />
          <meta
            name="google-site-verification"
            content="Gy5EFTeucGOTohOucovRJIzCaWPkQ1qWs3mktuSNyGw"
          />

          {/* Global Site Tag (gtag.js) - Google Analytics */}
          <script
            async
            src={`https://www.googletagmanager.com/gtag/js?id=${GA_TRACKING_ID}`}
          />
          <script
            dangerouslySetInnerHTML={{
              __html: `
              window.dataLayer = window.dataLayer || [];
              function gtag(){dataLayer.push(arguments);}
              gtag('js', new Date());
              gtag('config', '${GA_TRACKING_ID}', {
                page_path: window.location.pathname,
              });
          `,
            }}
          />
        </Head>
        <body>
          <Main />
          <NextScript />
        </body>
      </Html>
    );
  }
}

export default MyDocument;
