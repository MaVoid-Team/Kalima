import React from 'react'
import ReactDOM from 'react-dom/client'
import { Agentation } from 'agentation'
import App from './App.jsx'
import './index.css'
import './i18n';
import { AuthProvider } from './contexts/AuthContext.jsx';
import { CartProvider } from './contexts/CartContext.jsx';
import { NotificationsProvider } from './contexts/NotificationsContext.jsx';

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <AuthProvider>
      <NotificationsProvider>
        <CartProvider>
          <App />
          {import.meta.env.DEV && <Agentation />}
        </CartProvider>
      </NotificationsProvider>
    </AuthProvider>
  </React.StrictMode>
)
