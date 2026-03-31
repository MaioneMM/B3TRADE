import styled from 'styled-components';

export const Container = styled.div`
  max-width: 900px;
  margin: 0 auto;
  padding: 2rem;
  color: var(--text);

  h1 {
    text-align: center;
    font-size: 2.2rem;
    margin-bottom: 0.5rem;
    color: #26a69a;
  }
    
  .subtitle {
    text-align: center;
    color: #aaa;
    font-size: 0.95rem;
    margin-bottom: 2rem;
    
    strong {
      color: #ef5350;
    }
  }

  .tabs {
    display: flex;
    justify-content: center;
    gap: 1rem;
    margin-bottom: 2rem;

    button {
      background: #1e1e24;
      border: 1px solid #333;
      padding: 0.8rem 2rem;
      border-radius: 8px;
      color: #ccc;
      font-weight: bold;
      cursor: pointer;
      transition: 0.2s;

      &:hover {
        background: #2a2a35;
      }

      &.active {
        background: #26a69a;
        color: #fff;
        border-color: #26a69a;
      }
    }
  }

  .ranking-list {
    background: #1e1e24;
    border-radius: 12px;
    border: 1px solid #333;
    overflow: hidden;

    .row {
      display: flex;
      align-items: center;
      padding: 1rem 1.5rem;
      border-bottom: 1px solid #2a2a35;
      transition: background 0.2s;

      &:last-child {
        border-bottom: none;
      }

      &:hover {
        background: #25252d;
      }

      .pos {
        width: 40px;
        font-size: 1.2rem;
        font-weight: bold;
        color: #777;

        &.gold { color: #FFD700; font-size: 1.4rem; }
        &.silver { color: #C0C0C0; font-size: 1.3rem; }
        &.bronze { color: #CD7F32; font-size: 1.25rem; }
      }

      .avatar {
        width: 40px;
        height: 40px;
        border-radius: 50%;
        background: #444;
        margin-right: 1rem;
        object-fit: cover;
      }

      .name {
        flex: 1;
        font-weight: 500;
        font-size: 1.05rem;
      }

      .pnl {
        font-weight: bold;
        font-size: 1.1rem;

        &.positive { color: #26a69a; }
        &.negative { color: #ef5350; }
        &.neutral { color: #888; }
      }
    }
    
    .empty {
      padding: 3rem;
      text-align: center;
      color: #777;
    }
  }
`;
