import React from 'react'
import ReactDOM from 'react-dom/client'
import { lazy, Suspense, useEffect, useState } from 'react'
import App from './App.jsx'
import './index.css'
import './i18n';
import { AuthProvider } from './contexts/AuthContext.jsx';
import { CartProvider } from './contexts/CartContext.jsx';

const AgentationPanel = import.meta.env.DEV
  ? lazy(() => import('agentation').then((module) => ({ default: module.Agentation })))
  : null;
const LazyNotificationsProvider = lazy(() =>
  import('./contexts/NotificationsContext.jsx').then((module) => ({ default: module.NotificationsProvider })),
);

const hasAuthSession = () => Boolean(window.localStorage.getItem('accessToken'));

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

function NotificationsBoundary({ children }) {
  const [shouldLoadNotifications, setShouldLoadNotifications] = useState(hasAuthSession);

  useEffect(() => {
    const handleSessionChange = () => setShouldLoadNotifications(hasAuthSession());

    window.addEventListener('storage', handleSessionChange);
    window.addEventListener('auth-session-changed', handleSessionChange);

    return () => {
      window.removeEventListener('storage', handleSessionChange);
      window.removeEventListener('auth-session-changed', handleSessionChange);
    };
  }, []);

  if (!shouldLoadNotifications) {
    return children;
  }

  return (
    <Suspense fallback={children}>
      <LazyNotificationsProvider>{children}</LazyNotificationsProvider>
    </Suspense>
  );
}

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <AuthProvider>
      <NotificationsBoundary>
        <CartProvider>
          <App />
          {AgentationPanel && (
            <Suspense fallback={null}>
              <AgentationPanel />
            </Suspense>
          )}
        </CartProvider>
      </NotificationsBoundary>
    </AuthProvider>
  </React.StrictMode>
)
