import { useAuth } from '../../context/SignUp';
import { Container } from './styles';
import { FiGithub, FiBarChart2, FiLogOut } from 'react-icons/fi';
import { FcGoogle } from 'react-icons/fc';
import Link from 'next/link';
import { useState, useEffect } from 'react';
import { useRouter } from 'next/router';

const SignUp = ({ create = false }: any) => {
  const auth = useAuth();
  const router = useRouter();
  const { redirect } = router.query;
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');

  // Automatic redirect after login if redirect query exists
  useEffect(() => {
    if (auth?.currentUser && redirect) {
      router.replace(String(redirect));
    }
  }, [auth?.currentUser, redirect, router]);

  const handleEmailAuth = async (e: any) => {
    e.preventDefault();
    setError('');
    try {
      if (create) {
        await auth.signupWithEmail(email, password);
      } else {
        await auth.signinWithEmail(email, password);
      }
    } catch (err: any) {
      setError('Erro: ' + (err.message || 'Verifique seus dados.'));
    }
  };

  return (
    <Container>
      <main>
        {(!auth?.currentUser || redirect) ? (
          <>
            <h1>{create ? `Criar uma Conta` : `Entrar`}</h1>
            <p>
              Acesse a plataforma de simulação <strong>B3Trade</strong> ou gerencie suas chaves de API.
            </p>
          </>
        ) : (
          <>
            <h1>Bem-vindo à B3Trade</h1>
            <p style={{ marginBottom: '2rem' }}>Escolha o ambiente para acessar agora:</p>
            
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem', width: '100%' }}>
              <Link href="/simulator">
                <button style={{ 
                  backgroundColor: '#26a69a', 
                  color: '#fff', 
                  width: '100%', 
                  padding: '1.2rem',
                  fontSize: '1.1rem',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '12px'
                }}>
                  <FiBarChart2 size={24} /> Acessar Plataforma Simuladora
                </button>
              </Link>
              
              <Link href="/docs">
                <button style={{ 
                  backgroundColor: 'transparent', 
                  border: '1px solid #444',
                  color: '#aaa', 
                  width: '100%',
                  padding: '1rem',
                  fontWeight: 'normal'
                }}>
                  Documentação da API
                </button>
              </Link>
            </div>
          </>
        )}

        {!auth?.currentUser && (
          <form onSubmit={handleEmailAuth}>
            <input 
              type="email" 
              placeholder="Seu melhor email" 
              value={email} 
              onChange={e => setEmail(e.target.value)} 
              required 
            />
            <input 
              type="password" 
              placeholder="Senha segura" 
              value={password} 
              onChange={e => setPassword(e.target.value)} 
              required 
            />
            {error && <span className="error-msg">{error}</span>}
            <button type="submit" style={{ backgroundColor: 'var(--main)' }}>
              {create ? `Criar conta com Email` : `Entrar com Email`}
            </button>
          </form>
        )}

        {!auth?.currentUser && (
          <div className="separator">ou use suas redes sociais</div>
        )}

        {!auth?.currentUser && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem', width: '100%' }}>
            <button onClick={() => auth.signinWithGithub()}>
              <FiGithub size={'1.2rem'} color="#fafafa" />
              {create ? `Criar conta com Github` : `Entrar com Github`}
            </button>
            <button onClick={() => auth.signinWithGoogle()} style={{ backgroundColor: '#ffffff', color: '#757575', border: '1px solid #ddd' }}>
              <FcGoogle size={'1.2rem'} />
              {create ? `Criar conta com Google` : `Entrar com Google`}
            </button>
          </div>
        )}

        {auth?.currentUser && (
          <>
            <div className="info-container">
              <img
                src={auth?.currentUser?.photoURL}
                alt="Foto de perfil do usuário"
              />
              <div className="text-container">
                <p>{auth?.currentUser?.displayName}</p>
                <p>{auth?.currentUser?.email}</p>
              </div>
            </div>

            <button className="button-leave" onClick={() => auth.signout()}>
              Sair
            </button>
          </>
        )}
      </main>
    </Container>
  );
};

export default SignUp;
