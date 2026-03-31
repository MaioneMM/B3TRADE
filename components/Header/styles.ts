import styled, { css, keyframes } from 'styled-components';

interface MenuProps {
  open: boolean;
  $scrolled: boolean;
}

const slideDown = keyframes`
  from { opacity: 0; transform: translateY(-8px); }
  to   { opacity: 1; transform: translateY(0); }
`;

export const Container = styled.header<MenuProps>`
  position: sticky;
  top: 0;
  z-index: 100;
  transition: all 0.3s ease;

  ${(props) =>
    props.$scrolled
      ? css`
          background: rgba(8,11,18,0.85);
          backdrop-filter: blur(20px);
          -webkit-backdrop-filter: blur(20px);
          border-bottom: 1px solid rgba(255,255,255,0.06);
          box-shadow: 0 8px 32px rgba(0,0,0,0.3);
        `
      : css`
          background: transparent;
          border-bottom: 1px solid transparent;
        `}

  .nav-inner {
    display: flex;
    align-items: center;
    justify-content: space-between;
    max-width: 1200px;
    margin: 0 auto;
    padding: 0 2rem;
    height: 72px;
    gap: 2rem;
  }

  /* Logo */
  .logo-link {
    display: flex;
    align-items: center;
    flex-shrink: 0;

    svg, div {
      height: 32px !important;
      width: auto !important;
    }
  }

  /* Desktop nav links */
  .desktop-nav {
    display: flex;
    align-items: center;
    gap: 0.25rem;
    flex: 1;
    justify-content: center;
  }

  .nav-link {
    font-size: 0.9rem;
    font-weight: 500;
    color: #94a3b8;
    padding: 0.45rem 0.85rem;
    border-radius: 8px;
    transition: all 0.15s ease;
    white-space: nowrap;

    &:hover {
      color: #f1f5f9;
      background: rgba(255,255,255,0.06);
    }
  }

  /* Right side actions */
  .nav-actions {
    display: flex;
    align-items: center;
    gap: 0.5rem;
    flex-shrink: 0;
  }

  .desktop-only {
    @media (max-width: 768px) {
      display: none;
    }
  }

  .btn-nav-cta {
    font-size: 0.875rem;
    font-weight: 700;
    color: #fff;
    background: linear-gradient(135deg, var(--main) 0%, #2D6A4F 100%);
    padding: 0.5rem 1.2rem;
    border-radius: 8px;
    white-space: nowrap;
    transition: all 0.2s ease;
    box-shadow: 0 0 16px rgba(82,183,136,0.25);

    &:hover {
      box-shadow: 0 0 24px rgba(82,183,136,0.45);
      transform: translateY(-1px);
    }
  }

  /* Profile picture */
  .avatar-link {
    display: flex;
  }

  .profile-picture {
    width: 2.25rem;
    height: 2.25rem;
    border-radius: 50%;
    border: 2px solid var(--main);
    transition: opacity 0.2s;

    &:hover { opacity: 0.85; }
  }

  /* Mobile toggle button */
  .mobile-toggle {
    display: none;
    color: #94a3b8;
    padding: 0.4rem;
    border-radius: 8px;
    transition: all 0.15s ease;

    &:hover {
      color: var(--text);
      background: rgba(255,255,255,0.06);
    }
  }

  /* Mobile nav drawer */
  .mobile-nav {
    display: none;
    flex-direction: column;
    padding: 0.75rem 1.5rem 1.5rem;
    background: rgba(8,11,18,0.97);
    backdrop-filter: blur(20px);
    border-top: 1px solid rgba(255,255,255,0.06);
    animation: ${slideDown} 0.2s ease both;
  }

  .mobile-link {
    font-size: 1rem;
    font-weight: 500;
    color: #94a3b8;
    padding: 0.85rem 0.5rem;
    border-bottom: 1px solid rgba(255,255,255,0.05);
    transition: color 0.15s ease;

    &:hover { color: var(--text); }

    &.highlight {
      color: var(--main-light);
      font-weight: 700;
      border-bottom: none;
    }
  }

  .mobile-divider {
    height: 1px;
    background: rgba(255,255,255,0.05);
    margin: 0.5rem 0;
  }

  /* ─── Responsive ─── */
  @media (max-width: 768px) {
    .desktop-nav {
      display: none;
    }

    .mobile-toggle {
      display: flex;
    }

    .mobile-nav {
      display: flex;
    }

    .nav-inner {
      padding: 0 1.25rem;
    }
  }
`;
