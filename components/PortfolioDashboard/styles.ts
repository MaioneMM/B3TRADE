import styled from 'styled-components';

export const DashboardContainer = styled.div`
  max-width: 1200px;
  margin: 0 auto;
  padding: 2rem;
  padding-top: 100px;

  h1 {
    margin-bottom: 1.5rem;
    font-size: 2rem;
  }
`;

export const SummaryGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(280px, 1fr));
  gap: 1.5rem;
  margin-bottom: 2rem;

  .card {
    background: #1e1e24;
    padding: 1.5rem;
    border-radius: 8px;
    border: 1px solid #333;

    h3 {
      font-size: 0.9rem;
      color: #aaa;
      margin: 0 0 0.5rem 0;
      text-transform: uppercase;
      letter-spacing: 1px;
    }

    p {
      font-size: 2rem;
      font-weight: bold;
      margin: 0;
      color: var(--text);
      display: flex;
      align-items: baseline;
      gap: 10px;

      span.sub {
        font-size: 1rem;
        font-weight: normal;
      }
      
      span.positive { color: #26a69a; font-size: 1.25rem; }
      span.negative { color: #ef5350; font-size: 1.25rem; }
    }
  }
`;

export const MainContentGrid = styled.div`
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 2rem;
  margin-bottom: 2rem;

  @media (max-width: 768px) {
    grid-template-columns: 1fr;
  }
  
  .section-card {
    background: #1e1e24;
    padding: 1.5rem;
    border-radius: 8px;
    border: 1px solid #333;

    h2 {
      margin-top: 0;
      margin-bottom: 1rem;
      font-size: 1.25rem;
      border-bottom: 1px solid #333;
      padding-bottom: 0.5rem;
    }
  }
`;

export const PieContainer = styled.div`
  display: flex;
  align-items: center;
  gap: 2rem;

  @media (max-width: 480px) {
    flex-direction: column;
  }

  .pie-wrapper {
    position: relative;
    width: 200px;
    height: 200px;
    border-radius: 50%;
    
    .pie-hole {
      position: absolute;
      top: 50%;
      left: 50%;
      transform: translate(-50%, -50%);
      width: 120px;
      height: 120px;
      background: #1e1e24;
      border-radius: 50%;
    }
  }

  ul.legend {
    list-style: none;
    padding: 0;
    margin: 0;
    flex: 1;
    width: 100%;

    li {
      display: flex;
      align-items: center;
      justify-content: space-between;
      margin-bottom: 0.8rem;
      font-size: 0.9rem;

      .label-col {
        display: flex;
        align-items: center;
        
        .dot {
          width: 12px;
          height: 12px;
          border-radius: 50%;
          display: inline-block;
          margin-right: 8px;
        }
      }
      
      strong {
        font-weight: 500;
      }
    }
  }
`;

export const TableWrapper = styled.div`
  overflow-x: auto;
  
  table {
    width: 100%;
    border-collapse: collapse;
    font-size: 0.9rem;

    th, td {
      text-align: left;
      padding: 0.75rem 0.5rem;
      border-bottom: 1px solid #333;
      white-space: nowrap;
    }

    th {
      color: #888;
      font-weight: 500;
    }

    .positive { color: #26a69a; }
    .negative { color: #ef5350; }
  }
`;
