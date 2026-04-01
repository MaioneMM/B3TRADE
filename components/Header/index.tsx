import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/router';
import { FiMenu, FiX, FiBarChart2, FiLogOut, FiUser } from 'react-icons/fi';
import { useAuth } from '../../context/SignUp';
import { Container } from './styles';
import LanguageSwitcher from '../LanguageSwitcher';

const Header: React.FC = () => {
  const auth = useAuth();
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);

  // Detect if we're inside the simulator/platform environment
  const isSimulatorEnv = router.pathname.startsWith('/simulator') || router.pathname.startsWith('/commodities');

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener('scroll', onScroll);
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  return (
    <Container open={open} $scrolled={scrolled}>
      <div className="nav-inner">
        {/* Logo */}
        <Link href={isSimulatorEnv ? '/simulator' : '/'} className="logo-link" aria-label="B3TRADE home">
          <span style={{ fontSize: '1.4rem', fontWeight: 900, letterSpacing: '-0.03em', color: 'var(--text)' }}>
            <span style={{ color: 'var(--main)' }}>B3</span>TRADE
          </span>
          {isSimulatorEnv && (
            <span style={{ fontSize: '0.65rem', marginLeft: '8px', color: '#26a69a', border: '1px solid #26a69a', borderRadius: '4px', padding: '1px 6px', verticalAlign: 'middle' }}>
              PLATAFORMA
            </span>
          )}
        </Link>

        {/* Desktop nav — switches based on context */}
        <nav className="desktop-nav">
          {isSimulatorEnv ? (
            <>
              <Link href="/simulator" className="nav-link">Home Broker</Link>
              <Link href="/simulator/dashboard" className="nav-link" style={{ color: '#26a69a' }}>Carteira</Link>
              <Link href="/simulator/ranking" className="nav-link" style={{ color: '#FFD700' }}>Ranking</Link>
              <Link href="/commodities" className="nav-link" style={{ color: '#f59e0b' }}>Commodities</Link>
              <Link href="/simulator/settings" className="nav-link" style={{ color: '#aaa' }}>⚙️</Link>
              <span style={{ color: '#444', padding: '0 4px' }}>|</span>
              <span style={{ fontSize: '0.85rem', color: '#888' }}>
                <FiUser size={13} style={{ marginRight: 4, verticalAlign: 'middle' }} />
                {auth?.currentUser?.displayName?.split(' ')[0] || auth?.currentUser?.email}
              </span>
            </>
          ) : (
            <>
              <Link href="/docs"    className="nav-link">Documentação</Link>
              <Link href="/quotes"  className="nav-link">Cotações</Link>
              <Link href="/about"   className="nav-link">Sobre</Link>
              <Link href="/contact" className="nav-link">Contato</Link>
            </>
          )}
        </nav>

        {/* Actions */}
        <div className="nav-actions">
          {isSimulatorEnv ? (
            <button
              onClick={() => { auth?.signout(); router.push('/login'); }}
              className="nav-link desktop-only"
              style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#ef5350', display: 'flex', alignItems: 'center', gap: '5px', fontSize: '0.9rem' }}
            >
              <FiLogOut size={15} /> Sair
            </button>
          ) : (
            auth?.currentUser ? (
              <Link href="/simulator" className="btn-nav-cta">
                Acessar Simulador
              </Link>
            ) : (
              <>
                <Link href="/login" className="nav-link desktop-only">Entrar</Link>
                <Link href="/create-account" className="btn-nav-cta">Criar conta</Link>
              </>
            )
          )}
          <LanguageSwitcher />

          {/* Mobile toggle */}
          <button
            className="mobile-toggle"
            onClick={() => setOpen(!open)}
            aria-label={open ? 'Fechar menu' : 'Abrir menu'}
          >
            {open ? <FiX size={22} /> : <FiMenu size={22} />}
          </button>
        </div>
      </div>

      {/* Mobile menu */}
      {open && (
        <nav className="mobile-nav">
          {isSimulatorEnv ? (
            <>
              <Link href="/simulator" className="mobile-link" onClick={() => setOpen(false)}>
                <FiBarChart2 size={14} style={{ marginRight: 6 }} />Home Broker
              </Link>
              <Link href="/simulator/dashboard" className="mobile-link" onClick={() => setOpen(false)} style={{ color: '#26a69a' }}>
                ⭐ Minha Carteira
              </Link>
              <Link href="/simulator/ranking" className="mobile-link" onClick={() => setOpen(false)} style={{ color: '#FFD700' }}>
                🏆 Pódio/Ranking
              </Link>
              <Link href="/commodities" className="mobile-link" onClick={() => setOpen(false)} style={{ color: '#f59e0b' }}>
                🛢️ Commodities
              </Link>
              <Link href="/simulator/settings" className="mobile-link" onClick={() => setOpen(false)} style={{ color: '#aaa' }}>
                ⚙️ Configurações
              </Link>
              <div className="mobile-divider" />
              <button
                onClick={() => { auth?.signout(); router.push('/login'); setOpen(false); }}
                className="mobile-link"
                style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#ef5350', textAlign: 'left', padding: '0.8rem 1.5rem', width: '100%' }}
              >
                <FiLogOut size={14} style={{ marginRight: 6 }} />Sair
              </button>
            </>
          ) : (
            <>
              <Link href="/docs"    className="mobile-link" onClick={() => setOpen(false)}>Documentação</Link>
              <Link href="/quotes"  className="mobile-link" onClick={() => setOpen(false)}>Cotações</Link>
              <Link href="/about"   className="mobile-link" onClick={() => setOpen(false)}>Sobre</Link>
              <Link href="/contact" className="mobile-link" onClick={() => setOpen(false)}>Contato</Link>
              <div className="mobile-divider" />
              <Link href="/login"          className="mobile-link" onClick={() => setOpen(false)}>Entrar</Link>
              <Link href="/create-account" className="mobile-link highlight" onClick={() => setOpen(false)}>Criar conta</Link>
            </>
          )}
        </nav>
      )}
    </Container>
  );
};

export default Header;
