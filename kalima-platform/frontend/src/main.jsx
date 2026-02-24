import React from 'react'
import ReactDOM from 'react-dom/client'
import { BrowserRouter } from 'react-router-dom'
import App from './App.jsx'
import './index.css'
import './i18n';
import { AuthProvider } from './contexts/AuthContext.jsx';
import { Toaster } from 'sonner';

ReactDOM.createRoot(document.getElementById('root')).render(
    <React.StrictMode>
        <BrowserRouter>
            <AuthProvider>
                <App />
                <Toaster richColors position="bottom-right" />
            </AuthProvider>
        </BrowserRouter>
    </React.StrictMode>
)
