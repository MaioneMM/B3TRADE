import Link from 'next/link';
import React from 'react';
import { useRouter } from 'next/router';
import { ImWhatsapp } from 'react-icons/im';

import { Container } from './styles';

const Footer: React.FC = () => {
  const router = useRouter();
  const isSimulatorEnv = router.pathname.startsWith('/simulator');

  if (isSimulatorEnv) {
    return (
      <Container style={{ padding: '1rem 2rem', marginTop: 0, borderTop: '1px solid #222' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', width: '100%', fontSize: '0.75rem', color: '#666' }}>
          <span>© {new Date().getFullYear()} B3Trade Platform - Simulação Educacional</span>
          <div style={{ display: 'flex', gap: '15px' }}>
            <Link href="/legal" style={{ color: '#666' }}>Termos</Link>
            <Link href="/contact" style={{ color: '#666' }}>Suporte</Link>
          </div>
        </div>
      </Container>
    );
  }

  return (
    <Container>
      <div>
        <span>
          <h2>B3TRADE</h2>
          <Link href="/about">sobre</Link>
          <Link href="/docs">docs</Link>
          <Link href="/quotes">cotação</Link>
          <Link href="/contact">contato</Link>
          <Link href="/legal">legal</Link>
          <Link href="https://status.brapi.ga/" target="_blank" rel="noopener noreferrer">status</Link>
        </span>

        <span>
          <h2>contato</h2>
          <p>brapi@protonmail.com</p>
          <Link href="https://github.com/alissonsleal/brapi/issues" target="_blank" rel="noopener noreferrer">Github</Link>
        </span>

        <span>
          <h2>sobre nós</h2>
          <p>
            Ajudamos desenvolvedores a construir o futuro das fintechs
            democratizando o acesso aos dados do mercado financeiro brasileiro.
          </p>
        </span>

        <span>
          <h2>convide</h2>
          <p>Compartilhe com seus amigos!</p>
          <Link
            href="https://api.whatsapp.com/send?text=Quero%20te%20convidar%20para%20conhecer%20a%20B3TRADE,%20o%20jeito%20mais%20f%C3%A1cil%20de%20acessar%20uma%20API%20da%20bolsa%20de%20valores!%20Clique%20no%20link%20para%20ter%20acesso%20gratuitamente%20https://www.b3trade.ga/"
            className="wpp-button"
            rel="noreferrer noopener"
            target="_blank"
          >
            <ImWhatsapp size={20} />Compartilhe agora
          </Link>
          <br /><br />
          <a href="https://vercel.com/?utm_source=alisson-oss&utm_campaign=oss" rel="noreferrer noopener" target="_blank">
            <img src="https://www.datocms-assets.com/31049/1618983297-powered-by-vercel.svg" alt="Powered by Vercel" />
          </a>
        </span>
      </div>
    </Container>
  );
};

export default Footer;
