import styled from 'styled-components';

export const Container = styled.div`
  display: flex;
  flex-direction: column;
  padding: 1rem 2rem;
  min-height: calc(100vh - 80px);
  background-color: var(--background);

  @media (max-width: 768px) {
    padding: 0.8rem 1rem;
  }
`;

export const TopBar = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 1rem;
  padding-bottom: 1rem;
  border-bottom: 1px solid #333;
  gap: 15px;

  @media (max-width: 1024px) {
    flex-direction: column;
    align-items: stretch;
    gap: 12px;
  }

  .left-side {
    display: flex;
    align-items: center;
    gap: 15px;
    flex: 1;

    @media (max-width: 600px) {
      flex-direction: column;
      align-items: flex-start;
      gap: 10px;
    }
  }

  .right-side {
    display: flex;
    align-items: center;
    gap: 15px;

    @media (max-width: 600px) {
      justify-content: space-between;
      width: 100%;
    }
  }
`;

export const SimulatorGrid = styled.div`
  display: grid;
  grid-template-columns: 280px 1fr 300px;
  gap: 1rem;
  height: calc(100vh - 160px);

  @media (max-width: 1400px) {
    grid-template-columns: 280px 1fr 280px;
  }

  @media (max-width: 1200px) {
    grid-template-columns: 280px 1fr;
    height: auto;
  }

  @media (max-width: 768px) {
    grid-template-columns: 1fr;
    display: flex;
    flex-direction: column;
    gap: 15px;
  }
`;

export const Panel = styled.div`
  background-color: var(--background-light);
  border-radius: 8px;
  box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.2);
  display: flex;
  flex-direction: column;
  overflow: hidden;
  border: 1px solid #333;
`;

export const ChartContainer = styled(Panel)`
  @media (max-width: 768px) {
    order: -1; // Keep chart at top
  }

  .chart-header {
    padding: 0.8rem 1rem;
    border-bottom: 1px solid #333;
    display: flex;
    justify-content: space-between;
    align-items: center;
    background-color: #1a1a1e;

    @media (max-width: 900px) {
      flex-direction: column;
      align-items: flex-start;
      gap: 10px;
    }

    .asset-info {
      display: flex;
      align-items: center;
      gap: 1rem;
      flex-wrap: wrap;
    }

    .asset-price {
      display: flex;
      flex-direction: column;
      line-height: 1.2;
    }

    .asset-stats {
      display: flex;
      gap: 1.5rem;
      font-size: 0.8rem;
      color: #aaa;
      
      @media (max-width: 600px) {
        gap: 10px;
        flex-wrap: wrap;
        width: 100%;
      }
      
      .stat-item {
        display: flex;
        flex-direction: column;
        strong {
          color: #eee;
          font-size: 0.85rem;
        }
      }
    }
  }

  .chart-area-wrapper {
    position: relative;
    flex: 1;
    display: flex;
    flex-direction: column;
  }

  .floating-toolbar {
    position: absolute;
    top: 10px;
    left: 10px;
    z-index: 10;
    display: flex;
    gap: 5px;
    background-color: rgba(30, 30, 36, 0.8);
    padding: 4px;
    border-radius: 6px;
    backdrop-filter: blur(4px);
    border: 1px solid #333;

    button {
      background: transparent;
      border: none;
      color: #999;
      font-size: 0.75rem;
      padding: 3px 6px;
      cursor: pointer;
      border-radius: 4px;
      transition: all 0.2s;

      &:hover {
        background-color: #444;
        color: #fff;
      }
      
      &.active {
        color: #26a69a;
        background-color: rgba(38, 166, 154, 0.15);
      }
    }
  }

  .chart-area {
    flex: 1;
    width: 100%;
    min-height: 450px;

    @media (max-width: 768px) {
      min-height: 350px;
    }
  }
`;

export const BoletaContainer = styled(Panel)`
  padding: 1.2rem;

  h2 {
    font-size: 1.1rem;
    margin-bottom: 1rem;
    display: flex;
    justify-content: space-between;
    align-items: center;
    color: #eee;
  }

  .form-group {
    margin-bottom: 1rem;
    label {
      display: block;
      font-size: 0.85rem;
      margin-bottom: 0.4rem;
      color: #aaa;
    }
    input, select {
      width: 100%;
      padding: 0.7rem;
      border-radius: 4px;
      border: 1px solid #444;
      background-color: var(--background);
      color: var(--text);
      box-sizing: border-box;
    }
  }

  .action-buttons {
    display: flex;
    flex-direction: column;
    gap: 0.8rem;
    margin-top: 1.5rem;

    @media (max-width: 768px) {
      display: grid;
      grid-template-columns: 1fr 1fr;
    }

    button {
      padding: 1rem;
      font-weight: bold;
      color: white;
      border: none;
      border-radius: 4px;
      cursor: pointer;
      transition: opacity 0.2s;

      @media (max-width: 768px) {
        padding: 1.2rem 1rem;
      }

      &:hover:not(:disabled) {
        opacity: 0.9;
      }
      &:disabled {
        opacity: 0.4;
        cursor: not-allowed;
      }

      &.buy { background-color: #00c853; }
      &.sell { background-color: #d50000; }
    }
  }
`;

export const ListContainer = styled(Panel)`
  .tabs {
    display: flex;
    border-bottom: 1px solid #333;
    
    button {
      flex: 1;
      padding: 1rem 0;
      background: transparent;
      border: none;
      color: #888;
      cursor: pointer;
      font-weight: bold;
      border-bottom: 2px solid transparent;
      transition: 0.2s;

      &.active {
        color: #26a69a;
        border-bottom-color: #26a69a;
      }
    }
  }

  .list-content {
    padding: 1rem;
    flex: 1;
    overflow-y: auto;

    ul {
      list-style: none;
      padding: 0;
      margin: 0;

      li {
        display: flex;
        justify-content: space-between;
        padding: 0.8rem 0;
        border-bottom: 1px solid #333;
        font-size: 0.85rem;

        &:last-child {
          border-bottom: none;
        }
      }
    }
  }
`;
