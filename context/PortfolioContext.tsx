import React, { createContext, useContext, useState, useEffect } from 'react';

// Interfaces for our Portfolio state
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
  time: string; // The Unix timestamp or ISO string at the time of the chart data
}

export interface PendingOrder {
  id: string;
  ticker: string;
  type: 'BUY_LIMIT' | 'SELL_LIMIT';
  quantity: number;
  targetPrice: number;
  time: string; // The Unix timestamp/ISO at the time it was ordered
}

interface PortfolioContextProps {
  balance: number;
  positions: Position[];
  orders: Order[];
  pendingOrders: PendingOrder[];
  favorites: string[];
  buyMarket: (ticker: string, quantity: number, currentPrice: number, currentTime: string) => void;
  sellMarket: (ticker: string, quantity: number, currentPrice: number, currentTime: string) => void;
  addPendingOrder: (order: Omit<PendingOrder, 'id'>) => void;
  cancelPendingOrder: (id: string) => void;
  processPendingOrders: (ticker: string, livePrice: number, liveTime: string) => void;
  toggleFavorite: (ticker: string) => void;
  resetPortfolio: () => void;
}

const PortfolioContext = createContext<PortfolioContextProps | undefined>(undefined);

export const PortfolioProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const INITIAL_BALANCE = 100000;
  
  const [balance, setBalance] = useState<number>(INITIAL_BALANCE);
  const [positions, setPositions] = useState<Position[]>([]);
  const [orders, setOrders] = useState<Order[]>([]);
  const [pendingOrders, setPendingOrders] = useState<PendingOrder[]>([]);
  const [favorites, setFavorites] = useState<string[]>(['PETR4', 'VALE3', 'ITUB4']);
  const [isLoaded, setIsLoaded] = useState(false);

  // Load from LocalStorage if testing local state persistence (optional)
  useEffect(() => {
    const saved = localStorage.getItem('@b3trade:simulator_portfolio');
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        setBalance(parsed.balance ?? INITIAL_BALANCE);
        setPositions(parsed.positions ?? []);
        setOrders(parsed.orders ?? []);
        setPendingOrders(parsed.pendingOrders ?? []);
        setFavorites(parsed.favorites ?? ['PETR4', 'VALE3', 'ITUB4']);
      } catch (err) {
        console.error('Failed to parse saved portfolio', err);
      }
    }
    setIsLoaded(true);
  }, []);

  // Save to local storage on change
  useEffect(() => {
    if (isLoaded) {
      localStorage.setItem('@b3trade:simulator_portfolio', JSON.stringify({ balance, positions, orders, pendingOrders, favorites }));
    }
  }, [balance, positions, orders, pendingOrders, favorites, isLoaded]);

  const buyMarket = (ticker: string, quantity: number, currentPrice: number, currentTime: string) => {
    const totalCost = quantity * currentPrice;
    
    if (balance < totalCost) {
      alert(`Saldo insuficiente! Custo: R$ ${totalCost.toFixed(2)}, Saldo: R$ ${balance.toFixed(2)}`);
      return;
    }

    setBalance(prev => prev - totalCost);

    setPositions(prev => {
      const existing = prev.find(p => p.ticker === ticker);
      if (existing) {
        const newQuantity = existing.quantity + quantity;
        const newAvgPrice = ((existing.quantity * existing.averagePrice) + totalCost) / newQuantity;
        return prev.map(p => p.ticker === ticker ? { ...p, quantity: newQuantity, averagePrice: newAvgPrice } : p);
      } else {
        return [...prev, { ticker, quantity, averagePrice: currentPrice }];
      }
    });

    setOrders(prev => [...prev, { ticker, type: 'BUY', quantity, price: currentPrice, time: currentTime }]);

    alert(`Compra de ${quantity}x ${ticker} efetuada com sucesso!`);
  };

  const sellMarket = (ticker: string, quantity: number, currentPrice: number, currentTime: string) => {
    const existingPosition = positions.find(p => p.ticker === ticker);
    
    if (!existingPosition || existingPosition.quantity < quantity) {
      alert(`Você não possui quantidade suficiente de ${ticker} para vender.`);
      return;
    }

    const totalRevenue = quantity * currentPrice;
    setBalance(prev => prev + totalRevenue);

    setPositions(prev => {
      const p = prev.find(pos => pos.ticker === ticker)!;
      if (p.quantity === quantity) {
        // Sold everything, remove position
        return prev.filter(pos => pos.ticker !== ticker);
      } else {
        // Partial sell, average price stays the same mathematically for remaining holding
        return prev.map(pos => pos.ticker === ticker ? { ...pos, quantity: pos.quantity - quantity } : pos);
      }
    });
    
    setOrders(prev => [...prev, { ticker, type: 'SELL', quantity, price: currentPrice, time: currentTime }]);

    alert(`Venda de ${quantity}x ${ticker} efetuada com sucesso!`);
  };

  const resetPortfolio = () => {
    if (confirm("Tem certeza que deseja zerar seu simulador e voltar aos R$ 100.000 iniciais?")) {
      setBalance(INITIAL_BALANCE);
      setPositions([]);
      setOrders([]);
      setPendingOrders([]);
      // we keep favorites
    }
  };

  const toggleFavorite = (ticker: string) => {
    setFavorites(prev => 
      prev.includes(ticker) 
        ? prev.filter(t => t !== ticker) 
        : [...prev, ticker]
    );
  };

  const addPendingOrder = (order: Omit<PendingOrder, 'id'>) => {
    if (order.type === 'BUY_LIMIT') {
      const requiredBalance = order.quantity * order.targetPrice;
      if (balance < requiredBalance) {
        alert(`Saldo insuficiente para agendar esta compra. Custo: R$ ${requiredBalance.toFixed(2)}, Saldo: R$ ${balance.toFixed(2)}`);
        return;
      }
    } else if (order.type === 'SELL_LIMIT') {
      const existing = positions.find(p => p.ticker === order.ticker);
      if (!existing || existing.quantity < order.quantity) {
        alert(`Você não possui quantidade suficiente em carteira para agendar essa venda.`);
        return;
      }
    }
    
    const id = Date.now().toString() + Math.floor(Math.random() * 1000).toString();
    setPendingOrders(prev => [...prev, { ...order, id }]);
    alert(`Ordem Pendente ${order.type === 'BUY_LIMIT' ? 'COMPRA' : 'VENDA'} de ${order.quantity}x ${order.ticker} a R$ ${order.targetPrice.toFixed(2)} foi registrada no sistema.`);
  };

  const cancelPendingOrder = (id: string) => {
    setPendingOrders(prev => prev.filter(po => po.id !== id));
  };

  const processPendingOrders = (ticker: string, livePrice: number, liveTime: string) => {
    // Process matching active orders securely one-by-one to respect strict state loops
    setPendingOrders(prev => {
      let executedIds: string[] = [];
      
      prev.filter(po => po.ticker === ticker).forEach(po => {
        let shouldExecute = false;
        
        // Buy if current price falls to or below limit
        if (po.type === 'BUY_LIMIT' && livePrice <= po.targetPrice) {
          buyMarket(po.ticker, po.quantity, livePrice, liveTime); // Or targetPrice, but slippage mimics reality
          shouldExecute = true;
          // Notify the UI using setTimeout to respect alert threading
          setTimeout(() => alert(`⚡ ORDEM EXECUTADA: Compra Automática Limite atingida! ${po.quantity}x ${po.ticker} por R$ ${livePrice.toFixed(2)}`), 0);
        }
        
        // Sell if current price rises to or above target (Take profit)
        if (po.type === 'SELL_LIMIT' && livePrice >= po.targetPrice) {
          sellMarket(po.ticker, po.quantity, livePrice, liveTime);
          shouldExecute = true;
          setTimeout(() => alert(`⚡ ORDEM EXECUTADA: Venda Automática Limite atingida! ${po.quantity}x ${po.ticker} por R$ ${livePrice.toFixed(2)}`), 0);
        }

        if (shouldExecute) executedIds.push(po.id);
      });

      return prev.filter(p => !executedIds.includes(p.id));
    });
  };

  return (
    <PortfolioContext.Provider value={{ 
      balance, 
      positions, 
      orders, 
      pendingOrders, 
      favorites,
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
