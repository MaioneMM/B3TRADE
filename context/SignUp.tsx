import React, { useState, useEffect, useContext, createContext, useRef } from 'react';
import { GithubAuthProvider, GoogleAuthProvider, signInWithPopup, signOut, onAuthStateChanged, User, signInWithEmailAndPassword, createUserWithEmailAndPassword } from 'firebase/auth';
import { auth } from '../lib/firebase';

const authContext = createContext({} as any);

export function AuthProvider({ children }: any) {
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const popupInProgress = useRef(false);

  const signinWithGithub = async () => {
    if (popupInProgress.current) return;
    popupInProgress.current = true;
    try {
      const provider = new GithubAuthProvider();
      const response = await signInWithPopup(auth, provider);
      setCurrentUser(response.user);
      return response.user;
    } catch (err: any) {
      if (err.code !== 'auth/cancelled-popup-request' && err.code !== 'auth/popup-closed-by-user') {
        throw err;
      }
    } finally {
      popupInProgress.current = false;
    }
  };

  const signinWithGoogle = async () => {
    if (popupInProgress.current) return;
    popupInProgress.current = true;
    try {
      const provider = new GoogleAuthProvider();
      const response = await signInWithPopup(auth, provider);
      setCurrentUser(response.user);
      return response.user;
    } catch (err: any) {
      if (err.code !== 'auth/cancelled-popup-request' && err.code !== 'auth/popup-closed-by-user') {
        throw err;
      }
    } finally {
      popupInProgress.current = false;
    }
  };

  const signinWithEmail = async (email: string, pass: string) => {
    // Intercepta login local de teste sem precisar de conexao com Firebase
    if (email === 'teste@teste.com' && pass === '123456') {
      const mockUser = {
        uid: 'local-mock-id',
        email: 'teste@teste.com',
        displayName: 'Usuário de Teste Local',
        photoURL: 'https://avatars.githubusercontent.com/u/9919?v=4',
      } as User;
      
      setCurrentUser(mockUser);
      return mockUser;
    }

    const response = await signInWithEmailAndPassword(auth, email, pass);
    setCurrentUser(response.user);
    return response.user;
  };

  const signupWithEmail = async (email: string, pass: string) => {
    const response = await createUserWithEmailAndPassword(auth, email, pass);
    setCurrentUser(response.user);
    return response.user;
  };

  const signout = async () => {
    await signOut(auth);
    setCurrentUser(null);
  };

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      setCurrentUser(user);
    });

    return unsubscribe;
  }, []);

  const value = {
    currentUser,
    signinWithGithub,
    signinWithGoogle,
    signinWithEmail,
    signupWithEmail,
    signout,
  };

  return <authContext.Provider value={value}>{children}</authContext.Provider>;
}

export const useAuth = () => {
  return useContext(authContext);
};
