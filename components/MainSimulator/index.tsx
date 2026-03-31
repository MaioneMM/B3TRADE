import React, { useEffect, useRef, useState } from 'react';
import { createChart, ColorType, IChartApi, ISeriesApi } from 'lightweight-charts';
import { Container, TopBar, SimulatorGrid, ChartContainer, BoletaContainer, ListContainer } from './styles';
import axios from 'axios';
import { usePortfolio } from '../../context/PortfolioContext';

const MainSimulator = () => {
  const chartContainerRef = useRef<HTMLDivElement>(null);
  const chartRef = useRef<IChartApi | null>(null);
  const seriesRef = useRef<ISeriesApi<"Candlestick"> | null>(null);
  const volumeSeriesRef = useRef<ISeriesApi<"Histogram"> | null>(null);
  const sma9Ref = useRef<ISeriesApi<"Line"> | null>(null);
  const sma21Ref = useRef<ISeriesApi<"Line"> | null>(null);
  
  const lastCandleTimeRef = useRef<number | null>(null);
  const lastCandleDataRef = useRef<{time: any, open: number, high: number, low: number, close: number} | null>(null);

  const [showVolume, setShowVolume] = useState(true);
  const [showSma9, setShowSma9] = useState(false);
  const [showSma21, setShowSma21] = useState(false);
  
  const { balance, positions, pendingOrders, favorites, buyMarket, sellMarket, addPendingOrder, cancelPendingOrder, processPendingOrders, toggleFavorite } = usePortfolio();

  const [ticker, setTicker] = useState('PETR4');
  const [loading, setLoading] = useState(false);
  const [currentPrice, setCurrentPrice] = useState(0);
  const [currentTime, setCurrentTime] = useState<string>('');
  
  const [marketData, setMarketData] = useState({ open: 0, high: 0, low: 0, prevClose: 0, changePercent: 0 });

  // Form states
  const [boletaSide, setBoletaSide] = useState<'BUY' | 'SELL'>('BUY');
  const [orderType, setOrderType] = useState<'MARKET' | 'LIMIT'>('MARKET');
  const [orderQty, setOrderQty] = useState<number | ''>(100);
  const [targetPrice, setTargetPrice] = useState<number>(0);
  const [stopLoss, setStopLoss] = useState<number | ''>('');
  const [takeProfit, setTakeProfit] = useState<number | ''>('');
  
  const [listTab, setListTab] = useState<'ORDERS' | 'POSITIONS'>('ORDERS');
  const [showHelp, setShowHelp] = useState(false);
  const [marketStatus, setMarketStatus] = useState<'ABERTO' | 'FECHANDO' | 'FECHADO'>('ABERTO');
  const [clockTime, setClockTime] = useState<string>('');

  type CandleInterval = { label: string; interval: string; defaultRange: string; supportsTime: boolean };
  const INTERVALS: CandleInterval[] = [
    { label: '5m',  interval: '5m',  defaultRange: '5d',  supportsTime: true  },
    { label: '15m', interval: '15m', defaultRange: '5d',  supportsTime: true  },
    { label: '30m', interval: '30m', defaultRange: '5d',  supportsTime: true  },
    { label: '1H', interval: '1h',  defaultRange: '1mo', supportsTime: true  },
    { label: '1D', interval: '1d',  defaultRange: '1y',  supportsTime: false },
    { label: '1W', interval: '1wk', defaultRange: '5y',  supportsTime: false },
    { label: '1M', interval: '1mo', defaultRange: 'max', supportsTime: false },
  ];
  const [activeInterval, setActiveInterval] = useState<CandleInterval>(INTERVALS[4]);

  type HistoryRange = { label: string; range: string };
  const getRangesForInterval = (iv: CandleInterval): HistoryRange[] => {
    if (['5m','15m','30m'].includes(iv.interval)) return [{ label: '1D', range: '1d' }, { label: '5D', range: '5d' }];
    if (iv.interval === '1h') return [{ label: '5D', range: '5d' }, { label: '1M', range: '1mo' }];
    if (iv.interval === '1d') return [{ label: '1M', range: '1mo' }, { label: '6M', range: '6mo' }, { label: '1A', range: '1y' }, { label: '5A', range: '5y' }];
    if (iv.interval === '1wk') return [{ label: '1A', range: '1y' }, { label: '5A', range: '5y' }, { label: 'Máx', range: 'max' }];
    return [{ label: '5A', range: '5y' }, { label: 'Máx', range: 'max' }];
  };
  const [activeRange, setActiveRange] = useState<HistoryRange>({ label: '1A', range: '1y' });

  const handleIntervalChange = (iv: CandleInterval) => {
    setActiveInterval(iv);
    const ranges = getRangesForInterval(iv);
    const defaultR = ranges.find(r => r.range === iv.defaultRange) || ranges[ranges.length - 1];
    setActiveRange(defaultR);
  };

  const [searchTerm, setSearchTerm] = useState('');
  const [searchResults, setSearchResults] = useState<string[]>([]);
  const [allStocks, setAllStocks] = useState<string[]>([]);

  useEffect(() => {
    const fetchAll = async () => {
      try {
        const res = await axios.get('https://brapi.dev/api/available');
        setAllStocks(res.data.stocks || []);
      } catch (err) { console.error(err); }
    };
    fetchAll();
  }, []);

  useEffect(() => {
    if (searchTerm.trim().length === 0) { setSearchResults([]); return; }
    const filtered = allStocks.filter(s => s.includes(searchTerm.toUpperCase()));
    setSearchResults(filtered);
  }, [searchTerm, allStocks]);

  useEffect(() => {
    if (!chartContainerRef.current) return;
    const isDark = window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches;
    const backgroundColor = isDark ? '#1a1a1e' : '#ffffff';
    const textColor = isDark ? '#d1d4dc' : '#333333';

    const chart = createChart(chartContainerRef.current, {
      layout: { background: { type: ColorType.Solid, color: backgroundColor }, textColor },
      width: chartContainerRef.current.clientWidth,
      height: chartContainerRef.current.clientHeight,
      grid: { vertLines: { color: isDark ? '#2B2B43' : '#e1e3eb' }, horzLines: { color: isDark ? '#2B2B43' : '#e1e3eb' } },
      timeScale: { timeVisible: true, secondsVisible: false },
    });
    
    chartRef.current = chart;
    const candlestickSeries = chart.addCandlestickSeries({ upColor: '#26a69a', downColor: '#ef5350', borderVisible: false, wickUpColor: '#26a69a', wickDownColor: '#ef5350' });
    seriesRef.current = candlestickSeries;

    const volSeries = chart.addHistogramSeries({ color: '#26a69a', priceFormat: { type: 'volume' }, priceScaleId: 'volume' });
    volSeries.priceScale().applyOptions({ scaleMargins: { top: 0.8, bottom: 0 } });
    volumeSeriesRef.current = volSeries;

    const sma9Series = chart.addLineSeries({ color: '#f48fb1', lineWidth: 1, priceLineVisible: false, lastValueVisible: false, crosshairMarkerVisible: false });
    sma9Ref.current = sma9Series;
    const sma21Series = chart.addLineSeries({ color: '#ffcc02', lineWidth: 1, priceLineVisible: false, lastValueVisible: false, crosshairMarkerVisible: false });
    sma21Ref.current = sma21Series;

    const handleResize = () => {
      if (chartContainerRef.current && chartRef.current) {
        chartRef.current.applyOptions({ width: chartContainerRef.current.clientWidth, height: chartContainerRef.current.clientHeight });
      }
    };
    window.addEventListener('resize', handleResize);
    return () => { window.removeEventListener('resize', handleResize); chart.remove(); };
  }, []);

  useEffect(() => {
    const fetchHistoricalData = async () => {
      if (!seriesRef.current) return;
      setLoading(true);
      try {
        const res = await axios.get(`/api/quote/${ticker}?range=${activeRange.range}&interval=${activeInterval.interval}`);
        const results = res.data.results[0];
        if (!results || !results.historicalDataPrice) return;

        const historicalData = results.historicalDataPrice;
        const formattedData = historicalData
            .filter((d: any) => d.open && d.high && d.low && d.close && d.date)
            .map((data: any) => ({ time: data.date, open: data.open, high: data.high, low: data.low, close: data.close, volume: data.volume || 0 }));

        formattedData.sort((a: any, b: any) => a.time - b.time);
        const uniqueData = formattedData.filter((v: any, i: any, a: any) => a.findIndex((t: any) => t.time === v.time) === i);

        const candleData = uniqueData.map((d: any) => ({ time: d.time, open: d.open, high: d.high, low: d.low, close: d.close }));
        seriesRef.current.setData(candleData);
        if (candleData.length > 0) {
          lastCandleTimeRef.current = candleData[candleData.length - 1].time;
          lastCandleDataRef.current = { ...candleData[candleData.length - 1] };
        }

        if (volumeSeriesRef.current) volumeSeriesRef.current.setData(uniqueData.map((d: any) => ({ time: d.time, value: d.volume, color: d.close >= d.open ? 'rgba(38,166,154,0.5)' : 'rgba(239,83,80,0.5)' })));

        const calcSma = (data: any[], period: number) => {
          const result = [];
          for (let i = period - 1; i < data.length; i++) {
            const avg = data.slice(i - period + 1, i + 1).reduce((sum: number, d: any) => sum + d.close, 0) / period;
            result.push({ time: data[i].time, value: parseFloat(avg.toFixed(2)) });
          }
          return result;
        };
        if (sma9Ref.current) sma9Ref.current.setData(calcSma(uniqueData, 9));
        if (sma21Ref.current) sma21Ref.current.setData(calcSma(uniqueData, 21));

        chartRef.current?.timeScale().fitContent();
      } catch (err) { console.error(err); } finally { setLoading(false); }
    };
    fetchHistoricalData();
  }, [ticker, activeInterval, activeRange]);

  useEffect(() => { if (volumeSeriesRef.current) volumeSeriesRef.current.applyOptions({ visible: showVolume }); }, [showVolume]);
  useEffect(() => { if (sma9Ref.current) sma9Ref.current.applyOptions({ visible: showSma9 }); }, [showSma9]);
  useEffect(() => { if (sma21Ref.current) sma21Ref.current.applyOptions({ visible: showSma21 }); }, [showSma21]);

  useEffect(() => {
    const fetchLiveSpot = async () => {
      try {
        const liveRes = await axios.get(`/api/quote/${ticker}`);
        const result = liveRes.data.results[0];
        const spotPrice = result?.regularMarketPrice;
        const spotTime = result?.regularMarketTime || Math.floor(Date.now() / 1000);
        
        if (spotPrice) {
          setCurrentPrice(spotPrice);
          setMarketData({
             open: result.regularMarketOpen || 0,
             high: result.regularMarketDayHigh || 0,
             low: result.regularMarketDayLow || 0,
             prevClose: result.regularMarketPreviousClose || 0,
             changePercent: result.regularMarketChangePercent || 0,
          });
          processPendingOrders(ticker, spotPrice, spotTime);

          if (seriesRef.current && lastCandleDataRef.current) {
            const lc = lastCandleDataRef.current;
            lc.close = spotPrice;
            lc.high = Math.max(lc.high, spotPrice);
            lc.low = Math.min(lc.low, spotPrice);
            seriesRef.current.update(lc);
          }
        }
      } catch (err) { console.error(err); }
    };
    fetchLiveSpot();
    const interval = setInterval(fetchLiveSpot, 1000);
    return () => clearInterval(interval);
  }, [ticker]);

  useEffect(() => {
    const updateMarketClock = () => {
      const now = new Date();
      const timeString = now.toLocaleTimeString('pt-BR', { timeZone: 'America/Sao_Paulo', hour12: false });
      setClockTime(timeString);
      const spDate = new Date(now.toLocaleString('en-US', { timeZone: 'America/Sao_Paulo', hour12: false }));
      const day = spDate.getDay();
      const hours = spDate.getHours();
      const minutes = spDate.getMinutes();
      
      const isWeekend = day === 0 || day === 6;
      const isTradingHours = hours >= 10 && hours < 18;
      
      if (isWeekend || !isTradingHours) setMarketStatus('FECHADO');
      else if (hours === 17 && minutes >= 55) setMarketStatus('FECHANDO');
      else setMarketStatus('ABERTO');
    };
    updateMarketClock();
    const clkInterval = setInterval(updateMarketClock, 1000);
    return () => clearInterval(clkInterval);
  }, []);

  const executeOrder = () => {
    if (marketStatus === 'FECHADO') return;
    if (boletaSide === 'BUY') {
      if (orderType === 'MARKET') buyMarket(ticker, Number(orderQty), currentPrice, currentTime, Number(stopLoss) || undefined, Number(takeProfit) || undefined);
      else addPendingOrder({ ticker, type: 'BUY_LIMIT', quantity: Number(orderQty), targetPrice, time: currentTime });
    } else {
      if (orderType === 'MARKET') sellMarket(ticker, Number(orderQty), currentPrice, currentTime);
      else addPendingOrder({ ticker, type: 'SELL_LIMIT', quantity: Number(orderQty), targetPrice, time: currentTime });
    }
  };

  return (
    <Container>
      <TopBar>
        <div className="left-side">
          <div style={{ position: 'relative' }}>
            <input 
              type="text" 
              placeholder="Buscar (ex: BBDC4)" 
              value={searchTerm}
              onChange={e => setSearchTerm(e.target.value)}
              style={{ padding: '0.6rem 1rem', borderRadius: '20px', border: '1px solid #444', backgroundColor: '#1E1E24', color: '#fff', width: '220px', outline: 'none' }}
            />
            {searchResults.length > 0 && (
              <ul style={{ position: 'absolute', top: '100%', left: 0, zIndex: 10, background: '#1E1E24', border: '1px solid #444', borderRadius: '4px', listStyle: 'none', padding: 0, margin: '4px 0 0 0', width: '100%', maxHeight: '250px', overflowY: 'auto' }}>
                {searchResults.slice(0, 15).map(s => (
                   <li key={s} onClick={() => { setTicker(s); setSearchTerm(''); setSearchResults([]); }}
                       style={{ padding: '0.8rem', cursor: 'pointer', borderBottom: '1px solid #333', fontSize: '0.9rem' }}
                       onMouseEnter={e => e.currentTarget.style.backgroundColor = '#444'}
                       onMouseLeave={e => e.currentTarget.style.backgroundColor = 'transparent'}>
                     {s}
                   </li>
                ))}
              </ul>
            )}
          </div>
          
          <div style={{ width: '1px', height: '24px', backgroundColor: '#444', margin: '0 5px' }} />
          
          <div style={{ display: 'flex', gap: '8px', alignItems: 'center', overflowX: 'auto' }}>
            {favorites.map(fav => (
               <button key={fav} onClick={() => setTicker(fav)}
                 style={{ display: 'flex', alignItems: 'center', gap: '6px', padding: '0.3rem 0.8rem', borderRadius: '20px', backgroundColor: ticker === fav ? '#26a69a' : '#2B2B36', border: '1px solid transparent', color: '#fff', fontSize: '0.8rem', cursor: 'pointer', transition: '0.2s', whiteSpace: 'nowrap' }}>
                 <img src={`https://icons.brapi.dev/icons/${fav}.svg`} alt="" width="16" height="16" style={{ borderRadius: '50%', backgroundColor: '#fff', objectFit: 'contain' }} onError={(e) => { e.currentTarget.style.display = 'none'; }} />
                 {fav}
               </button>
            ))}
            {favorites.length === 0 && <span style={{ fontSize: '0.8rem', color: '#666' }}>Sua Watchlist está vazia (Clique na estrela).</span>}
          </div>
        </div>

        <div className="right-side">
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
             <span style={{ fontSize: '0.9rem', color: '#888' }}>Carteira Livre:</span>
             <strong style={{ color: balance >= 100000 ? '#26a69a' : '#ef5350', fontSize: '1.1rem' }}>R$ {balance.toFixed(2)}</strong>
          </div>
          <div style={{ width: '1px', height: '24px', backgroundColor: '#444', margin: '0 5px' }} />
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
             <span style={{ fontFamily: 'monospace', color: '#ddd', fontSize: '0.95rem' }}>{clockTime}</span>
             <span style={{ backgroundColor: marketStatus === 'ABERTO' ? '#26a69a22' : marketStatus === 'FECHANDO' ? '#ff980022' : '#ef535022', color: marketStatus === 'ABERTO' ? '#26a69a' : marketStatus === 'FECHANDO' ? '#ff9800' : '#ef5350', padding: '4px 10px', borderRadius: '4px', fontWeight: 'bold', fontSize: '0.75rem' }}>
               {marketStatus}
             </span>
             <button onClick={() => setShowHelp(true)} style={{ width: '28px', height: '28px', borderRadius: '50%', backgroundColor: '#444', color: '#fff', border: 'none', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>?</button>
          </div>
        </div>
      </TopBar>

      <SimulatorGrid>
        {/* BOLETA */}
        <BoletaContainer>
          <h2>Boleta Rápida</h2>
          
          <div style={{ display: 'flex', borderBottom: '1px solid #333', marginBottom: '1.5rem' }}>
            <button 
              onClick={() => setBoletaSide('BUY')}
              style={{ flex: 1, padding: '0.8rem', border: 'none', background: 'transparent', color: boletaSide === 'BUY' ? '#26a69a' : '#888', borderBottom: boletaSide === 'BUY' ? '2px solid #26a69a' : '2px solid transparent', fontWeight: 'bold', cursor: 'pointer', transition: '0.2s' }}>
              Compra
            </button>
            <button 
              onClick={() => setBoletaSide('SELL')}
              style={{ flex: 1, padding: '0.8rem', border: 'none', background: 'transparent', color: boletaSide === 'SELL' ? '#ef5350' : '#888', borderBottom: boletaSide === 'SELL' ? '2px solid #ef5350' : '2px solid transparent', fontWeight: 'bold', cursor: 'pointer', transition: '0.2s' }}>
              Venda
            </button>
          </div>

          <div className="form-group">
            <label>Tipo de ordem</label>
            <select value={orderType} onChange={e => setOrderType(e.target.value as any)}>
              <option value="MARKET">A mercado</option>
              <option value="LIMIT">Limitada/Stop</option>
            </select>
          </div>

          <div className="form-group">
            <label>Quantidade</label>
            <div style={{ display: 'flex', alignItems: 'center' }}>
               <button onClick={() => setOrderQty(Math.max(1, Number(orderQty) - 100))} style={{ padding: '0.7rem', border: '1px solid #444', background: '#2B2B36', color: '#fff', borderRadius: '4px 0 0 4px', cursor: 'pointer' }}>-</button>
               <input type="number" value={orderQty} onChange={e => setOrderQty(e.target.value === '' ? '' : Number(e.target.value))} style={{ borderRadius: '0', borderLeft: 'none', borderRight: 'none', textAlign: 'center' }} />
               <button onClick={() => setOrderQty(Number(orderQty) + 100)} style={{ padding: '0.7rem', border: '1px solid #444', background: '#2B2B36', color: '#fff', borderRadius: '0 4px 4px 0', cursor: 'pointer' }}>+</button>
            </div>
          </div>

          {orderType === 'LIMIT' && (
            <div className="form-group">
              <label>Preço Alvo</label>
              <input type="number" value={targetPrice} onChange={e => setTargetPrice(Number(e.target.value))} min="0.01" step="0.01" />
            </div>
          )}

          {orderType === 'MARKET' && (
            <div style={{ display: 'flex', gap: '0.5rem', marginBottom: '1rem' }}>
              <div style={{ flex: 1 }} className="form-group">
                 <label style={{ color: '#26a69a' }}>Alvo (Opc.)</label>
                 <input type="number" placeholder="R$" value={takeProfit} onChange={e => setTakeProfit(e.target.value ? Number(e.target.value) : '')} min="0.01" step="0.01" />
              </div>
              <div style={{ flex: 1 }} className="form-group">
                 <label style={{ color: '#ef5350' }}>Stop (Opc.)</label>
                 <input type="number" placeholder="R$" value={stopLoss} onChange={e => setStopLoss(e.target.value ? Number(e.target.value) : '')} min="0.01" step="0.01" />
              </div>
            </div>
          )}

          <div style={{ padding: '1rem', background: 'rgba(0,0,0,0.2)', borderRadius: '6px', marginBottom: '1rem' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.85rem', marginBottom: '6px', color: '#aaa' }}>
              <span>Preço estimado</span>
              <strong>R$ {orderType === 'MARKET' ? currentPrice.toFixed(2) : targetPrice.toFixed(2)}</strong>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.85rem', color: '#aaa' }}>
              <span>Total da Ordem</span>
              <strong style={{ color: '#fff' }}>R$ {((orderType === 'MARKET' ? currentPrice : targetPrice) * Number(orderQty)).toFixed(2)}</strong>
            </div>
          </div>

          <div className="action-buttons">
            <button 
              className={boletaSide === 'BUY' ? 'buy' : 'sell'}
              disabled={marketStatus === 'FECHADO'}
              onClick={executeOrder}>
              {boletaSide === 'BUY' ? 'Comprar' : 'Vender'}
            </button>
          </div>
        </BoletaContainer>

        {/* CHART AREA */}
        <ChartContainer>
          <div className="chart-header">
            <div className="asset-info">
               <img src={`https://icons.brapi.dev/icons/${ticker}.svg`} alt="" width="28" height="28" style={{ borderRadius: '50%', background: '#fff' }} onError={(e) => { e.currentTarget.style.display = 'none'; }} />
               <h2 style={{ margin: 0, display: 'flex', alignItems: 'center' }}>
                 {ticker}
                 <button 
                   onClick={() => toggleFavorite(ticker)} 
                   style={{ 
                     background: 'none', 
                     border: 'none', 
                     cursor: 'pointer', 
                     fontSize: '1.2rem', 
                     marginLeft: '8px',
                     color: favorites.includes(ticker) ? '#ffcc00' : '#ffffff',
                     transition: '0.2s transform',
                     display: 'flex',
                     alignItems: 'center'
                   }}
                   onMouseEnter={e => e.currentTarget.style.transform = 'scale(1.2)'}
                   onMouseLeave={e => e.currentTarget.style.transform = 'scale(1)'}
                 >
                   {favorites.includes(ticker) ? '★' : '☆'}
                 </button>
               </h2>
               <div className="asset-price" style={{ marginLeft: '10px' }}>
                  <strong style={{ fontSize: '1.1rem', color: '#fff' }}>R$ {currentPrice.toFixed(2)}</strong>
                  <span style={{ color: marketData.changePercent >= 0 ? '#26a69a' : '#ef5350', fontSize: '0.8rem', fontWeight: 'bold' }}>
                    {marketData.changePercent >= 0 ? '+' : ''}{marketData.changePercent.toFixed(2)}%
                  </span>
               </div>
            </div>
            
            {loading && <span style={{ color: '#888', fontSize: '0.8rem' }}>Carregando...</span>}

            <div className="asset-stats">
               <div className="stat-item"><span>Mínima</span><strong>R$ {marketData.low.toFixed(2)}</strong></div>
               <div className="stat-item"><span>Máxima</span><strong>R$ {marketData.high.toFixed(2)}</strong></div>
               <div className="stat-item"><span>Aber.</span><strong>R$ {marketData.open.toFixed(2)}</strong></div>
               <div className="stat-item"><span>Fech. ant.</span><strong>R$ {marketData.prevClose.toFixed(2)}</strong></div>
            </div>
          </div>

          <div className="chart-area-wrapper">
            <div className="floating-toolbar">
              {INTERVALS.map(iv => (
                 <button key={iv.label} className={activeInterval.label === iv.label ? 'active' : ''} onClick={() => handleIntervalChange(iv)}>{iv.label}</button>
              ))}
              <div style={{ width: '1px', backgroundColor: '#555', margin: '0 4px' }} />
              <button className={showVolume ? 'active' : ''} onClick={() => setShowVolume(!showVolume)}>Vol</button>
              <button className={showSma9 ? 'active' : ''} onClick={() => setShowSma9(!showSma9)}>SMA9</button>
              <button className={showSma21 ? 'active' : ''} onClick={() => setShowSma21(!showSma21)}>SMA21</button>
            </div>
            <div className="chart-area" ref={chartContainerRef} style={{ flex: 1 }} />
          </div>
        </ChartContainer>

        {/* LIST CONTAINER (Orders / Positions) */}
        <ListContainer>
          <div className="tabs">
            <button className={listTab === 'ORDERS' ? 'active' : ''} onClick={() => setListTab('ORDERS')}>Ordens</button>
            <button className={listTab === 'POSITIONS' ? 'active' : ''} onClick={() => setListTab('POSITIONS')}>Posição</button>
          </div>

          <div className="list-content">
            {listTab === 'ORDERS' && (
              <>
                {pendingOrders.filter(po => po.ticker === ticker).length === 0 ? (
                  <p style={{ color: '#888', fontSize: '0.85rem', textAlign: 'center', marginTop: '2rem' }}>Nenhuma ordem para {ticker}.</p>
                ) : (
                  <ul>
                    {pendingOrders.filter(po => po.ticker === ticker).map(po => (
                      <li key={po.id}>
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                          <span style={{ color: po.type.includes('BUY') ? '#26a69a' : '#ef5350', fontWeight: 'bold' }}>
                            {po.type === 'BUY_LIMIT' && 'Compra Limitada'}
                            {po.type === 'SELL_LIMIT' && 'Alvo de Gain'}
                            {po.type === 'SELL_STOP' && 'Stop Loss'}
                          </span>
                          <span style={{ color: '#ddd' }}>{po.quantity} un a R$ {po.targetPrice.toFixed(2)}</span>
                        </div>
                        <button onClick={() => cancelPendingOrder(po.id)} style={{ background: 'transparent', border: '1px solid #555', color: '#fff', borderRadius: '4px', padding: '0.3rem 0.6rem', cursor: 'pointer' }}>X</button>
                      </li>
                    ))}
                  </ul>
                )}
              </>
            )}

            {listTab === 'POSITIONS' && (
              <>
                {positions.length === 0 ? (
                  <p style={{ color: '#888', fontSize: '0.85rem', textAlign: 'center', marginTop: '2rem' }}>A carteira está vazia.</p>
                ) : (
                  <ul>
                    {positions.map(pos => {
                      const isCurrentTicker = pos.ticker === ticker;
                      const plValue = (currentPrice - pos.averagePrice) * pos.quantity;
                      const plPercent = ((currentPrice - pos.averagePrice) / pos.averagePrice) * 100;
                      return (
                        <li key={pos.ticker} style={{ flexDirection: 'column' }}>
                          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px' }}>
                            <strong style={{ color: '#fff' }}>{pos.ticker}</strong>
                            <span style={{ color: '#aaa' }}>{pos.quantity} un</span>
                          </div>
                          <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.8rem', color: '#888' }}>
                            <span>Preço Médio: R$ {pos.averagePrice.toFixed(2)}</span>
                            {isCurrentTicker && (
                              <strong style={{ color: plValue >= 0 ? '#26a69a' : '#ef5350' }}>
                                {plValue >= 0 ? '+' : ''}R$ {plValue.toFixed(2)} ({plPercent.toFixed(2)}%)
                              </strong>
                            )}
                          </div>
                        </li>
                      );
                    })}
                  </ul>
                )}
              </>
            )}
          </div>
        </ListContainer>
      </SimulatorGrid>

      {/* BOLETA HELP MODAL */}
      {showHelp && (
        <div onClick={() => setShowHelp(false)} style={{ position: 'fixed', top: 0, left: 0, width: '100vw', height: '100vh', backgroundColor: 'rgba(0,0,0,0.7)', zIndex: 9999, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <div onClick={e => e.stopPropagation()} style={{ backgroundColor: '#1E1E24', padding: '2rem', borderRadius: '8px', maxWidth: '550px', width: '90%', color: '#E0E0E0', boxShadow: '0px 10px 40px rgba(0,0,0,0.8)', position: 'relative' }}>
            <button onClick={() => setShowHelp(false)} style={{ position: 'absolute', top: '15px', right: '15px', background: 'none', border: 'none', color: '#999', fontSize: '1.2rem', cursor: 'pointer' }}>✕</button>
            <h2 style={{ marginTop: 0, color: '#26a69a' }}>Como funciona a Boleta?</h2>
            <p style={{ fontSize: '0.95rem', lineHeight: '1.6' }}>A Boleta é o painel onde você escolhe entre Compra e Venda.</p>
            <ul style={{ fontSize: '0.9rem', lineHeight: '1.8', color: '#ccc', paddingLeft: '1.2rem', marginTop: '1rem' }}>
              <li><strong style={{ color: '#fff' }}>A Mercado:</strong> Executa a ordem instantaneamente no preço atual.</li>
              <li><strong style={{ color: '#fff' }}>Limitada/Stop:</strong> O sistema aguarda bater no preço alvo.</li>
              <li><strong style={{ color: '#fff' }}>Relógio de Mercado:</strong>  🟢 Aberto, 🟠 Fechando, 🔴 Fechado.</li>
            </ul>
          </div>
        </div>
      )}
    </Container>
  );
};

export default MainSimulator;
