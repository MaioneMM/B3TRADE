import { useEffect } from 'react';
import { useRouter } from 'next/router';
import { useAuth } from '../../context/SignUp';

interface AuthGuardProps {
  children: React.ReactNode;
}

/**
 * Protects routes that require authentication.
 * Redirects to /login if the user is not logged in.
 * Shows nothing while the auth state is being resolved.
 */
const AuthGuard = ({ children }: AuthGuardProps) => {
  const auth = useAuth();
  const router = useRouter();

  const isAuthReady = auth !== undefined && auth !== null;
  const isLoggedIn = !!auth?.currentUser;

  useEffect(() => {
    if (isAuthReady && !isLoggedIn) {
      router.replace('/login?redirect=' + encodeURIComponent(router.pathname));
    }
  }, [isAuthReady, isLoggedIn, router]);

  // While checking auth or if not logged in, render nothing (avoids flash)
  if (!isAuthReady || !isLoggedIn) {
    return (
      <div style={{
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        height: '100vh',
        backgroundColor: 'var(--background)',
        color: 'var(--text)',
        fontSize: '1rem',
        gap: '12px',
      }}>
        <span style={{ fontSize: '1.5rem', animation: 'spin 1s linear infinite' }}>⟳</span>
        Verificando acesso...
      </div>
    );
  }

  return <>{children}</>;
};

export default AuthGuard;
