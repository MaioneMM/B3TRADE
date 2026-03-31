import React, { useEffect, useRef, useState } from 'react';
import { createChart, ColorType, IChartApi, ISeriesApi } from 'lightweight-charts';
import { Container, SimulatorGrid, ChartContainer, OrderPanelContainer } from './styles';
import axios from 'axios';
import { usePortfolio } from '../../context/PortfolioContext';

const MainSimulator = () => {
  const chartContainerRef = useRef<HTMLDivElement>(null);
  const chartRef = useRef<IChartApi | null>(null);
  const seriesRef = useRef<ISeriesApi<"Candlestick"> | null>(null);
  const volumeSeriesRef = useRef<ISeriesApi<"Histogram"> | null>(null);
  const sma9Ref = useRef<ISeriesApi<"Line"> | null>(null);
  const sma21Ref = useRef<ISeriesApi<"Line"> | null>(null);
  // Guarda o timestamp da última vela histórica para o polling não criar velas novas
  const lastCandleTimeRef = useRef<number | null>(null);

  // Indicator toggles
  const [showVolume, setShowVolume] = useState(true);
  const [showSma9, setShowSma9] = useState(false);
  const [showSma21, setShowSma21] = useState(false);
  
  const { balance, positions, orders, pendingOrders, favorites, buyMarket, sellMarket, addPendingOrder, cancelPendingOrder, processPendingOrders, toggleFavorite, resetPortfolio } = usePortfolio();

  const [ticker, setTicker] = useState('PETR4');
  const [loading, setLoading] = useState(false);
  const [currentPrice, setCurrentPrice] = useState(0);
  const [currentTime, setCurrentTime] = useState<string>('');
  const [orderQty, setOrderQty] = useState<number | ''>(100);
  const [orderType, setOrderType] = useState<'MARKET' | 'LIMIT'>('MARKET');
  const [targetPrice, setTargetPrice] = useState<number>(0);
  const [stopLoss, setStopLoss] = useState<number | ''>('');
  const [takeProfit, setTakeProfit] = useState<number | ''>('');
  const [showHelp, setShowHelp] = useState(false);
  const [marketStatus, setMarketStatus] = useState<'ABERTO' | 'FECHANDO' | 'FECHADO'>('ABERTO');
  const [clockTime, setClockTime] = useState<string>('');
  // ---- CANDLE INTERVAL (tamanho da vela) ----
  type CandleInterval = { label: string; interval: string; defaultRange: string; supportsTime: boolean };
  const INTERVALS: CandleInterval[] = [
    { label: '5',  interval: '5m',  defaultRange: '5d',  supportsTime: true  },
    { label: '15', interval: '15m', defaultRange: '5d',  supportsTime: true  },
    { label: '30', interval: '30m', defaultRange: '5d',  supportsTime: true  },
    { label: '1H', interval: '1h',  defaultRange: '1mo', supportsTime: true  },
    { label: '1D', interval: '1d',  defaultRange: '1y',  supportsTime: false },
    { label: '1W', interval: '1wk', defaultRange: '5y',  supportsTime: false },
    { label: '1M', interval: '1mo', defaultRange: 'max', supportsTime: false },
  ];
  const [activeInterval, setActiveInterval] = useState<CandleInterval>(INTERVALS[4]); // default 1D

  // ---- HISTORY RANGE (período histórico) ----
  type HistoryRange = { label: string; range: string };
  const getRangesForInterval = (iv: CandleInterval): HistoryRange[] => {
    if (['5m','15m','30m'].includes(iv.interval))
      return [{ label: '1D', range: '1d' }, { label: '5D', range: '5d' }];
    if (iv.interval === '1h')
      return [{ label: '5D', range: '5d' }, { label: '1M', range: '1mo' }];
    if (iv.interval === '1d')
      return [{ label: '1M', range: '1mo' }, { label: '6M', range: '6mo' }, { label: '1A', range: '1y' }, { label: '5A', range: '5y' }];
    if (iv.interval === '1wk')
      return [{ label: '1A', range: '1y' }, { label: '5A', range: '5y' }, { label: 'Máx', range: 'max' }];
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

  // PRE-FETCH ALL TICKERS ONCE FOR INSTANT LOCAL SEARCH
  useEffect(() => {
    const fetchAll = async () => {
      try {
        const res = await axios.get('https://brapi.dev/api/available');
        setAllStocks(res.data.stocks || []);
      } catch (err) {
        console.error("Failed to fetch global tickers", err);
      }
    };
    fetchAll();
  }, []);

  // INSTANT LOCAL FILTERING
  useEffect(() => {
    if (searchTerm.trim().length === 0) {
      setSearchResults([]);
      return;
    }
    
    const query = searchTerm.toUpperCase();
    const filtered = allStocks.filter(s => s.includes(query));
    setSearchResults(filtered);
  }, [searchTerm, allStocks]);

  useEffect(() => {
    if (!chartContainerRef.current) return;

    // Detect dark mode for chart colors
    const isDark = window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches;
    const backgroundColor = isDark ? '#1a1a1a' : '#ffffff';
    const textColor = isDark ? '#d1d4dc' : '#333333';

    const chart = createChart(chartContainerRef.current, {
      layout: {
        background: { type: ColorType.Solid, color: backgroundColor },
        textColor: textColor,
      },
      width: chartContainerRef.current.clientWidth,
      height: chartContainerRef.current.clientHeight,
      grid: {
        vertLines: { color: isDark ? '#2B2B43' : '#e1e3eb' },
        horzLines: { color: isDark ? '#2B2B43' : '#e1e3eb' },
      },
      timeScale: {
        timeVisible: true,
        secondsVisible: false,
      },
    });
    
    chartRef.current = chart;
    const candlestickSeries = chart.addCandlestickSeries({
      upColor: '#26a69a',
      downColor: '#ef5350',
      borderVisible: false,
      wickUpColor: '#26a69a',
      wickDownColor: '#ef5350',
    });
    seriesRef.current = candlestickSeries;

    // Volume histogram series (pane 1)
    const volSeries = chart.addHistogramSeries({
      color: '#26a69a',
      priceFormat: { type: 'volume' },
      priceScaleId: 'volume',
    });
    volSeries.priceScale().applyOptions({
      scaleMargins: { top: 0.8, bottom: 0 },
    });
    volumeSeriesRef.current = volSeries;

    // SMA 9 line series
    const sma9Series = chart.addLineSeries({
      color: '#f48fb1',
      lineWidth: 1,
      priceLineVisible: false,
      lastValueVisible: false,
      crosshairMarkerVisible: false,
    });
    sma9Ref.current = sma9Series;

    // SMA 21 line series
    const sma21Series = chart.addLineSeries({
      color: '#ffcc02',
      lineWidth: 1,
      priceLineVisible: false,
      lastValueVisible: false,
      crosshairMarkerVisible: false,
    });
    sma21Ref.current = sma21Series;

    const handleResize = () => {
      if (chartContainerRef.current && chartRef.current) {
        chartRef.current.applyOptions({
          width: chartContainerRef.current.clientWidth,
          height: chartContainerRef.current.clientHeight,
        });
      }
    };

    window.addEventListener('resize', handleResize);

    return () => {
      window.removeEventListener('resize', handleResize);
      chart.remove();
    };
  }, []);

  useEffect(() => {
    const fetchHistoricalData = async () => {
      if (!seriesRef.current) return;
      
      setLoading(true);
      try {
        const { interval } = activeInterval;
        const { range } = activeRange;
        const res = await axios.get(`/api/quote/${ticker}?range=${range}&interval=${interval}`);
        const results = res.data.results[0];
        if (!results || !results.historicalDataPrice) return;

        const historicalData = results.historicalDataPrice;
        
        const formattedData = historicalData
            .filter((d: any) => d.open && d.high && d.low && d.close && d.date)
            .map((data: any) => ({
              time: data.date,
              open: data.open,
              high: data.high,
              low: data.low,
              close: data.close,
              volume: data.volume || 0,
            }));

        formattedData.sort((a: any, b: any) => a.time - b.time);
        const uniqueData = formattedData.filter((v: any, i: any, a: any) => a.findIndex((t: any) => t.time === v.time) === i);

        // A cotação do usuário não será mais atualizada baseada na última "vela fechada" (que pode ser de ontem)
        // O Spot Price Real será puxado pelo Polling de baixo
        // if (uniqueData.length > 0) {
        //   const lastOne = uniqueData[uniqueData.length - 1];
        //   setCurrentPrice(lastOne.close); 
        //   setCurrentTime(lastOne.time);
        // }

        // ---- CANDLESTICK ----
        const candleData = uniqueData.map((d: any) => ({ time: d.time, open: d.open, high: d.high, low: d.low, close: d.close }));
        seriesRef.current.setData(candleData);
        // Salva o tempo da última vela histórica para o polling reusar sempre o mesmo timestamp
        if (candleData.length > 0) {
          lastCandleTimeRef.current = candleData[candleData.length - 1].time;
        }

        // ---- VOLUME ----
        if (volumeSeriesRef.current) {
          volumeSeriesRef.current.setData(uniqueData.map((d: any) => ({
            time: d.time,
            value: d.volume,
            color: d.close >= d.open ? 'rgba(38,166,154,0.5)' : 'rgba(239,83,80,0.5)',
          })));
        }

        // ---- SMA HELPER ----
        const calcSma = (data: any[], period: number) => {
          const result = [];
          for (let i = period - 1; i < data.length; i++) {
            const slice = data.slice(i - period + 1, i + 1);
            const avg = slice.reduce((sum: number, d: any) => sum + d.close, 0) / period;
            result.push({ time: data[i].time, value: parseFloat(avg.toFixed(2)) });
          }
          return result;
        };

        // ---- SMA 9 ----
        if (sma9Ref.current) {
          sma9Ref.current.setData(calcSma(uniqueData, 9));
        }

        // ---- SMA 21 ----
        if (sma21Ref.current) {
          sma21Ref.current.setData(calcSma(uniqueData, 21));
        }

        chartRef.current?.timeScale().fitContent();
      } catch (err) {
        console.error("Failed to fetch historical data", err);
      } finally {
        setLoading(false);
      }
    };

    fetchHistoricalData();
  }, [ticker, activeInterval, activeRange]);

  // INDICATOR VISIBILITY TOGGLES
  useEffect(() => {
    if (volumeSeriesRef.current) volumeSeriesRef.current.applyOptions({ visible: showVolume });
  }, [showVolume]);

  useEffect(() => {
    if (sma9Ref.current) sma9Ref.current.applyOptions({ visible: showSma9 });
  }, [showSma9]);

  useEffect(() => {
    if (sma21Ref.current) sma21Ref.current.applyOptions({ visible: showSma21 });
  }, [showSma21]);

  // LIVE POLLING (Coração Vivo do Simulador)
  useEffect(() => {
    
    // Função puxadora da "Cotação Vivo"
    const fetchLiveSpot = async () => {
      try {
        const liveRes = await axios.get(`/api/quote/${ticker}`);
        const result = liveRes.data.results[0];
        const spotPrice = result?.regularMarketPrice;
        const spotTime = result?.regularMarketTime || Math.floor(Date.now() / 1000);
        
        if (spotPrice) {
          // Atualiza a Cotação Vivo sem usar dados do gráfico
          setCurrentPrice(spotPrice);
          processPendingOrders(ticker, spotPrice, spotTime);

          // Sincroniza o gráfico: atualiza APENAS a última vela histórica com o preço ao vivo.
          // Usamos lastCandleTimeRef para garantir que sempre atualizamos o mesmo candle
          // existente, sem criar candles novos a cada poll.
          if (seriesRef.current && lastCandleTimeRef.current !== null) {
            seriesRef.current.update({
              time: lastCandleTimeRef.current as any,
              open: result?.regularMarketOpen ?? spotPrice,
              high: result?.regularMarketDayHigh ?? spotPrice,
              low: result?.regularMarketDayLow ?? spotPrice,
              close: spotPrice,
            });
          }
        }
      } catch (err) {
        console.error("Live polling failed", err);
      }
    };

    // Dispara a requisição IMEDIATAMENTE (Fechando o gap zero de preço)
    fetchLiveSpot();

    // Mantém o loop temporal de mercado (a cada 1s)
    const interval = setInterval(fetchLiveSpot, 1000);

    return () => clearInterval(interval);
  }, [ticker]); // Retiramos o processPendingOrders para não ativar fetchs duplicados ao engatilhar uma requisição OCO

  // MARKET CLOCK LOGIC
  useEffect(() => {
    const updateMarketClock = () => {
      const now = new Date();
      // Formata a hora para Brasília
      const timeString = now.toLocaleTimeString('pt-BR', { timeZone: 'America/Sao_Paulo', hour12: false });
      setClockTime(timeString);

      // Usando o formatter para extrair especificamente os componentes de Brasília
      const spTimeString = now.toLocaleString('en-US', { timeZone: 'America/Sao_Paulo', hour12: false });
      const spDate = new Date(spTimeString);
      
      const day = spDate.getDay();
      const hours = spDate.getHours();
      const minutes = spDate.getMinutes();
      
      // B3 Aberta: Seg a Sex (1 a 5), das 10h às 17h59 (Simplificação incluindo after-market)
      const isWeekend = day === 0 || day === 6;
      const isTradingHours = hours >= 10 && hours < 18;
      
      if (isWeekend || !isTradingHours) {
        setMarketStatus('FECHADO');
      } else if (hours === 17 && minutes >= 55) {
        setMarketStatus('FECHANDO');
      } else {
        setMarketStatus('ABERTO');
      }
    };

    updateMarketClock();
    const clkInterval = setInterval(updateMarketClock, 1000);
    return () => clearInterval(clkInterval);
  }, []);

  return (
    <Container>
      <h1>Simulador de Trading B3</h1>
      <SimulatorGrid>
        <ChartContainer>
          <div className="chart-header" style={{ display: 'flex', flexDirection: 'column', width: '100%', marginBottom: '1rem' }}>
            
            {/* TOPO: Titulo e Pesquisa */}
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '10px', width: '100%' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '15px' }}>
                <h2 style={{ margin: 0, display: 'flex', alignItems: 'center', fontSize: '1.5rem' }}>
                  {ticker}
                  <button 
                     onClick={() => toggleFavorite(ticker)}
                     title={favorites.includes(ticker) ? "Remover dos Favoritos" : "Adicionar aos Favoritos"}
                     style={{ background: 'none', border: 'none', cursor: 'pointer', fontSize: '1.4rem', marginLeft: '8px' }}>
                     {favorites.includes(ticker) ? '⭐' : '☆'}
                  </button>
                </h2>
                
                <div style={{ position: 'relative' }}>
                  <input 
                    type="text" 
                    placeholder="Buscar ativo (ex: BBDC4)" 
                    value={searchTerm}
                    onChange={e => setSearchTerm(e.target.value)}
                    style={{ padding: '0.6rem', borderRadius: '4px', border: '1px solid #555', backgroundColor: 'var(--background)', color: 'var(--text)', width: '220px' }}
                  />
                  {searchResults.length > 0 && (
                    <ul style={{ position: 'absolute', top: '100%', left: 0, zIndex: 10, background: '#222', border: '1px solid #555', listStyle: 'none', padding: 0, margin: 0, width: '100%', maxHeight: '250px', overflowY: 'auto', boxShadow: '0 4px 12px rgba(0,0,0,0.5)' }}>
                      {searchResults.slice(0, 15).map(s => (
                         <li key={s} 
                             onClick={() => { setTicker(s); setSearchTerm(''); setSearchResults([]); }}
                             style={{ padding: '0.8rem', cursor: 'pointer', borderBottom: '1px solid #333', fontSize: '0.9rem' }}
                             onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = '#444')}
                             onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = 'transparent')}
                          >
                           {s}
                         </li>
                      ))}
                    </ul>
                  )}
                </div>
              </div>
            </div>

            {/* TOOLBAR: Interval (candle size) + Indicators */}
            <div style={{ display: 'flex', gap: '4px', alignItems: 'center', marginBottom: '6px', flexWrap: 'wrap' }}>
              {/* INTERVAL BUTTONS */}
              {INTERVALS.map(iv => (
                <button
                  key={iv.label}
                  onClick={() => handleIntervalChange(iv)}
                  style={{
                    padding: '0.2rem 0.65rem',
                    borderRadius: '3px',
                    border: '1px solid',
                    borderColor: activeInterval.label === iv.label ? '#26a69a' : '#444',
                    backgroundColor: activeInterval.label === iv.label ? 'rgba(38,166,154,0.18)' : 'transparent',
                    color: activeInterval.label === iv.label ? '#26a69a' : '#aaa',
                    fontSize: '0.8rem',
                    fontWeight: activeInterval.label === iv.label ? 'bold' : 'normal',
                    cursor: 'pointer',
                    transition: 'all 0.15s',
                    width: 'auto',
                  }}
                >
                  {iv.label}
                </button>
              ))}

              <div style={{ width: '1px', height: '16px', backgroundColor: '#444', margin: '0 6px' }} />

              {/* INDICATOR TOGGLES */}
              {[
                { label: 'Vol',    active: showVolume, toggle: () => setShowVolume(v => !v), color: '#26a69a' },
                { label: 'SMA 9',  active: showSma9,   toggle: () => setShowSma9(v => !v),   color: '#f48fb1' },
                { label: 'SMA 21', active: showSma21,  toggle: () => setShowSma21(v => !v),  color: '#ffcc02' },
              ].map(ind => (
                <button
                  key={ind.label}
                  onClick={ind.toggle}
                  style={{
                    padding: '0.2rem 0.65rem',
                    borderRadius: '3px',
                    border: '1px solid',
                    borderColor: ind.active ? ind.color : '#444',
                    backgroundColor: ind.active ? `${ind.color}22` : 'transparent',
                    color: ind.active ? ind.color : '#aaa',
                    fontSize: '0.8rem',
                    fontWeight: ind.active ? 'bold' : 'normal',
                    cursor: 'pointer',
                    transition: 'all 0.15s',
                    width: 'auto',
                  }}
                >
                  {ind.label}
                </button>
              ))}

              {loading && <span style={{ color: '#888', fontSize: '0.8rem', marginLeft: '6px' }}>⟳</span>}
            </div>

            {/* RANGE ROW (history period — changes based on interval) */}
            <div style={{ display: 'flex', gap: '4px', alignItems: 'center', marginBottom: '8px' }}>
              <span style={{ fontSize: '0.75rem', color: '#666', marginRight: '4px' }}>Período:</span>
              {getRangesForInterval(activeInterval).map(r => (
                <button
                  key={r.label}
                  onClick={() => setActiveRange(r)}
                  style={{
                    padding: '0.15rem 0.6rem',
                    borderRadius: '3px',
                    border: '1px solid',
                    borderColor: activeRange.label === r.label ? '#888' : '#333',
                    backgroundColor: activeRange.label === r.label ? '#333' : 'transparent',
                    color: activeRange.label === r.label ? '#ddd' : '#666',
                    fontSize: '0.75rem',
                    cursor: 'pointer',
                    transition: 'all 0.15s',
                    width: 'auto',
                  }}
                >
                  {r.label}
                </button>
              ))}
            </div>


            {/* BASE: Abas de Favoritos */}
            <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap', alignItems: 'center' }}>
              <span style={{ fontSize: '0.85rem', color: '#aaa', marginRight: '5px' }}>Sua Watchlist:</span>
              {favorites.length === 0 && <span style={{ fontSize: '0.8rem', color: '#666' }}>Vazia. Aperte ☆ para salvar papéis aqui.</span>}
              {favorites.map(fav => (
                 <button 
                   key={fav} 
                   onClick={() => setTicker(fav)}
                   style={{ 
                     display: 'flex',
                     alignItems: 'center',
                     gap: '6px',
                     padding: '0.3rem 0.8rem', 
                     borderRadius: '20px', 
                     backgroundColor: ticker === fav ? '#26a69a' : '#333', 
                     border: '1px solid transparent', 
                     color: '#fff', 
                     fontSize: '0.8rem', 
                     cursor: 'pointer',
                     transition: '0.2s'
                   }}>
                   <img 
                     src={`https://icons.brapi.dev/icons/${fav}.svg`} 
                     alt={`${fav} logo`} 
                     width="16" 
                     height="16" 
                     style={{ borderRadius: '50%', backgroundColor: '#fff', objectFit: 'contain' }}
                     onError={(e) => { e.currentTarget.style.display = 'none'; }}
                   />
                   {fav}
                 </button>
              ))}
            </div>

          </div>
          <div className="chart-area" ref={chartContainerRef} style={{ flex: 1, minHeight: '400px' }} />
        </ChartContainer>

        <OrderPanelContainer>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '10px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <h2 style={{ margin: 0 }}>Boleta Rápida</h2>
              <button 
                onClick={() => setShowHelp(true)}
                style={{
                  width: '24px', height: '24px', borderRadius: '50%', backgroundColor: '#444', 
                  color: '#fff', border: 'none', cursor: 'pointer', display: 'flex', 
                  alignItems: 'center', justifyContent: 'center', fontSize: '0.9rem', fontWeight: 'bold'
                }}
                title="Ajuda / Como funciona a Boleta"
              >
                ?
              </button>
            </div>
            
            <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '0.85rem' }}>
               <span style={{ fontFamily: 'monospace', color: '#aaa', fontSize: '0.9rem' }}>{clockTime}</span>
               <span style={{ 
                 backgroundColor: marketStatus === 'ABERTO' ? '#26a69a22' : marketStatus === 'FECHANDO' ? '#ff980022' : '#ef535022',
                 color: marketStatus === 'ABERTO' ? '#26a69a' : marketStatus === 'FECHANDO' ? '#ff9800' : '#ef5350',
                 padding: '2px 8px',
                 borderRadius: '4px',
                 fontWeight: 'bold',
                 textTransform: 'uppercase',
                 fontSize: '0.75rem'
               }}>
                 {marketStatus}
               </span>
            </div>
          </div>
          <div className="panel-body">
            <div style={{ display: 'flex', justifyContent: 'space-between' }}>
              <span>Carteira Livre:</span>
              <strong style={{ color: balance >= 100000 ? '#26a69a' : '#ef5350' }}>R$ {balance.toFixed(2)}</strong>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '1rem' }}>
              <span>Cotação Vivo ({ticker}):</span>
              <strong>R$ {currentPrice.toFixed(2)}</strong>
            </div>

            <div style={{ display: 'flex', gap: '5px', marginBottom: '1rem' }}>
              <button 
                onClick={() => setOrderType('MARKET')} 
                style={{ flex: 1, padding: '0.5rem', backgroundColor: orderType === 'MARKET' ? '#444' : 'transparent', border: '1px solid #444', color: 'var(--text)' }}>
                A Mercado
              </button>
              <button 
                onClick={() => { setOrderType('LIMIT'); setTargetPrice(currentPrice); }} 
                style={{ flex: 1, padding: '0.5rem', backgroundColor: orderType === 'LIMIT' ? '#444' : 'transparent', border: '1px solid #444', color: 'var(--text)' }}>
                Limitada/Stop
              </button>
            </div>

            <label style={{ fontSize: '0.9rem', marginBottom: '-0.5rem' }}>Quantidade</label>
            <input 
              type="number" 
              value={orderQty} 
              onChange={(e) => setOrderQty(e.target.value === '' ? '' : Number(e.target.value))} 
              style={{ padding: '0.8rem', borderRadius: '4px', border: '1px solid #444', backgroundColor: 'var(--background)', color: 'var(--text)' }}
              min="1"
              step="1"
            />

            {orderType === 'LIMIT' && (
              <>
                <label style={{ fontSize: '0.9rem', marginTop: '0.5rem', marginBottom: '-0.5rem', display: 'block' }}>Preço Alvo</label>
                <input 
                  type="number" 
                  value={targetPrice} 
                  onChange={(e) => setTargetPrice(Number(e.target.value))} 
                  style={{ padding: '0.8rem', borderRadius: '4px', border: '1px solid #444', backgroundColor: 'var(--background)', color: 'var(--text)', width: '100%', boxSizing: 'border-box' }}
                  min="0.01"
                  step="0.01"
                />
              </>
            )}

            {orderType === 'MARKET' && (
              <div style={{ display: 'flex', gap: '0.5rem', marginTop: '1rem', marginBottom: '0.5rem' }}>
                 <div style={{ flex: 1 }}>
                    <label style={{ fontSize: '0.80rem', color: '#26a69a', display: 'block', marginBottom: '4px' }}>Alvo Gain (Opc.)</label>
                    <input 
                      type="number" 
                      placeholder="R$"
                      value={takeProfit} 
                      onChange={(e) => setTakeProfit(e.target.value ? Number(e.target.value) : '')} 
                      style={{ padding: '0.6rem', borderRadius: '4px', border: '1px solid #444', backgroundColor: 'var(--background)', color: 'var(--text)', width: '100%', boxSizing: 'border-box' }}
                      min="0.01" step="0.01"
                    />
                 </div>
                 <div style={{ flex: 1 }}>
                    <label style={{ fontSize: '0.80rem', color: '#ef5350', display: 'block', marginBottom: '4px' }}>Stop Loss (Opc.)</label>
                    <input 
                      type="number" 
                      placeholder="R$"
                      value={stopLoss} 
                      onChange={(e) => setStopLoss(e.target.value ? Number(e.target.value) : '')} 
                      style={{ padding: '0.6rem', borderRadius: '4px', border: '1px solid #444', backgroundColor: 'var(--background)', color: 'var(--text)', width: '100%', boxSizing: 'border-box' }}
                      min="0.01" step="0.01"
                    />
                 </div>
              </div>
            )}

            <div style={{ display: 'flex', gap: '0.5rem', marginTop: '1rem' }}>
              <button 
                className="buy"
                disabled={marketStatus === 'FECHADO'}
                style={{ 
                  opacity: marketStatus === 'FECHADO' ? 0.3 : 1, 
                  cursor: marketStatus === 'FECHADO' ? 'not-allowed' : 'pointer',
                  pointerEvents: marketStatus === 'FECHADO' ? 'none' : 'auto'
                }}
                title={
                  marketStatus === 'FECHADO' 
                    ? "Mercado FECHADO. Operações bloqueadas." 
                    : (orderType === 'MARKET' ? "Comprar AGORA pelo preço atual de mercado." : "Agendar compra se o preço CAIR até o Alvo.")
                }
                onClick={() => {
                  if (marketStatus === 'FECHADO') return;
                  if (orderType === 'MARKET') buyMarket(ticker, Number(orderQty), currentPrice, currentTime, Number(stopLoss) || undefined, Number(takeProfit) || undefined);
                  else addPendingOrder({ ticker, type: 'BUY_LIMIT', quantity: Number(orderQty), targetPrice, time: currentTime });
                }}>
                Comprar
              </button>
              <button 
                className="sell" 
                disabled={marketStatus === 'FECHADO'}
                style={{ 
                  opacity: marketStatus === 'FECHADO' ? 0.3 : 1, 
                  cursor: marketStatus === 'FECHADO' ? 'not-allowed' : 'pointer',
                  pointerEvents: marketStatus === 'FECHADO' ? 'none' : 'auto'
                }}
                title={
                  marketStatus === 'FECHADO' 
                    ? "Mercado FECHADO. Operações bloqueadas." 
                    : (orderType === 'MARKET' ? "Vender AGORA a quantidade indicada pelo preço de mercado." : "Agendar venda se o preço SUBIR/CAIR até o Alvo.")
                }
                onClick={() => {
                  if (marketStatus === 'FECHADO') return;
                  if (orderType === 'MARKET') sellMarket(ticker, Number(orderQty), currentPrice, currentTime);
                  else addPendingOrder({ ticker, type: 'SELL_LIMIT', quantity: Number(orderQty), targetPrice, time: currentTime });
                }}>
                Vender
              </button>
            </div>

            <hr style={{ borderColor: '#444', margin: '1rem 0' }} />

            <h3>Ordens Pendentes</h3>
            {pendingOrders.filter(po => po.ticker === ticker).length === 0 ? (
              <p style={{ color: '#888', fontSize: '0.9rem', marginBottom: '1rem'}}>Nenhum agendamento para {ticker}.</p>
            ) : (
               <ul style={{ listStyle: 'none', padding: 0, margin: '0 0 1rem 0' }}>
                {pendingOrders.filter(po => po.ticker === ticker).map(po => (
                  <li key={po.id} style={{ display: 'flex', justifyContent: 'space-between', padding: '0.5rem 0', borderBottom: '1px dotted #555', fontSize: '0.85rem', alignItems: 'center' }}>
                    <span>
                      {po.type === 'BUY_LIMIT' && '📥 COMPRA LIM'}
                      {po.type === 'SELL_LIMIT' && '📈 ALVO GAIN'}
                      {po.type === 'SELL_STOP' && '🛑 STOP LOSS'} 
                      {' '}{po.quantity}x a <strong>R$ {po.targetPrice.toFixed(2)}</strong>
                    </span>
                    <button onClick={() => cancelPendingOrder(po.id)} style={{ padding: '0.2rem 0.5rem', fontSize: '0.75rem', backgroundColor: '#f22', width: 'auto' }}>X</button>
                  </li>
                ))}
              </ul>
            )}
            
            <h3>Minhas Posições</h3>
            {positions.length === 0 ? (
              <p style={{ color: '#888', fontSize: '0.9rem'}}>Nenhuma posição aberta.</p>
            ) : (
              <ul style={{ listStyle: 'none', padding: 0, margin: 0 }}>
                {positions.map(pos => {
                  const isCurrentTicker = pos.ticker === ticker;
                  const plValue = (currentPrice - pos.averagePrice) * pos.quantity;
                  const plPercent = ((currentPrice - pos.averagePrice) / pos.averagePrice) * 100;
                  
                  return (
                    <li key={pos.ticker} style={{ display: 'flex', justifyContent: 'space-between', padding: '0.5rem 0', borderBottom: '1px solid #333', fontSize: '0.9rem' }}>
                      <span>{pos.quantity}x <strong>{pos.ticker}</strong></span>
                      <div style={{ textAlign: 'right' }}>
                        <span>PM: R$ {pos.averagePrice.toFixed(2)}</span>
                        {isCurrentTicker && (
                          <div style={{ color: plValue >= 0 ? '#26a69a' : '#ef5350', fontWeight: 'bold' }}>
                            {plValue >= 0 ? '+' : ''}R$ {plValue.toFixed(2)} ({plPercent.toFixed(2)}%)
                          </div>
                        )}
                      </div>
                    </li>
                  );
                })}
              </ul>
            )}
          </div>
        </OrderPanelContainer>
      </SimulatorGrid>

      {/* BOLETA HELP MODAL */}
      {showHelp && (
        <div 
          onClick={() => setShowHelp(false)}
          style={{
            position: 'fixed', top: 0, left: 0, width: '100vw', height: '100vh', 
            backgroundColor: 'rgba(0,0,0,0.7)', zIndex: 9999, display: 'flex', 
            alignItems: 'center', justifyContent: 'center'
          }}
        >
          <div 
            onClick={e => e.stopPropagation()}
            style={{
              backgroundColor: '#1E1E24', padding: '2rem', borderRadius: '8px', 
              maxWidth: '550px', width: '90%', color: '#E0E0E0', 
              boxShadow: '0px 10px 40px rgba(0,0,0,0.8)', position: 'relative'
            }}
          >
            <button 
              onClick={() => setShowHelp(false)}
              style={{
                position: 'absolute', top: '15px', right: '15px', background: 'none', 
                border: 'none', color: '#999', fontSize: '1.2rem', cursor: 'pointer'
              }}
            >
              ✕
            </button>
            <h2 style={{ marginTop: 0, color: '#26a69a' }}>Como funciona a Boleta?</h2>
            <p style={{ fontSize: '0.95rem', lineHeight: '1.6' }}>
              A <strong>Boleta Rápida</strong> é o seu painel de controle operacional para envio de ordens ao mercado.
            </p>
            <ul style={{ fontSize: '0.9rem', lineHeight: '1.8', color: '#ccc', paddingLeft: '1.2rem', marginTop: '1rem' }}>
              <li><strong style={{ color: '#fff' }}>A Mercado:</strong> Executa a sua compra ou venda <em>imediatamente</em> pelo preço atual. Opcionalmente, você pode deixar programado um <strong>Alvo Gain</strong> (onde você sai no lucro) ou um <strong>Stop Loss</strong> (limite de perda automático).</li>
              <li><strong style={{ color: '#fff' }}>Limitada/Stop:</strong> Serve para fazer agendamentos. Você define um <strong>Preço Alvo</strong>, e a ordem fica na "fila" (Ordens Pendentes). O sistema só executará a ordem se a cotação ao vivo cruzar ou atingir este preço que você determinou no futuro.</li>
              <li><strong style={{ color: '#fff' }}>Ordens Pendentes:</strong> Aqui ficam suas ordens de gaveta (Limitadas e Stops) esperando a cotação chegar no alvo. Você pode cancelá-las no botão vermelho [ X ] a qualquer momento.</li>
              <li><strong style={{ color: '#fff' }}>Minhas Posições:</strong> Todos os ativos que você tem na carteira ficam listados aqui, junto com seu Lucro/Prejuízo exibido em tempo real piscando na tela.</li>
              <li style={{ marginTop: '0.5rem' }}><strong style={{ color: '#fff' }}>Relógio de Mercado:</strong> Indica se você pode negociar agora. 
                <span style={{ color: '#26a69a' }}> 🟢 Aberto</span>, 
                <span style={{ color: '#ff9800' }}> 🟠 Fechando</span> (faltam menos de 5 min para o mercado fechar), e 
                <span style={{ color: '#ef5350' }}> 🔴 Fechado</span> (as sextas após as 18h e fds. Operações ficam bloqueadas).
              </li>
            </ul>
            <p style={{ fontSize: '0.85rem', color: '#888', fontStyle: 'italic', marginTop: '1.5rem', textAlign: 'center' }}>
              Lembre-se: Como este é um simulador, suas ordens não afetam o mercado real local (da B3). O saldo utilizado é totalmente virtual.
            </p>
          </div>
        </div>
      )}
    </Container>
  );
};

export default MainSimulator;
