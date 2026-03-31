import styled, { keyframes } from 'styled-components';

const fadeIn = keyframes`
  from { opacity: 0; transform: translateY(20px); }
  to   { opacity: 1; transform: translateY(0); }
`;

const blink = keyframes`
  0%, 100% { opacity: 1; }
  50% { opacity: 0; }
`;

const float = keyframes`
  0%, 100% { transform: translateY(0px) scale(1); }
  50% { transform: translateY(-20px) scale(1.05); }
`;

const shimmer = keyframes`
  0% { background-position: -200% center; }
  100% { background-position: 200% center; }
`;

const pulse = keyframes`
  0%, 100% { box-shadow: 0 0 0 0 rgba(82,183,136,0.4); }
  50% { box-shadow: 0 0 0 8px rgba(82,183,136,0); }
`;

export const Container = styled.div`
  position: relative;
  overflow-x: hidden;
  color: var(--text);

  /* ─── Background orbs ─── */
  .bg-orb {
    position: fixed;
    border-radius: 50%;
    filter: blur(120px);
    pointer-events: none;
    z-index: 0;
    animation: ${float} 8s ease-in-out infinite;
  }
  .orb-1 {
    width: 500px;
    height: 500px;
    background: radial-gradient(circle, rgba(82,183,136,0.12) 0%, transparent 70%);
    top: -100px;
    left: -100px;
  }
  .orb-2 {
    width: 600px;
    height: 600px;
    background: radial-gradient(circle, rgba(168,85,247,0.1) 0%, transparent 70%);
    top: 200px;
    right: -150px;
    animation-delay: -4s;
  }

  /* ─── Gradient Text ─── */
  .gradient-text {
    background: var(--gradient-text);
    background-size: 200% auto;
    -webkit-background-clip: text;
    -webkit-text-fill-color: transparent;
    background-clip: text;
    animation: ${shimmer} 4s linear infinite;
  }

  /* ─── HERO ─── */
  .hero {
    position: relative;
    z-index: 1;
    min-height: calc(100vh - 80px);
    display: grid;
    grid-template-columns: 1fr 1fr;
    align-items: center;
    gap: 4rem;
    max-width: 1200px;
    margin: 0 auto;
    padding: 5rem 2rem 6rem;
    animation: ${fadeIn} 0.8s ease both;
  }

  .hero-left {
    display: flex;
    flex-direction: column;
    gap: 1.5rem;
  }

  .hero-badge {
    display: inline-flex;
    align-items: center;
    gap: 0.5rem;
    background: rgba(82,183,136,0.1);
    border: 1px solid rgba(82,183,136,0.3);
    color: var(--main-light);
    font-size: 0.8rem;
    font-weight: 600;
    padding: 0.4rem 1rem;
    border-radius: 100px;
    width: fit-content;
    letter-spacing: 0.03em;
    text-transform: uppercase;
  }

  .badge-dot {
    width: 7px;
    height: 7px;
    border-radius: 50%;
    background: var(--main);
    animation: ${pulse} 2s ease-in-out infinite;
  }

  .hero-title {
    font-size: clamp(2.4rem, 5vw, 3.8rem);
    font-weight: 900;
    line-height: 1.1;
    letter-spacing: -0.03em;
    color: var(--text);
  }

  .hero-desc {
    font-size: 1.05rem;
    line-height: 1.7;
    color: var(--text-muted);
    max-width: 480px;
  }

  .hero-actions {
    display: flex;
    gap: 1rem;
    flex-wrap: wrap;
  }

  .hero-hint {
    font-size: 0.8rem;
    color: var(--text-muted);
    opacity: 0.8;
  }

  /* ─── Buttons ─── */
  .btn-primary {
    display: inline-flex;
    align-items: center;
    gap: 0.4rem;
    background: linear-gradient(135deg, var(--main) 0%, #2D6A4F 100%);
    color: #fff;
    font-weight: 700;
    font-size: 0.95rem;
    padding: 0.75rem 1.75rem;
    border-radius: 10px;
    transition: all 0.2s ease;
    box-shadow: 0 0 24px rgba(82,183,136,0.3);
    letter-spacing: 0.01em;

    &:hover {
      transform: translateY(-2px);
      box-shadow: 0 0 36px rgba(82,183,136,0.5);
    }
    &:active { transform: translateY(0); }
  }

  .btn-secondary {
    display: inline-flex;
    align-items: center;
    background: rgba(255,255,255,0.05);
    border: 1px solid var(--border);
    color: var(--text);
    font-weight: 600;
    font-size: 0.95rem;
    padding: 0.75rem 1.75rem;
    border-radius: 10px;
    transition: all 0.2s ease;
    backdrop-filter: blur(8px);

    &:hover {
      background: rgba(255,255,255,0.09);
      border-color: rgba(255,255,255,0.18);
      transform: translateY(-2px);
    }
  }

  .btn-ghost {
    display: inline-flex;
    align-items: center;
    color: var(--text-muted);
    font-weight: 600;
    font-size: 0.95rem;
    padding: 0.75rem 1.25rem;
    border-radius: 10px;
    transition: all 0.2s ease;

    &:hover { color: var(--text); }
  }

  /* ─── Terminal ─── */
  .hero-right {
    display: flex;
    justify-content: center;
  }

  .terminal {
    width: 100%;
    max-width: 500px;
    background: #0d1117;
    border: 1px solid rgba(255,255,255,0.1);
    border-radius: 16px;
    overflow: hidden;
    box-shadow:
      0 0 0 1px rgba(255,255,255,0.05),
      0 40px 80px rgba(0,0,0,0.6),
      0 0 60px rgba(82,183,136,0.08);
  }

  .terminal-bar {
    display: flex;
    align-items: center;
    gap: 0.5rem;
    padding: 0.75rem 1rem;
    background: #161b22;
    border-bottom: 1px solid rgba(255,255,255,0.06);
  }

  .dot {
    width: 12px;
    height: 12px;
    border-radius: 50%;
    &.red    { background: #ff5f57; }
    &.yellow { background: #febc2e; }
    &.green  { background: #28c840; }
  }

  .terminal-title {
    margin-left: 0.5rem;
    font-size: 0.75rem;
    color: #64748b;
    font-family: 'JetBrains Mono', monospace;
  }

  .terminal-body {
    padding: 1.25rem 1.5rem 1.5rem;
    font-family: 'JetBrains Mono', monospace;
    font-size: 0.78rem;
    line-height: 1.8;
    min-height: 300px;
    overflow: hidden;
  }

  .terminal-line {
    display: block;
    animation: ${fadeIn} 0.2s ease both;
  }

  .cursor {
    display: inline-block;
    color: var(--main);
    animation: ${blink} 1s step-end infinite;
    font-family: 'JetBrains Mono', monospace;
  }

  /* ─── Stats ─── */
  .stats-section {
    position: relative;
    z-index: 1;
    display: grid;
    grid-template-columns: repeat(4, 1fr);
    gap: 1.5rem;
    max-width: 1200px;
    margin: 0 auto;
    padding: 0 2rem 5rem;
    animation: ${fadeIn} 0.8s ease 0.2s both;
  }

  .stat-card {
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 0.25rem;
    background: rgba(255,255,255,0.03);
    border: 1px solid var(--border);
    border-radius: 14px;
    padding: 1.5rem;
    transition: all 0.2s ease;

    &:hover {
      background: rgba(255,255,255,0.06);
      border-color: rgba(82,183,136,0.3);
      transform: translateY(-3px);
    }
  }

  .stat-value {
    font-size: 1.8rem;
    font-weight: 800;
    background: var(--gradient-text);
    background-size: 200% auto;
    -webkit-background-clip: text;
    -webkit-text-fill-color: transparent;
    background-clip: text;
  }

  .stat-label {
    font-size: 0.82rem;
    color: var(--text-muted);
    font-weight: 500;
  }

  /* ─── Partners ─── */
  .partners-section {
    position: relative;
    z-index: 1;
    max-width: 1200px;
    margin: 0 auto;
    padding: 0 2rem 6rem;
    text-align: center;
  }

  .partners-label {
    font-size: 0.8rem;
    font-weight: 600;
    text-transform: uppercase;
    letter-spacing: 0.1em;
    color: var(--text-muted);
    margin-bottom: 1.5rem;
  }

  .partners-logos {
    display: flex;
    align-items: center;
    justify-content: center;
    gap: 3rem;
    flex-wrap: wrap;
  }

  .partner-logo {
    font-size: 1rem;
    font-weight: 800;
    letter-spacing: 0.06em;
    color: #475569;
    transition: color 0.2s ease;
    text-transform: uppercase;

    &:hover { color: var(--text-muted); }
  }

  /* ─── Features ─── */
  .features-section {
    position: relative;
    z-index: 1;
    max-width: 1200px;
    margin: 0 auto;
    padding: 0 2rem 8rem;
  }

  .section-header {
    text-align: center;
    margin-bottom: 3.5rem;

    h2 {
      font-size: clamp(1.8rem, 3.5vw, 2.6rem);
      font-weight: 800;
      letter-spacing: -0.02em;
      margin-bottom: 0.75rem;
    }

    p {
      font-size: 1.05rem;
      color: var(--text-muted);
      max-width: 520px;
      margin: 0 auto;
      line-height: 1.7;
    }
  }

  .features-grid {
    display: grid;
    grid-template-columns: repeat(3, 1fr);
    gap: 1.25rem;
  }

  .feature-card {
    background: rgba(255,255,255,0.03);
    border: 1px solid var(--border);
    border-radius: 16px;
    padding: 1.75rem;
    display: flex;
    flex-direction: column;
    gap: 0.75rem;
    transition: all 0.25s ease;
    position: relative;
    overflow: hidden;

    &::before {
      content: '';
      position: absolute;
      inset: 0;
      background: var(--gradient-glow);
      opacity: 0;
      transition: opacity 0.3s ease;
      border-radius: 16px;
    }

    &:hover {
      border-color: rgba(82,183,136,0.25);
      transform: translateY(-4px);
      box-shadow: 0 20px 40px rgba(0,0,0,0.3);

      &::before { opacity: 1; }
    }

    .feature-icon {
      font-size: 1.8rem;
      line-height: 1;
    }

    h3 {
      font-size: 1rem;
      font-weight: 700;
      color: var(--text);
    }

    p {
      font-size: 0.875rem;
      color: var(--text-muted);
      line-height: 1.65;
    }
  }

  /* ─── CTA ─── */
  .cta-section {
    position: relative;
    z-index: 1;
    max-width: 1200px;
    margin: 0 auto;
    padding: 0 2rem 8rem;
  }

  .cta-card {
    background: linear-gradient(135deg, rgba(82,183,136,0.08) 0%, rgba(168,85,247,0.08) 100%);
    border: 1px solid rgba(82,183,136,0.2);
    border-radius: 24px;
    padding: 4rem;
    text-align: center;
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 1.5rem;
    position: relative;
    overflow: hidden;

    &::before {
      content: '';
      position: absolute;
      top: 0; left: 0; right: 0;
      height: 1px;
      background: linear-gradient(90deg, transparent, rgba(82,183,136,0.5), rgba(168,85,247,0.5), transparent);
    }

    h2 {
      font-size: clamp(1.6rem, 3vw, 2.2rem);
      font-weight: 800;
      letter-spacing: -0.02em;
    }

    p {
      font-size: 1.05rem;
      color: var(--text-muted);
    }
  }

  .cta-code {
    background: rgba(0,0,0,0.4);
    border: 1px solid var(--border);
    border-radius: 10px;
    padding: 0.75rem 1.5rem;

    code {
      font-family: 'JetBrains Mono', monospace;
      font-size: 0.9rem;
      color: var(--main-light);
    }
  }

  .cta-actions {
    display: flex;
    gap: 1rem;
    flex-wrap: wrap;
    justify-content: center;
  }

  /* ─── Responsive ─── */
  @media (max-width: 900px) {
    .hero {
      grid-template-columns: 1fr;
      padding: 4rem 1.5rem 3rem;
      text-align: center;
      gap: 3rem;
    }

    .hero-left {
      align-items: center;
    }

    .hero-desc { text-align: center; }

    .stats-section {
      grid-template-columns: repeat(2, 1fr);
    }

    .features-grid {
      grid-template-columns: repeat(2, 1fr);
    }
  }

  @media (max-width: 600px) {
    .stats-section {
      grid-template-columns: 1fr 1fr;
    }

    .features-grid {
      grid-template-columns: 1fr;
    }

    .cta-card {
      padding: 2.5rem 1.5rem;
    }

    .partners-logos {
      gap: 1.5rem;
    }
  }
`;
