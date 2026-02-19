import React from 'react'
import ReactDOM from 'react-dom/client'
import { BrowserRouter } from 'react-router-dom'
import App from './App.jsx'
import './index.css'
import './i18n';
import Footer from './components/Footer.jsx'
import Navbar from './components/Navbar.jsx'

ReactDOM.createRoot(document.getElementById('root')).render(
    <React.StrictMode>
        <BrowserRouter>
            <Navbar />
            <App />
            <Footer />
        </BrowserRouter>
    </React.StrictMode>,
)
