import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import './styles/tailwind.css';
import App from './App';
import { startErrorMonitoring } from './lib/monitoring';

startErrorMonitoring(import.meta.env.VITE_SENTRY_DSN as string | undefined, import.meta.env.MODE);

const rootElement = document.getElementById('root');

if (rootElement) {
  createRoot(rootElement).render(
    <StrictMode>
      <App />
    </StrictMode>,
  );
}
