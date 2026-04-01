import styled, { keyframes } from 'styled-components';

const fadeIn = keyframes`
  from { opacity: 0; transform: translateY(20px); }
  to   { opacity: 1; transform: translateY(0); }
`;

const gridMove = keyframes`
  0% { background-position: 0 0; }
  100% { background-position: 0 40px; }
`;

export const Container = styled.div`
  position: relative;
  overflow-x: hidden;
  color: #fff;
  background-color: #07090e; /* Darker than navy, almost black */
  font-family: 'Inter', sans-serif;
  min-height: 100vh;
  display: flex;
  align-items: center;

  /* ── Background Grid & Orbs ── */
  .grid-bg {
    position: absolute;
    bottom: 0;
    left: 0;
    width: 100%;
    height: 300px;
    background-image: 
      linear-gradient(rgba(255, 255, 255, 0.03) 1px, transparent 1px),
      linear-gradient(90deg, rgba(255, 255, 255, 0.03) 1px, transparent 1px);
    background-size: 40px 40px;
    transform: perspective(600px) rotateX(60deg);
    transform-origin: center bottom;
    z-index: 0;
    animation: ${gridMove} 3s linear infinite;
    pointer-events: none;
    mask-image: linear-gradient(to top, rgba(0,0,0,1), rgba(0,0,0,0));
    will-change: background-position;
  }
  
  .glow-sphere {
    position: absolute;
    border-radius: 50%;
    filter: blur(100px);
    z-index: 0;
    pointer-events: none;
    opacity: 0.4;
  }
  
  .glow-sphere.left {
    background: #3b82f6;
    width: 400px; height: 400px;
    top: 20%; left: -100px;
  }
  
  .glow-sphere.right {
    background: #10b981;
    width: 300px; height: 300px;
    bottom: 10%; right: 10%;
  }

  /* ── HERO ── */
  .hero {
    position: relative;
    z-index: 1;
    width: 100%;
    max-width: 1300px;
    margin: 0 auto;
    padding: 6rem 2rem;
    display: grid;
    grid-template-columns: 1.2fr 1fr;
    gap: 5rem;
    align-items: center;
    animation: ${fadeIn} 1s cubic-bezier(0.16, 1, 0.3, 1) both;
  }

  /* ── MOCKUP DASHBOARD (LEFT) ── */
  .mockup-dashboard {
    background: linear-gradient(#111827, #0f172a) padding-box,
                linear-gradient(135deg, rgba(59, 130, 246, 0.5), rgba(16, 185, 129, 0.5)) border-box;
    border: 1px solid transparent;
    border-radius: 12px;
    display: flex;
    overflow: hidden;
    box-shadow: 0 0 50px rgba(16, 185, 129, 0.15), 0 30px 60px rgba(0,0,0,0.6);
    width: 100%;
  }

  /* Sidebar */
  .md-sidebar {
    width: 60px;
    background: rgba(0,0,0,0.2);
    border-right: 1px solid rgba(255,255,255,0.05);
    display: flex;
    flex-direction: column;
    align-items: center;
    padding: 1.5rem 0;
    gap: 1.5rem;
  }

  .md-icon {
    width: 32px; height: 32px;
    display: flex; align-items: center; justify-content: center;
    border-radius: 8px;
    color: #94a3b8;
    cursor: pointer;
    background: transparent;
    
    &.active {
      background: rgba(34, 197, 94, 0.15);
      color: #22c55e;
    }
    &.lightning {
      color: #3b82f6;
      font-size: 1.2rem;
    }
    &.bottom {
      margin-top: auto;
    }
  }

  /* Main Dash Area */
  .md-main {
    flex: 1;
    display: flex; flex-direction: column;
  }

  /* Header */
  .md-header {
    display: flex; justify-content: space-between; align-items: center;
    padding: 1rem 1.5rem;
    border-bottom: 1px solid rgba(255,255,255,0.05);
  }

  .md-nav {
    display: flex; gap: 1.5rem;
    font-size: 0.75rem;
    font-weight: 600;
    letter-spacing: 0.05em;
    color: #64748b;
    
    span {
      cursor: pointer;
      &.active { color: #22c55e; border-bottom: 2px solid #22c55e; padding-bottom: 0.25rem; }
    }
  }

  .md-controls {
    display: flex; gap: 0.75rem;
    
    .md-btn {
      width: 28px; height: 28px;
      display: flex; align-items: center; justify-content: center;
      background: rgba(255,255,255,0.05);
      border-radius: 6px;
      font-size: 0.8rem;
    }
  }

  /* Content */
  .md-content {
    display: flex;
    padding: 1.5rem;
    gap: 1.5rem;
  }

  /* Chart Area */
  .md-chart-area {
    flex: 2;
    background: rgba(0,0,0,0.1);
    border-radius: 8px;
    padding: 1rem;
    border: 1px solid rgba(255,255,255,0.02);
  }

  .md-chart-header {
    display: flex;
    align-items: center;
    margin-bottom: 1rem;
    
    h3 {
      font-size: 0.85rem;
      color: #f1f5f9;
      margin-right: 1.5rem;
    }
  }

  .md-legend {
    display: flex; gap: 1rem;
    font-size: 0.7rem;
    color: #94a3b8;
    
    .leg {
      display: flex; align-items: center; gap: 0.4rem;
      &::before { content: ''; width: 6px; height: 6px; border-radius: 1px; }
      &.green::before { background: #22c55e; }
      &.blue::before { background: #3b82f6; }
      &.red::before { background: #ef4444; }
    }
  }

  .md-chart-canvas {
    position: relative;
    height: 250px;
    border-right: 1px solid rgba(255,255,255,0.05);
    padding-right: 3rem;
  }

  .y-axis {
    position: absolute;
    right: 0; top: 0; bottom: 0;
    width: 3rem;
    display: flex; flex-direction: column; justify-content: space-between;
    font-size: 0.6rem; color: #475569;
    padding: 0.5rem 0;
    
    .highlight { background: #22c55e; color: #fff; padding: 0.1rem 0.2rem; border-radius: 2px; }
  }

  .svg-container {
    width: 100%; height: 100%;
    svg { width: 100%; height: 100%; overflow: visible; }
  }

  .md-volume-canvas {
    height: 60px;
    margin-top: 1rem;
    position: relative;
    padding-right: 3rem;
    
    .vol-title {
      font-size: 0.65rem; color: #94a3b8;
      position: absolute; top: 0; left: 0;
      .vol-val { color: #22c55e; }
    }
    
    svg { width: 100%; height: 40px; margin-top: 15px; }
    
    .x-axis {
      display: flex; justify-content: space-between;
      font-size: 0.6rem; color: #475569; margin-top: 0.5rem;
    }
  }

  /* Right Panel */
  .md-right-panel {
    flex: 1;
    display: flex; flex-direction: column; gap: 1rem;
  }

  .md-price-block {
    background: rgba(255,255,255,0.02);
    border-radius: 8px; padding: 1rem;
  }

  .current-price {
    font-size: 1.5rem; margin-bottom: 0.5rem;
    .pct { font-size: 0.8rem; background: rgba(34, 197, 94, 0.15); color: #22c55e; padding: 0.1rem 0.4rem; border-radius: 4px; vertical-align: middle; margin-left: 0.5rem; }
  }

  .price-details {
    display: flex; gap: 1rem;
    .col { display: flex; flex-direction: column; gap: 0.2rem; }
    .lbl { font-size: 0.65rem; color: #64748b; }
    .val { font-size: 0.8rem; font-weight: 600; }
  }
  
  .green { color: #22c55e; }
  .red { color: #ef4444; }

  .md-watchlist, .md-performance {
    background: rgba(255,255,255,0.02);
    border-radius: 8px; padding: 1rem;
    flex: 1;
    
    h4 { font-size: 0.75rem; color: #f1f5f9; margin-bottom: 0.5rem; font-weight: 600; }
  }

  .wl-item {
    display: flex; justify-content: space-between; align-items: center;
    padding: 0.4rem 0; border-bottom: 1px solid rgba(255,255,255,0.02);
    &:last-child { border-bottom: none; }
    
    .wl-sym { font-size: 0.8rem; font-weight: 600; display: flex; flex-direction: column; }
    .desc { font-size: 0.6rem; color: #64748b; font-weight: 400; }
    .wl-prc { font-size: 0.8rem; text-align: right; display: flex; flex-direction: column; }
    .pct { font-size: 0.6rem; }
  }

  .perf-item {
    display: flex; justify-content: space-between;
    font-size: 0.75rem; padding: 0.3rem 0;
    color: #94a3b8;
  }

  /* ── RIGHT TEXT (HERO RIGHT) ── */
  .hero-right {
    display: flex;
    flex-direction: column;
    align-items: flex-start;
  }

  .hero-title {
    font-size: clamp(3rem, 5vw, 4.5rem);
    font-weight: 700;
    line-height: 1.1;
    letter-spacing: -0.02em;
    margin-bottom: 1.5rem;
    color: #ffffff;
  }

  .hero-desc {
    font-size: 1.1rem;
    color: #94a3b8;
    max-width: 450px;
    margin-bottom: 2.5rem;
    line-height: 1.6;
  }

  .btn-primary {
    display: inline-block;
    padding: 1rem 2.5rem;
    background: #22c55e; /* Bright Green */
    color: #000;
    font-size: 1rem;
    font-weight: 700;
    border-radius: 30px;
    transition: all 0.3s ease;
    box-shadow: 0 0 20px rgba(34, 197, 94, 0.4);

    &:hover {
      background: #16a34a;
      box-shadow: 0 0 30px rgba(34, 197, 94, 0.6);
      transform: translateY(-2px);
    }
  }

  @media (max-width: 1024px) {
    .hero {
      grid-template-columns: 1fr;
      padding: 4rem 1.5rem;
      gap: 3rem;
      text-align: center;
    }
    
    .hero-right {
      order: -1;
      align-items: center;
      padding: 0;
    }

    .hero-desc {
      margin: 0 auto 2rem;
    }
    
    .mockup-dashboard {
      max-width: 800px;
      margin: 0 auto;
    }
  }

  @media (max-width: 768px) {
    .hero {
      padding: 3rem 1rem;
    }
    .mockup-dashboard {
      flex-direction: column;
    }
    .md-sidebar {
      width: 100%;
      flex-direction: row;
      border-right: none;
      border-bottom: 1px solid rgba(255,255,255,0.05);
      padding: 0.5rem 1rem;
      gap: 1rem;
      justify-content: space-between;
    }
    .md-icon.bottom {
      margin-top: 0;
    }
    .md-content {
      flex-direction: column;
      padding: 1rem;
      gap: 1rem;
    }
    .md-header {
      flex-direction: column;
      gap: 1rem;
      align-items: center;
    }
    .md-nav {
      flex-wrap: wrap;
      justify-content: center;
      gap: 0.8rem;
    }
    .md-chart-area {
      padding: 1rem 0.5rem;
    }
    .md-chart-canvas {
      padding-right: 0;
      border-right: none;
      height: 150px;
    }
    .y-axis {
      display: none; /* Hide Y-Axis on very small screens to save space */
    }
    .md-volume-canvas {
      padding-right: 0;
    }
    .md-legend, .price-details {
      display: none; /* Hide complex legends */
    }
    .md-right-panel {
      width: 100%;
    }
    .md-watchlist, .md-performance {
      padding: 0.5rem;
    }
  }
`;
