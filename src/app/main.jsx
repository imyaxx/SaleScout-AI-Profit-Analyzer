import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';

import '@/shared/i18n/i18n';
import App from './App';

const rootElement = document.getElementById('root');
if (!rootElement) {
  throw new Error('Could not find root element to mount to');
}

createRoot(rootElement).render(
  <StrictMode>
    <App />
  </StrictMode>,
);
