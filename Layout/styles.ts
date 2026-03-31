import { createGlobalStyle } from 'styled-components';

const GlobalStyle = createGlobalStyle`
  :root {
    --text: #f1f5f9;
    --text-muted: #94a3b8;
    --background: #080b12;
    --background-light: #0d1117;
    --background-card: #111827;
    --border: rgba(255,255,255,0.08);
    --main: #52B788;
    --main-dark: #2D6A4F;
    --main-light: #95D5B2;
    --accent-purple: #a855f7;
    --accent-blue: #3b82f6;
    --gradient-text: linear-gradient(135deg, #52B788 0%, #a855f7 50%, #3b82f6 100%);
    --gradient-glow: linear-gradient(135deg, rgba(82,183,136,0.15) 0%, rgba(168,85,247,0.15) 100%);
  }

  * {
    box-sizing: border-box;
    margin: 0;
    padding: 0;
  }

  html {
    scroll-behavior: smooth;
  }

  body {
    padding: 0;
    margin: 0;
    font-family: 'Inter', sans-serif;
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
    font-family: 'Inter', sans-serif;
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
  }
`;

export default GlobalStyle;
