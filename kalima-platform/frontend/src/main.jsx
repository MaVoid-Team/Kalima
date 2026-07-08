import React from 'react'
import ReactDOM from 'react-dom/client'
import { lazy, Suspense } from 'react'
import App from './App.jsx'
import './index.css'
import './i18n';
import { AuthProvider } from './contexts/AuthContext.jsx';
import { CartProvider } from './contexts/CartContext.jsx';
import { NotificationsProvider } from './contexts/NotificationsContext.jsx';

const AgentationPanel = import.meta.env.DEV
  ? lazy(() => import('agentation').then((module) => ({ default: module.Agentation })))
  : null;
window.setTimeout(async () => {
  const Sentry = await import('@sentry/react');

  Sentry.init({
    dsn: import.meta.env.VITE_SENTRY_DSN || 'https://048ba305ef0a02edfe7c9a2b46b16b50@o4511636173488128.ingest.de.sentry.io/4511636192100432',
    environment: import.meta.env.MODE,
    integrations: [Sentry.browserTracingIntegration(), Sentry.replayIntegration()],
    tracesSampleRate: Number(import.meta.env.VITE_SENTRY_TRACES_SAMPLE_RATE ?? '0.1'),
    replaysSessionSampleRate: 0,
    replaysOnErrorSampleRate: 1.0,
  });
}, 10000);

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <AuthProvider>
      <NotificationsProvider>
        <CartProvider>
          <App />
          {AgentationPanel && (
            <Suspense fallback={null}>
              <AgentationPanel />
            </Suspense>
          )}
        </CartProvider>
      </NotificationsProvider>
    </AuthProvider>
  </React.StrictMode>
)
