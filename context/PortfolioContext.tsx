import React, { createContext, useContext, useState, useEffect } from 'react';
import { db, auth } from '../lib/firebase';
import { doc, getDoc, setDoc, collection, getDocs, writeBatch, deleteDoc, increment } from 'firebase/firestore';
import { onAuthStateChanged, User } from 'firebase/auth';
import { useToast } from './ToastContext';
import { Achievement, ALL_ACHIEVEMENTS } from '../lib/achievements';

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
  nickname: string;
  isLoaded: boolean;
  buyMarket: (ticker: string, quantity: number, currentPrice: number, currentTime: string, stopLoss?: number, takeProfit?: number) => Promise<void>;
  sellMarket: (ticker: string, quantity: number, currentPrice: number, currentTime: string) => Promise<void>;
  addPendingOrder: (order: Omit<PendingOrder, 'id'>) => Promise<void>;
  cancelPendingOrder: (id: string) => Promise<void>;
  processPendingOrders: (ticker: string, livePrice: number, liveTime: string) => Promise<void>;
  toggleFavorite: (ticker: string) => Promise<void>;
  resetPortfolio: () => Promise<void>;
  updateNickname: (newNickname: string) => Promise<void>;
  achievements: Achievement[];
  totalOrders: number;
}

const PortfolioContext = createContext<PortfolioContextProps | undefined>(undefined);

export const getRankingIds = () => {
  const d = new Date();
  const startDate = new Date(d.getFullYear(), 0, 1);
  const days = Math.floor((d.getTime() - startDate.getTime()) / (24 * 60 * 60 * 1000));
  const weekNumber = Math.ceil((days + startDate.getDay() + 1) / 7);
  const weekId = `${d.getFullYear()}-W${weekNumber.toString().padStart(2, '0')}`;
  const monthId = `${d.getFullYear()}-${(d.getMonth() + 1).toString().padStart(2, '0')}`;
  const yearId = `${d.getFullYear()}`;
  return { weekId, monthId, yearId };
};

export const PortfolioProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const INITIAL_BALANCE = 100000;
  
  const [user, setUser] = useState<User | null>(null);
  const [balance, setBalance] = useState<number>(INITIAL_BALANCE);
  const [positions, setPositions] = useState<Position[]>([]);
  const [orders, setOrders] = useState<Order[]>([]);
  const [pendingOrders, setPendingOrders] = useState<PendingOrder[]>([]);
  const [favorites, setFavorites] = useState<string[]>(['PETR4', 'VALE3', 'ITUB4']);
  const [nickname, setNickname] = useState<string>('');
  const [achievements, setAchievements] = useState<Achievement[]>([]);
  const [totalOrders, setTotalOrders] = useState<number>(0);
  const [isLoaded, setIsLoaded] = useState(false);

  const { addToast } = useToast();

  useEffect(() => {
    const unsub = onAuthStateChanged(auth, async (u) => {
      setUser(u);
      if (u) {
        await loadUserData(u);
      } else {
        setBalance(INITIAL_BALANCE);
        setPositions([]);
        setOrders([]);
        setPendingOrders([]);
        
        let savedFavs = ['PETR4', 'VALE3', 'ITUB4'];
        try {
          const local = localStorage.getItem('favorites');
          if (local) savedFavs = JSON.parse(local);
        } catch(e) {}
        setFavorites(savedFavs);
        
        setIsLoaded(true);
      }
    });
    return () => unsub();
  }, []);

  const loadUserData = async (u: User) => {
    setIsLoaded(false);
    try {
      const userRef = doc(db, 'users', u.uid);
      const userSnap = await getDoc(userRef);
      
      const updateData: any = {
         displayName: u.displayName || 'Trader Anônimo',
         photoURL: u.photoURL || ''
      };

      if (userSnap.exists()) {
        const data = userSnap.data();
        setBalance(data.balance ?? INITIAL_BALANCE);
        setFavorites(data.favorites ?? ['PETR4', 'VALE3', 'ITUB4']);
        setNickname(data.nickname || '');
        setAchievements(data.achievements || []);
        
        let ordersCount = data.totalOrders;
        if (ordersCount === undefined) {
          // Sincronização inicial para usuários antigos
          const ordersSnap = await getDocs(collection(db, 'users', u.uid, 'orders'));
          ordersCount = ordersSnap.size;
          updateData.totalOrders = ordersCount;
        }
        setTotalOrders(ordersCount);

        await setDoc(userRef, updateData, { merge: true });
      } else {
        const initialData = { 
          balance: INITIAL_BALANCE, 
          favorites: ['PETR4', 'VALE3', 'ITUB4'], 
          totalOrders: 0,
          ...updateData 
        };
        await setDoc(userRef, initialData, { merge: true });
        setBalance(INITIAL_BALANCE);
        setTotalOrders(0);
      }

      const posSnap = await getDocs(collection(db, 'users', u.uid, 'positions'));
      const lsPos: Position[] = [];
      posSnap.forEach(d => lsPos.push(d.data() as Position));
      setPositions(lsPos);

      const pendSnap = await getDocs(collection(db, 'users', u.uid, 'pendingOrders'));
      const lsPend: PendingOrder[] = [];
      pendSnap.forEach(d => lsPend.push({ id: d.id, ...d.data() } as PendingOrder));
      setPendingOrders(lsPend);

      const ordSnap = await getDocs(collection(db, 'users', u.uid, 'orders'));
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
      return addToast("Você precisa estar logado para simular.", "error");
    }
    
    if (currentPrice <= 0) {
      return addToast("Preço do ativo inválido. Aguarde a cotação carregar.", "error");
    }

    if (quantity <= 0 || !Number.isInteger(quantity)) {
      return addToast("A quantidade de ações deve ser um número inteiro e maior que zero.", "error");
    }

    const totalCost = quantity * currentPrice;
    if (balance < totalCost) {
      return addToast(`Saldo insuficiente! Custo: R$ ${totalCost.toFixed(2)}, Saldo: R$ ${balance.toFixed(2)}`, "error");
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
      const executionTime = new Date().toISOString();
      const newOrder: Order = { ticker, type: 'BUY', quantity, price: currentPrice, time: executionTime };
      batch.set(orderRef, newOrder);

      // Incrementa o contador de ordens público no documento do usuário
      batch.update(doc(db, 'users', user.uid), { totalOrders: increment(1) });

      // 4. Lógica OCO (Alvos Simultâneos)
      const newPends: PendingOrder[] = [];
      if (stopLoss || takeProfit) {
        const ocoId = 'oco_' + Date.now().toString() + Math.random().toString(36).substring(2, 7);
        
        if (stopLoss && stopLoss > 0) {
          if (stopLoss >= currentPrice) {
             addToast("O Stop Loss deve ser MENOR que o preço atual de compra.", "error");
             throw new Error("Invalid Stop Loss");
          }
          const pRef = doc(collection(db, 'users', user.uid, 'pendingOrders'));
          const pObj: PendingOrder = { id: pRef.id, ticker, type: 'SELL_STOP', quantity, targetPrice: stopLoss, time: executionTime, ocoId };
          batch.set(pRef, pObj);
          newPends.push(pObj);
        }
        
        if (takeProfit && takeProfit > 0) {
          if (takeProfit <= currentPrice) {
             addToast("O Alvo de Lucro (Gain) deve ser MAIOR que o preço atual de compra.", "error");
             throw new Error("Invalid Take Profit");
          }
          const pRef = doc(collection(db, 'users', user.uid, 'pendingOrders'));
          const pObj: PendingOrder = { id: pRef.id, ticker, type: 'SELL_LIMIT', quantity, targetPrice: takeProfit, time: executionTime, ocoId };
          batch.set(pRef, pObj);
          newPends.push(pObj);
        }
      }

      await batch.commit();

      // Atualiza o estado da tela só se deu certo
      setBalance(newBalance);
      setTotalOrders(prev => prev + 1);
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
        addToast(`Compra executada e Alvos de Risco (OCO) criados com sucesso!`, "success");
      } else {
        addToast(`Compra de ${quantity}x ${ticker} efetuada com sucesso!`, "success");
      }

    } catch (err: any) {
      if (err.message !== "Invalid Stop Loss" && err.message !== "Invalid Take Profit") {
        console.error("Erro na compra", err);
        addToast("Falha ao salvar transação no banco de dados.", "error");
      }
    }
  };

  const sellMarket = async (ticker: string, quantity: number, currentPrice: number, currentTime: string) => {
    if (!user) return addToast("Você precisa estar logado.", "error");
    if (currentPrice <= 0) return addToast("Preço do ativo inválido.", "error");
    if (quantity <= 0 || !Number.isInteger(quantity)) return addToast("A quantidade a ser vendida deve ser maior que zero.", "error");

    const existingPosition = positions.find(p => p.ticker === ticker);
    if (!existingPosition || existingPosition.quantity < quantity) {
      return addToast(`Você não possui quantidade suficiente de ${ticker} para vender.`, "error");
    }

    const totalRevenue = quantity * currentPrice;
    const newBalance = balance + totalRevenue;
    const remainingQty = existingPosition.quantity - quantity;
    const tradeProfit = (currentPrice - existingPosition.averagePrice) * quantity;

    try {
      const userRef = doc(db, 'users', user.uid);
      const userSnap = await getDoc(userRef);
      const userData = userSnap.data() || {};
      const rankings = userData.rankings || {};
      const { weekId, monthId, yearId } = getRankingIds();

      const newRankings = {
        weekId,
        weeklyPnl: rankings.weekId === weekId ? (rankings.weeklyPnl || 0) + tradeProfit : tradeProfit,
        monthId,
        monthlyPnl: rankings.monthId === monthId ? (rankings.monthlyPnl || 0) + tradeProfit : tradeProfit,
        yearId,
        yearlyPnl: rankings.yearId === yearId ? (rankings.yearlyPnl || 0) + tradeProfit : tradeProfit,
      };

      const batch = writeBatch(db);
      batch.set(userRef, { balance: newBalance, rankings: newRankings }, { merge: true });

      if (remainingQty <= 0) {
        batch.delete(doc(db, 'users', user.uid, 'positions', ticker));
      } else {
        batch.set(doc(db, 'users', user.uid, 'positions', ticker), {
          ticker,
          quantity: remainingQty,
          averagePrice: existingPosition.averagePrice
        });
      }

      const orderRef = doc(collection(db, 'users', user.uid, 'orders'));
      const executionTime = new Date().toISOString();
      const newOrder: Order = { ticker, type: 'SELL', quantity, price: currentPrice, time: executionTime };
      batch.set(orderRef, newOrder);

      // Incrementa o contador de ordens público no documento do usuário
      batch.update(doc(db, 'users', user.uid), { totalOrders: increment(1) });

      await batch.commit();

      setBalance(newBalance);
      setTotalOrders(prev => prev + 1);
      setPositions(prev => {
        if (remainingQty <= 0) {
          return prev.filter(pos => pos.ticker !== ticker);
        } else {
          return prev.map(pos => pos.ticker === ticker ? { ...pos, quantity: remainingQty } : pos);
        }
      });
      setOrders(prev => [newOrder, ...prev]);


      const updatedPositions = remainingQty <= 0
        ? positions.filter(pos => pos.ticker !== ticker)
        : positions.map(pos => pos.ticker === ticker ? { ...pos, quantity: remainingQty } : pos);
      
      addToast(`Venda de ${quantity}x ${ticker} efetuada com sucesso!`, "success");
      await checkAchievements([...orders, newOrder], updatedPositions, newBalance, tradeProfit);
    } catch (err) {
      console.error("Erro na venda", err);
      addToast("Falha ao salvar transação no banco.", "error");
    }
  };

  const toggleFavorite = async (ticker: string) => {
    const isFav = favorites.includes(ticker);
    const newFavs = isFav ? favorites.filter(t => t !== ticker) : [...favorites, ticker];
    
    setFavorites(newFavs);

    if (user) {
      try {
        await setDoc(doc(db, 'users', user.uid), { favorites: newFavs }, { merge: true });
        addToast(isFav ? `${ticker} removido dos favoritos.` : `${ticker} adicionado aos favoritos.`, "info");
      } catch (err) {
        console.error("Falha ao salvar favoritos", err);
      }
    } else {
      try {
        localStorage.setItem('favorites', JSON.stringify(newFavs));
        addToast(isFav ? `${ticker} removido dos favoritos.` : `${ticker} adicionado aos favoritos.`, "info");
      } catch(e) {}
    }
  };

  const addPendingOrder = async (order: Omit<PendingOrder, 'id'>) => {
    if (!user) return addToast("Logue-se primeiro.", "error");
    if (order.quantity <= 0 || !Number.isInteger(order.quantity)) {
        return addToast("A quantidade da ordem agendada deve ser inteira e maior que zero.", "error");
    }

    if (order.type === 'BUY_LIMIT') {
      const requiredBalance = order.quantity * order.targetPrice;
      if (balance < requiredBalance) {
        return addToast(`Saldo insuficiente! Custo: R$ ${requiredBalance.toFixed(2)}, Caixa Livre: R$ ${balance.toFixed(2)}`, "error");
      }
    } else if (order.type === 'SELL_LIMIT' || order.type === 'SELL_STOP') {
      const existing = positions.find(p => p.ticker === order.ticker);
      if (!existing || existing.quantity < order.quantity) {
        return addToast(`Você não possui quantidade suficiente em carteira para agendar essa operação.`, "error");
      }
    }
    
    try {
      const pendRef = doc(collection(db, 'users', user.uid, 'pendingOrders'));
      const newPend = { ...order, id: pendRef.id };
      await setDoc(pendRef, newPend);
      
      setPendingOrders(prev => [...prev, newPend]);
      addToast(`Ordem de ${order.quantity}x ${order.ticker} a R$ ${order.targetPrice.toFixed(2)} agendada com sucesso.`, "success");
    } catch (e) {
      console.error(e);
      addToast("Erro ao armar ordem pendente.", "error");
    }
  };

  const cancelPendingOrder = async (id: string, silent = false) => {
    if (!user) return;
    try {
      await deleteDoc(doc(db, 'users', user.uid, 'pendingOrders', id));
      setPendingOrders(prev => prev.filter(po => po.id !== id));
      if (!silent) addToast("Ordem cancelada.", "info");
    } catch (e) {
      console.error(e);
    }
  };

  const processPendingOrders = async (ticker: string, livePrice: number, liveTime: string) => {
    if (!user) return;
    
    const activePends = pendingOrders.filter(po => po.ticker === ticker);
    if (activePends.length === 0) return;

    for (const po of activePends) {
      let executed = false;
      
      if (po.type === 'BUY_LIMIT' && livePrice <= po.targetPrice) {
        await buyMarket(po.ticker, po.quantity, livePrice, liveTime);
        executed = true;
        setTimeout(() => addToast(`⚡ Compra Automática Limite atingida! ${po.quantity}x ${po.ticker} por R$ ${livePrice.toFixed(2)}`, "success"), 0);
      }
      
      if (po.type === 'SELL_LIMIT' && livePrice >= po.targetPrice) {
        await sellMarket(po.ticker, po.quantity, livePrice, liveTime);
        executed = true;
        setTimeout(() => addToast(`⚡ Lucro (Take Profit) atingido! ${po.quantity}x ${po.ticker} vendidos por R$ ${livePrice.toFixed(2)}`, "success"), 0);
      }

      if (po.type === 'SELL_STOP' && livePrice <= po.targetPrice) {
        await sellMarket(po.ticker, po.quantity, livePrice, liveTime);
        executed = true;
        setTimeout(() => addToast(`⚡ Risco Cortado: Stop Loss acionado vendendo ${po.quantity}x ${po.ticker} por R$ ${livePrice.toFixed(2)}`, "error"), 0);
      }

      if (executed) {
        await cancelPendingOrder(po.id, true);
        
        if (po.ocoId) {
          const sister = pendingOrders.find(o => o.ocoId === po.ocoId && o.id !== po.id);
          if (sister) {
             await cancelPendingOrder(sister.id, true);
             setTimeout(() => addToast(`Ordem OCO: O alvo oposto de ${sister.ticker} foi cancelado.`, "info"), 0);
          }
        }
      }
    }
  };

  const resetPortfolio = async () => {
    if (!user) return addToast("Logue-se primeiro.", "error");
    // Aviso crítico: a exclusão agora é silenciosa aqui porque a confirmação (Checkbox + Modal) 
    // será feita na própria UI antes de invocar este botão!
    
    try {
      const { weekId, monthId, yearId } = getRankingIds();
      // O reset zera completamente a contagem de sucesso no ranking (Auto-punição por falência)
      const emptyRankings = { weekId, weeklyPnl: 0, monthId, monthlyPnl: 0, yearId, yearlyPnl: 0 };

      const batch = writeBatch(db);
      batch.set(doc(db, 'users', user.uid), { balance: INITIAL_BALANCE, rankings: emptyRankings }, { merge: true });
      
      positions.forEach(p => batch.delete(doc(db, 'users', user.uid, 'positions', p.ticker)));
      pendingOrders.forEach(p => batch.delete(doc(db, 'users', user.uid, 'pendingOrders', p.id)));
      
      const ordSnap = await getDocs(collection(db, 'users', user.uid, 'orders'));
      ordSnap.forEach(d => batch.delete(d.ref));

      await batch.commit();

      setBalance(INITIAL_BALANCE);
      setPositions([]);
      setOrders([]);
      setPendingOrders([]);
      addToast("Seus dados foram purgados. Simulador resetado aos R$ 100.000 iniciais.", "success");
    } catch (e) {
      console.error(e);
      addToast("Falha ao resetar na nuvem.", "error");
    }
  };

  const updateNickname = async (newNickname: string) => {
    if (!user) return addToast('Logue-se primeiro.', 'error');
    const trimmed = newNickname.trim();
    if (trimmed.length < 3) return addToast('O nickname deve ter pelo menos 3 caracteres.', 'error');
    if (trimmed.length > 20) return addToast('O nickname deve ter no máximo 20 caracteres.', 'error');
    try {
      await setDoc(doc(db, 'users', user.uid), { nickname: trimmed }, { merge: true });
      setNickname(trimmed);
      addToast('Nickname atualizado com sucesso! 🎉', 'success');
    } catch (e) {
      console.error(e);
      addToast('Falha ao salvar nickname.', 'error');
    }
  };

  const checkAchievements = async (newOrders: Order[], newPositions: Position[], newBalance: number, tradeProfit: number) => {
    if (!user) return;
    const earned = [...achievements];
    const hasId = (id: string) => earned.some(a => a.id === id);
    const newlyEarned: Achievement[] = [];

    const grant = (id: string) => {
      const def = ALL_ACHIEVEMENTS.find(a => a.id === id);
      if (def && !hasId(id)) {
        const badge: Achievement = { ...def, unlockedAt: new Date().toISOString() };
        earned.push(badge);
        newlyEarned.push(badge);
      }
    };

    const totalTrades = newOrders.length;
    if (tradeProfit > 0) grant('first_profit');
    if (tradeProfit < 0) grant('first_loss');
    if (totalTrades >= 10) grant('ten_trades');
    if (tradeProfit >= 5000) grant('big_win');
    
    // Streak de 3 lucros consecutivos
    const sells = newOrders.filter(o => o.type === 'SELL').slice(0, 5);
    // Simple check: last 3 sells were all profit (we store price, not profit individually, so we approximate)
    // This is a best-effort check based on order count
    if (sells.length >= 3) grant('profit_streak_3');

    // Patrimônio total > R$ 1.000.000
    const totalPositionValue = newPositions.reduce((sum, p) => sum + (p.quantity * p.averagePrice), 0);
    if ((newBalance + totalPositionValue) > 1000000) grant('portfolio_1m');

    if (newlyEarned.length > 0) {
      setAchievements(earned);
      try {
        await setDoc(doc(db, 'users', user.uid), { achievements: earned }, { merge: true });
        newlyEarned.forEach(badge => {
          setTimeout(() => addToast(`🏅 Nova Conquista: ${badge.icon} ${badge.title}!`, 'success'), 500);
        });
      } catch (e) { console.error('Failed to save achievements', e); }
    }
  };

  return (
    <PortfolioContext.Provider value={{ 
      balance, 
      positions, 
      orders, 
      pendingOrders, 
      favorites,
      nickname,
      achievements,
      totalOrders,
      isLoaded,
      buyMarket, 
      sellMarket, 
      addPendingOrder, 
      cancelPendingOrder, 
      processPendingOrders, 
      toggleFavorite,
      resetPortfolio,
      updateNickname,
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
