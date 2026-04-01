import { createGlobalStyle } from 'styled-components';

const GlobalStyle = createGlobalStyle`
  :root {
    --text: #f5f5f7;
    --text-muted: #a1a1aa;
    --background: #000000;
    --background-light: #09090b;
    --background-card: #18181b;
    --border: rgba(255,255,255,0.08);
    --main: #10b981;
    --main-dark: #047857;
    --main-light: #34d399;
  }

  * {
    box-sizing: border-box;
    margin: 0;
    padding: 0;
  }

  html {
    scroll-behavior: smooth;
    background-color: var(--background);
  }

  body {
    padding: 0;
    margin: 0;
    font-family: 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif;
    font-weight: 400;
    background-color: var(--background);
    color: var(--text);
    -webkit-font-smoothing: antialiased;
    -moz-osx-font-smoothing: grayscale;
  }

  a {
    text-decoration: none;
    color: inherit;
  }

  input, button {
    border: none;
    outline: none;
    font-family: inherit;
  }

  button {
    cursor: pointer;
    background-color: transparent;
  }

  code, pre {
    font-family: 'JetBrains Mono', monospace;
  }

  ::-webkit-scrollbar {
    width: 6px;
  }
  ::-webkit-scrollbar-track {
    background: var(--background);
  }
  ::-webkit-scrollbar-thumb {
    background: var(--border);
    border-radius: 3px;
    
    &:hover {
      background: rgba(255,255,255,0.2);
    }
  }
`;

export default GlobalStyle;
