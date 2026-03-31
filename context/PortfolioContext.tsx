import React, { createContext, useContext, useState, useEffect } from 'react';
import { db, auth } from '../lib/firebase';
import { doc, getDoc, setDoc, collection, getDocs, writeBatch, deleteDoc } from 'firebase/firestore';
import { onAuthStateChanged, User } from 'firebase/auth';

export interface Position {
  ticker: string;
  quantity: number;
  averagePrice: number;
}

export interface Order {
  ticker: string;
  type: 'BUY' | 'SELL';
  quantity: number;
  price: number;
  time: string;
}

export interface PendingOrder {
  id: string;
  ticker: string;
  type: 'BUY_LIMIT' | 'SELL_LIMIT' | 'SELL_STOP';
  quantity: number;
  targetPrice: number;
  time: string;
  ocoId?: string; // One Cancels the Other Identifier
}

interface PortfolioContextProps {
  balance: number;
  positions: Position[];
  orders: Order[];
  pendingOrders: PendingOrder[];
  favorites: string[];
  isLoaded: boolean;
  buyMarket: (ticker: string, quantity: number, currentPrice: number, currentTime: string, stopLoss?: number, takeProfit?: number) => Promise<void>;
  sellMarket: (ticker: string, quantity: number, currentPrice: number, currentTime: string) => Promise<void>;
  addPendingOrder: (order: Omit<PendingOrder, 'id'>) => Promise<void>;
  cancelPendingOrder: (id: string) => Promise<void>;
  processPendingOrders: (ticker: string, livePrice: number, liveTime: string) => Promise<void>;
  toggleFavorite: (ticker: string) => Promise<void>;
  resetPortfolio: () => Promise<void>;
}

const PortfolioContext = createContext<PortfolioContextProps | undefined>(undefined);

export const PortfolioProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const INITIAL_BALANCE = 100000;
  
  const [user, setUser] = useState<User | null>(null);
  const [balance, setBalance] = useState<number>(INITIAL_BALANCE);
  const [positions, setPositions] = useState<Position[]>([]);
  const [orders, setOrders] = useState<Order[]>([]);
  const [pendingOrders, setPendingOrders] = useState<PendingOrder[]>([]);
  const [favorites, setFavorites] = useState<string[]>(['PETR4', 'VALE3', 'ITUB4']);
  const [isLoaded, setIsLoaded] = useState(false);

  useEffect(() => {
    const unsub = onAuthStateChanged(auth, async (u) => {
      setUser(u);
      if (u) {
        await loadUserData(u.uid);
      } else {
        setBalance(INITIAL_BALANCE);
        setPositions([]);
        setOrders([]);
        setPendingOrders([]);
        setFavorites(['PETR4', 'VALE3', 'ITUB4']);
        setIsLoaded(true);
      }
    });
    return () => unsub();
  }, []);

  const loadUserData = async (uid: string) => {
    setIsLoaded(false);
    try {
      const userRef = doc(db, 'users', uid);
      const userSnap = await getDoc(userRef);
      
      if (userSnap.exists()) {
        const data = userSnap.data();
        setBalance(data.balance ?? INITIAL_BALANCE);
        setFavorites(data.favorites ?? ['PETR4', 'VALE3', 'ITUB4']);
      } else {
        await setDoc(userRef, { balance: INITIAL_BALANCE, favorites: ['PETR4', 'VALE3', 'ITUB4'] }, { merge: true });
        setBalance(INITIAL_BALANCE);
      }

      const posSnap = await getDocs(collection(db, 'users', uid, 'positions'));
      const lsPos: Position[] = [];
      posSnap.forEach(d => lsPos.push(d.data() as Position));
      setPositions(lsPos);

      const pendSnap = await getDocs(collection(db, 'users', uid, 'pendingOrders'));
      const lsPend: PendingOrder[] = [];
      pendSnap.forEach(d => lsPend.push({ id: d.id, ...d.data() } as PendingOrder));
      setPendingOrders(lsPend);

      const ordSnap = await getDocs(collection(db, 'users', uid, 'orders'));
      const lsOrd: Order[] = [];
      ordSnap.forEach(d => lsOrd.push(d.data() as Order));
      lsOrd.sort((a, b) => new Date(b.time).getTime() - new Date(a.time).getTime());
      setOrders(lsOrd);

    } catch (err) {
      console.error('Failed to load user data from Firebase', err);
    } finally {
      setIsLoaded(true);
    }
  };

  const buyMarket = async (ticker: string, quantity: number, currentPrice: number, currentTime: string, stopLoss?: number, takeProfit?: number) => {
    console.log(`[buyMarket] Iniciando compra de ${quantity} ${ticker} a R$${currentPrice}`);
    if (!user) {
      console.warn("[buyMarket] Usuário não está logado na sessão do React!");
      return alert("Você precisa estar logado para simular.");
    }
    
    if (currentPrice <= 0) {
      return alert("Preço do ativo inválido. Aguarde a cotação carregar.");
    }

    const totalCost = quantity * currentPrice;
    if (balance < totalCost) {
      alert(`Saldo insuficiente! Custo: R$ ${totalCost.toFixed(2)}, Saldo: R$ ${balance.toFixed(2)}`);
      return;
    }

    const newBalance = balance - totalCost;
    
    let newQuantity = quantity;
    let newAvgPrice = currentPrice;
    const existing = positions.find(p => p.ticker === ticker);
    
    if (existing) {
      newQuantity = existing.quantity + quantity;
      newAvgPrice = ((existing.quantity * existing.averagePrice) + totalCost) / newQuantity;
    }

    try {
      const batch = writeBatch(db);
      
      // 1. Atualizar Saldo
      batch.set(doc(db, 'users', user.uid), { balance: newBalance }, { merge: true });
      
      // 2. Atualizar Posição
      batch.set(doc(db, 'users', user.uid, 'positions', ticker), {
        ticker,
        quantity: newQuantity,
        averagePrice: newAvgPrice
      });
      
      // 3. Registrar Histórico da Ordem
      const orderRef = doc(collection(db, 'users', user.uid, 'orders'));
      const newOrder: Order = { ticker, type: 'BUY', quantity, price: currentPrice, time: currentTime };
      batch.set(orderRef, newOrder);

      // 4. Lógica OCO (Alvos Simultâneos)
      const newPends: PendingOrder[] = [];
      if (stopLoss || takeProfit) {
        const ocoId = 'oco_' + Date.now().toString() + Math.random().toString(36).substring(2, 7);
        
        if (stopLoss && stopLoss > 0) {
          if (stopLoss >= currentPrice) {
             alert("O Stop Loss deve ser MENOR que o preço atual de compra.");
             throw new Error("Invalid Stop Loss");
          }
          const pRef = doc(collection(db, 'users', user.uid, 'pendingOrders'));
          const pObj: PendingOrder = { id: pRef.id, ticker, type: 'SELL_STOP', quantity, targetPrice: stopLoss, time: currentTime, ocoId };
          batch.set(pRef, pObj);
          newPends.push(pObj);
        }
        
        if (takeProfit && takeProfit > 0) {
          if (takeProfit <= currentPrice) {
             alert("O Alvo de Lucro (Gain) deve ser MAIOR que o preço atual de compra.");
             throw new Error("Invalid Take Profit");
          }
          const pRef = doc(collection(db, 'users', user.uid, 'pendingOrders'));
          const pObj: PendingOrder = { id: pRef.id, ticker, type: 'SELL_LIMIT', quantity, targetPrice: takeProfit, time: currentTime, ocoId };
          batch.set(pRef, pObj);
          newPends.push(pObj);
        }
      }

      await batch.commit();

      // Atualiza o estado da tela só se deu certo
      setBalance(newBalance);
      setPositions(prev => {
        if (existing) {
          return prev.map(p => p.ticker === ticker ? { ...p, quantity: newQuantity, averagePrice: newAvgPrice } : p);
        } else {
          return [...prev, { ticker, quantity, averagePrice: currentPrice }];
        }
      });
      setOrders(prev => [newOrder, ...prev]);
      
      if (newPends.length > 0) {
        setPendingOrders(prev => [...prev, ...newPends]);
        alert(`Compra executada e Alvos de Risco (OCO) criados com sucesso!`);
      } else {
        alert(`Compra de ${quantity}x ${ticker} efetuada com sucesso!`);
      }

    } catch (err: any) {
      if (err.message !== "Invalid Stop Loss" && err.message !== "Invalid Take Profit") {
        console.error("Erro na compra", err);
        alert("Falha ao salvar transação no banco de dados.");
      }
    }
  };

  const sellMarket = async (ticker: string, quantity: number, currentPrice: number, currentTime: string) => {
    if (!user) return alert("Você precisa estar logado.");
    if (currentPrice <= 0) return alert("Preço do ativo inválido.");

    const existingPosition = positions.find(p => p.ticker === ticker);
    if (!existingPosition || existingPosition.quantity < quantity) {
      alert(`Você não possui quantidade suficiente de ${ticker} para vender.`);
      return;
    }

    const totalRevenue = quantity * currentPrice;
    const newBalance = balance + totalRevenue;
    const remainingQty = existingPosition.quantity - quantity;

    try {
      const batch = writeBatch(db);
      batch.set(doc(db, 'users', user.uid), { balance: newBalance }, { merge: true });

      if (remainingQty <= 0) {
        batch.delete(doc(db, 'users', user.uid, 'positions', ticker));
      } else {
        batch.set(doc(db, 'users', user.uid, 'positions', ticker), {
          ticker,
          quantity: remainingQty,
          averagePrice: existingPosition.averagePrice // Preço médio não muda na venda
        });
      }

      const orderRef = doc(collection(db, 'users', user.uid, 'orders'));
      const newOrder: Order = { ticker, type: 'SELL', quantity, price: currentPrice, time: currentTime };
      batch.set(orderRef, newOrder);

      await batch.commit();

      setBalance(newBalance);
      setPositions(prev => {
        if (remainingQty <= 0) {
          return prev.filter(pos => pos.ticker !== ticker);
        } else {
          return prev.map(pos => pos.ticker === ticker ? { ...pos, quantity: remainingQty } : pos);
        }
      });
      setOrders(prev => [newOrder, ...prev]);

      alert(`Venda de ${quantity}x ${ticker} efetuada com sucesso!`);
    } catch (err) {
      console.error("Erro na venda", err);
      alert("Falha ao salvar transação no banco.");
    }
  };

  const toggleFavorite = async (ticker: string) => {
    const isFav = favorites.includes(ticker);
    const newFavs = isFav ? favorites.filter(t => t !== ticker) : [...favorites, ticker];
    
    setFavorites(newFavs);

    if (user) {
      try {
        await setDoc(doc(db, 'users', user.uid), { favorites: newFavs }, { merge: true });
      } catch (err) {
        console.error("Falha ao salvar favoritos", err);
      }
    }
  };

  const addPendingOrder = async (order: Omit<PendingOrder, 'id'>) => {
    if (!user) return alert("Logue-se primeiro.");

    if (order.type === 'BUY_LIMIT') {
      const requiredBalance = order.quantity * order.targetPrice;
      if (balance < requiredBalance) {
        alert(`Saldo insuficiente para agendar esta compra. Custo: R$ ${requiredBalance.toFixed(2)}, Saldo: R$ ${balance.toFixed(2)}`);
        return;
      }
    } else if (order.type === 'SELL_LIMIT' || order.type === 'SELL_STOP') {
      const existing = positions.find(p => p.ticker === order.ticker);
      if (!existing || existing.quantity < order.quantity) {
        alert(`Você não possui quantidade suficiente em carteira para agendar essa venda.`);
        return;
      }
    }
    
    try {
      const pendRef = doc(collection(db, 'users', user.uid, 'pendingOrders'));
      const newPend = { ...order, id: pendRef.id };
      await setDoc(pendRef, newPend);
      
      setPendingOrders(prev => [...prev, newPend]);
      alert(`Ordem Pendente de ${order.quantity}x ${order.ticker} a R$ ${order.targetPrice.toFixed(2)} foi registrada no sistema.`);
    } catch (e) {
      console.error(e);
      alert("Erro ao armar ordem pendente.");
    }
  };

  const cancelPendingOrder = async (id: string) => {
    if (!user) return;
    try {
      await deleteDoc(doc(db, 'users', user.uid, 'pendingOrders', id));
      setPendingOrders(prev => prev.filter(po => po.id !== id));
    } catch (e) {
      console.error(e);
    }
  };

  // Motor em Tempo Real que avalia Ordens
  const processPendingOrders = async (ticker: string, livePrice: number, liveTime: string) => {
    if (!user) return;
    
    // Como a checagem ocorre em background, precisamos pegar o valor MAIS RECENTE do React state
    // Para simplificar, confiamos que pendingOrders está atualizado pq rodamos num useEffect vigiando ticker.
    const activePends = pendingOrders.filter(po => po.ticker === ticker);
    if (activePends.length === 0) return;

    for (const po of activePends) {
      let executed = false;
      
      if (po.type === 'BUY_LIMIT' && livePrice <= po.targetPrice) {
        await buyMarket(po.ticker, po.quantity, livePrice, liveTime);
        executed = true;
        setTimeout(() => alert(`⚡ ORDEM EXECUTADA: Compra Automática Limite atingida! ${po.quantity}x ${po.ticker} por R$ ${livePrice.toFixed(2)}`), 0);
      }
      
      if (po.type === 'SELL_LIMIT' && livePrice >= po.targetPrice) {
        // Alvo de Lucro (Gain)
        await sellMarket(po.ticker, po.quantity, livePrice, liveTime);
        executed = true;
        setTimeout(() => alert(`⚡ ORDEM EXECUTADA: Venda de Lucro (Take Profit) atingida! ${po.quantity}x ${po.ticker} por R$ ${livePrice.toFixed(2)}`), 0);
      }

      if (po.type === 'SELL_STOP' && livePrice <= po.targetPrice) {
        // Alvo de Risco (Stop Loss)
        await sellMarket(po.ticker, po.quantity, livePrice, liveTime);
        executed = true;
        setTimeout(() => alert(`⚡ Risco Cortado: Stop Loss acionado preventivamente vendendo ${po.quantity}x ${po.ticker} por R$ ${livePrice.toFixed(2)}`), 0);
      }

      if (executed) {
        // Encerra a ordem que executou
        await cancelPendingOrder(po.id);
        
        // Verifica Gêmea OCO (Cancelamento Mútuo)
        if (po.ocoId) {
          const sister = pendingOrders.find(o => o.ocoId === po.ocoId && o.id !== po.id);
          if (sister) {
             await cancelPendingOrder(sister.id);
             setTimeout(() => alert(`Ordem OCO Desarmada: O outro alvo vinculado foi cancelado da fila.`), 0);
          }
        }
      }
    }
  };

  const resetPortfolio = async () => {
    if (!user) return alert("Logue-se primeiro.");
    if (confirm("Tem certeza que deseja zerar seu simulador e voltar aos R$ 100.000 iniciais? Todo o histórico de ordens também será apagado da nuvem.")) {
      try {
        const batch = writeBatch(db);
        batch.set(doc(db, 'users', user.uid), { balance: INITIAL_BALANCE }, { merge: true });
        
        positions.forEach(p => batch.delete(doc(db, 'users', user.uid, 'positions', p.ticker)));
        pendingOrders.forEach(p => batch.delete(doc(db, 'users', user.uid, 'pendingOrders', p.id)));
        
        const ordSnap = await getDocs(collection(db, 'users', user.uid, 'orders'));
        ordSnap.forEach(d => batch.delete(d.ref));

        await batch.commit();

        setBalance(INITIAL_BALANCE);
        setPositions([]);
        setOrders([]);
        setPendingOrders([]);
        alert("Simulador completamente resetado na nuvem.");
      } catch (e) {
        console.error(e);
        alert("Falha ao resetar na nuvem.");
      }
    }
  };

  return (
    <PortfolioContext.Provider value={{ 
      balance, 
      positions, 
      orders, 
      pendingOrders, 
      favorites,
      isLoaded,
      buyMarket, 
      sellMarket, 
      addPendingOrder, 
      cancelPendingOrder, 
      processPendingOrders, 
      toggleFavorite,
      resetPortfolio 
    }}>
      {children}
    </PortfolioContext.Provider>
  );
};

export const usePortfolio = () => {
  const context = useContext(PortfolioContext);
  if (context === undefined) {
    throw new Error('usePortfolio must be used within a PortfolioProvider');
  }
  return context;
};
