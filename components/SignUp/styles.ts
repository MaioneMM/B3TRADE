import styled from 'styled-components';

export const Container = styled.div`
  * {
    padding: 0;
    margin: 0;
  }

  display: flex;
  justify-content: center;
  align-items: center;
  height: calc(100vh - 80px);
  text-align: center;

  main {
    display: flex;
    flex-direction: column;
    background-color: var(--background-light);
    min-height: 50%;
    width: 100%;
    max-width: 35rem;
    justify-content: space-evenly;
    padding: 2rem;
    margin: 1rem;
    border-radius: 1rem;
    box-shadow: 4px 4px 4px rgba(0, 0, 0, 0.2);
    color: var(--text);

    @media (prefers-color-scheme: dark) {
      color: #fafafa;
    }

    p {
      a {
        display: block;
        margin-top: 1rem;
        font-weight: bold;
        color: var(--main-dark);
        transition: color 0.2s ease;

        @media (prefers-color-scheme: dark) {
          color: var(--main-light);
        }

        &:hover {
          color: var(--main);
        }
      }
    }

    .button-leave {
      background-color: #f22;
    }

    button {
      display: flex;
      align-items: center;
      justify-content: center;
      width: 100%;
      padding: 1rem;
      font-size: 1rem;
      font-weight: bold;
      color: #fafafa;
      background-color: var(--main-dark);
      transition: opacity 0.3s ease;

      svg {
        margin-right: 1rem;
      }

      &:hover {
        opacity: 0.9;
      }

      &:active {
        opacity: 1;
      }
    }

    form {
      display: flex;
      flex-direction: column;
      gap: 1rem;
      width: 100%;
      margin-bottom: 2rem;

      input {
        padding: 0.8rem;
        border-radius: 0.5rem;
        border: 1px solid #ccc;
        font-size: 1rem;
        background-color: var(--background);
        color: var(--text);

        @media (prefers-color-scheme: dark) {
          background-color: #222;
          color: #fafafa;
          border-color: #444;
        }
      }

      .error-msg {
        color: #ff4d4d;
        font-size: 0.875rem;
        text-align: left;
      }

      .separator {
        display: flex;
        align-items: center;
        text-align: center;
        color: #888;
        margin: 1rem 0;

        &::before,
        &::after {
          content: '';
          flex: 1;
          border-bottom: 1px solid #ddd;
        }

        &::not(:empty)::before {
          margin-right: .25em;
        }

        &::not(:empty)::after {
          margin-left: .25em;
        }

        @media (prefers-color-scheme: dark) {
          border-bottom-color: #444;
        }
      }
    }

    .info-container {
      margin-top: 5rem;
      display: flex;
      text-align: left;
      justify-content: center;

      img {
        width: 3rem;
        height: 3rem;
        border-radius: 50%;
        border: 2px solid var(--main);
        margin-right: 1rem;
      }
    }

    .text-container {
      color: var(--text);
    }
  }
`;
