import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App.jsx'
import './index.css'
import './i18n';
import { AuthProvider } from './contexts/AuthContext.jsx';
import { CartProvider } from './contexts/CartContext.jsx';
import { Toaster } from 'sonner';

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <AuthProvider>
      <CartProvider>
        <App />
        <Toaster
          richColors
          position="bottom-right"
          toastOptions={{
            className: "border border-border/40 bg-card/60 backdrop-blur-md shadow-2xl rounded-2xl p-4",
            titleClassName: "font-black uppercase tracking-tight text-sm",
            descriptionClassName: "font-medium opacity-80 text-xs"
          }}
        />
      </CartProvider>
    </AuthProvider>
  </React.StrictMode>
)
