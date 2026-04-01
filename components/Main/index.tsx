import React from 'react';
import Link from 'next/link';
import { Container } from './styles';

const Main: React.FC = () => {
  return (
    <Container>
      {/* ── BACKGROUND ESPACIAL / MESH ── */}
      <div className="grid-bg" />
      <div className="glow-sphere left" />
      <div className="glow-sphere right" />

      {/* ── HERO ── */}
      <section className="hero">
        <div className="hero-left">
          {/* MOCKUP DASHBOARD */}
          <div className="mockup-dashboard">
            <div className="md-sidebar">
              <div className="md-icon lightning">⚡</div>
              <div className="md-icon active">📊</div>
              <div className="md-icon">📈</div>
              <div className="md-icon">💼</div>
              <div className="md-icon">⚙️</div>
              <div className="md-icon bottom">→</div>
            </div>
            
            <div className="md-main">
              <div className="md-header">
                <nav className="md-nav">
                  <span className="active">DASHBOARD</span>
                  <span>MARKETS</span>
                  <span>PORTFOLIO</span>
                  <span>SETTINGS</span>
                </nav>
                <div className="md-controls">
                  <span className="md-btn">A/A</span>
                  <span className="md-btn">🔔</span>
                  <span className="md-btn">👤</span>
                  <span className="md-btn">⚙️</span>
                </div>
              </div>
              
              <div className="md-content">
                <div className="md-chart-area">
                  <div className="md-chart-header">
                    <h3>SIM BTC/USD | 1D</h3>
                    <div className="md-legend">
                      <span className="leg green">Legende</span>
                      <span className="leg blue">Curve</span>
                      <span className="leg red">Indicators</span>
                    </div>
                  </div>
                  
                  <div className="md-chart-canvas">
                    <div className="y-axis">
                      <span>50,000</span>
                      <span>40,000</span>
                      <span className="highlight">39,842</span>
                      <span>30,000</span>
                      <span>20,000</span>
                      <span>10,000</span>
                    </div>
                    <div className="svg-container">
                      <svg viewBox="0 0 500 250" preserveAspectRatio="none">
                        <line x1="0" y1="41" x2="500" y2="41" stroke="rgba(255,255,255,0.05)" strokeWidth="1"/>
                        <line x1="0" y1="83" x2="500" y2="83" stroke="rgba(255,255,255,0.05)" strokeWidth="1"/>
                        <line x1="0" y1="125" x2="500" y2="125" stroke="rgba(255,255,255,0.05)" strokeWidth="1" strokeDasharray="4 4"/>
                        <line x1="0" y1="166" x2="500" y2="166" stroke="rgba(255,255,255,0.05)" strokeWidth="1"/>
                        <line x1="0" y1="208" x2="500" y2="208" stroke="rgba(255,255,255,0.05)" strokeWidth="1"/>
                        
                        <path d="M0 200 Q 100 220 200 150 T 350 180 T 500 50" fill="none" stroke="#22c55e" strokeWidth="2.5" filter="drop-shadow(0 0 6px #22c55e)"/>
                        <path d="M0 230 Q 100 190 200 180 T 350 200 T 500 80" fill="none" stroke="#3b82f6" strokeWidth="2" filter="drop-shadow(0 0 6px #3b82f6)"/>
                         
                        <g className="candles">
                          <rect x="50" y="180" width="4" height="40" fill="#22c55e" />
                          <line x1="52" y1="170" x2="52" y2="230" stroke="#22c55e" />
                          <rect x="150" y="160" width="4" height="60" fill="#ef4444" />
                          <line x1="152" y1="150" x2="152" y2="230" stroke="#ef4444" />
                          <rect x="250" y="140" width="4" height="40" fill="#22c55e" />
                          <line x1="252" y1="130" x2="252" y2="190" stroke="#22c55e" />
                          <rect x="350" y="100" width="4" height="60" fill="#22c55e" />
                          <line x1="352" y1="90" x2="352" y2="170" stroke="#22c55e" />
                          <rect x="450" y="50" width="4" height="80" fill="#ef4444" />
                          <line x1="452" y1="40" x2="452" y2="140" stroke="#ef4444" />
                          <rect x="480" y="60" width="4" height="30" fill="#22c55e" />
                        </g>
                      </svg>
                    </div>
                  </div>
                  
                  <div className="md-volume-canvas">
                     <span className="vol-title">Volume <span className="vol-val">1000.0</span></span>
                     <svg viewBox="0 0 500 50" preserveAspectRatio="none">
                       <rect x="20" y="30" width="6" height="20" fill="#22c55e" />
                       <rect x="40" y="20" width="6" height="30" fill="#22c55e" />
                       <rect x="60" y="10" width="6" height="40" fill="#ef4444" />
                       <rect x="80" y="25" width="6" height="25" fill="#22c55e" />
                       <rect x="100" y="15" width="6" height="35" fill="#ef4444" />
                       <rect x="150" y="20" width="6" height="30" fill="#22c55e" />
                       <rect x="200" y="5" width="6" height="45" fill="#22c55e" />
                       <rect x="250" y="35" width="6" height="15" fill="#ef4444" />
                       <rect x="300" y="15" width="6" height="35" fill="#ef4444" />
                       <rect x="350" y="25" width="6" height="25" fill="#22c55e" />
                       <rect x="400" y="20" width="6" height="30" fill="#ef4444" />
                       <rect x="450" y="10" width="6" height="40" fill="#22c55e" />
                     </svg>
                     <div className="x-axis">
                       <span>Feb</span><span>Mar</span><span>Apr</span><span>May</span><span>Jun</span><span>Jul</span><span>Aug</span><span>Sep</span><span>Oct</span>
                     </div>
                  </div>
                </div>
                
                <div className="md-right-panel">
                  <div className="md-price-block">
                     <h2 className="current-price">$39,842.15 <span className="pct">+3.4%</span></h2>
                     <div className="price-details">
                        <div className="col">
                          <span className="lbl">Current</span>
                          <span className="val green">$30,043.15</span>
                        </div>
                        <div className="col">
                          <span className="lbl">Exchange</span>
                          <span className="val red">-1.22%</span>
                        </div>
                     </div>
                  </div>
                  
                  <div className="md-watchlist">
                     <h4>Watchlist</h4>
                     <div className="wl-item">
                        <div className="wl-sym">BTC<span className="desc">BTC/USD</span></div>
                        <div className="wl-prc">$39,842.15<span className="pct green">+3.42%</span></div>
                     </div>
                     <div className="wl-item">
                        <div className="wl-sym">ETH<span className="desc">ETH/USD</span></div>
                        <div className="wl-prc">$223.30<span className="pct red">-0.30%</span></div>
                     </div>
                     <div className="wl-item">
                        <div className="wl-sym">USD<span className="desc">DXY</span></div>
                        <div className="wl-prc">$75.48<span className="pct green">+2.20%</span></div>
                     </div>
                     <div className="wl-item">
                        <div className="wl-sym">EBX<span className="desc">EBX/USD</span></div>
                        <div className="wl-prc">$208.97<span className="pct red">-3.22%</span></div>
                     </div>
                  </div>
                  
                  <div className="md-performance">
                     <h4>Performance</h4>
                     <div className="perf-item">
                        <span>Performance</span><span className="green">+13.30%</span>
                     </div>
                     <div className="perf-item">
                        <span>Volume</span><span className="green">+0.005</span>
                     </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="hero-right">
          <h1 className="hero-title">
            Professional<br/>
            Trading<br/>
            Interface
          </h1>
          <p className="hero-desc">
            Experience real-time markets. Build strategies in a powerful, simulation environment.
          </p>
          <Link href="/simulator" className="btn-primary">
            Start Trading
          </Link>
        </div>
      </section>
    </Container>
  );
};

export default Main;
