import styled from 'styled-components';

export const Container = styled.div`
  display: flex;
  flex-direction: column;
  padding: 2rem;
  min-height: calc(100vh - 80px);
  background-color: var(--background);

  h1 {
    color: var(--text);
    margin-bottom: 2rem;
  }
`;

export const SimulatorGrid = styled.div`
  display: grid;
  grid-template-columns: 3fr 1fr;
  gap: 2rem;
  min-height: 65vh;
  align-items: stretch;

  @media (max-width: 1024px) {
    grid-template-columns: 1fr;
    height: auto;
  }
`;

export const ChartContainer = styled.div`
  background-color: var(--background-light);
  border-radius: 8px;
  box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1);
  overflow: hidden;
  display: flex;
  flex-direction: column;

  .chart-header {
    padding: 1rem;
    border-bottom: 1px solid #333;
    display: flex;
    justify-content: space-between;
    align-items: center;

    select {
      background-color: var(--background);
      color: var(--text);
      border: 1px solid #444;
      padding: 0.5rem;
      border-radius: 4px;
    }
  }

  .chart-area {
    flex: 1;
    width: 100%;
    min-height: 500px;
  }
`;

export const OrderPanelContainer = styled.div`
  background-color: var(--background-light);
  border-radius: 8px;
  padding: 1.5rem;
  box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1);

  h2 {
    margin-bottom: 1rem;
    font-size: 1.25rem;
  }

  .panel-body {
    display: flex;
    flex-direction: column;
    gap: 1rem;
  }

  button {
    width: 100%;
    padding: 1rem;
    font-weight: bold;
    color: white;
    border: none;
    border-radius: 4px;
    cursor: pointer;
    transition: opacity 0.2s;

    &:hover {
      opacity: 0.9;
    }

    &.buy {
      background-color: #00c853;
    }

    &.sell {
      background-color: #d50000;
    }
  }
`;
