import styled from 'styled-components';

export const Container = styled.div`
  max-width: 900px;
  margin: 0 auto;
  padding: 2rem;
  padding-top: 100px;
  color: var(--text);

  h1 {
    text-align: center;
    font-size: 2rem;
    margin-bottom: 0.5rem;
    color: var(--text);
  }

  .subtitle {
    text-align: center;
    color: #aaa;
    font-size: 0.9rem;
    margin-bottom: 2rem;
    line-height: 1.6;

    strong {
      color: #26a69a;
    }
  }

  .tabs {
    display: flex;
    justify-content: center;
    gap: 0.75rem;
    margin-bottom: 2rem;

    button {
      background: #1e1e24;
      border: 1px solid #333;
      padding: 0.65rem 1.75rem;
      border-radius: 6px;
      color: #aaa;
      font-size: 0.9rem;
      font-weight: 600;
      cursor: pointer;
      transition: all 0.2s;

      &:hover {
        background: #2a2a35;
        border-color: #555;
        color: var(--text);
      }

      &.active {
        background: rgba(38,166,154,0.15);
        border-color: #26a69a;
        color: #26a69a;
      }
    }
  }

  .ranking-list {
    background: #1e1e24;
    border-radius: 10px;
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
        background: #25252f;
      }

      .pos {
        width: 44px;
        font-size: 1.1rem;
        font-weight: bold;
        color: #666;
        flex-shrink: 0;
      }

      .avatar {
        width: 38px;
        height: 38px;
        border-radius: 50%;
        background: #333;
        margin-right: 1rem;
        object-fit: cover;
        flex-shrink: 0;
        border: 2px solid #444;
      }

      .name {
        flex: 1;
        font-weight: 500;
        font-size: 0.95rem;
        color: var(--text);
      }

      .pnl {
        font-weight: bold;
        font-size: 1rem;

        &.positive { color: #26a69a; }
        &.negative { color: #ef5350; }
        &.neutral   { color: #888; }
      }
    }

    .empty {
      padding: 3rem;
      text-align: center;
      color: #666;
      font-size: 0.95rem;
    }
  }
`;
