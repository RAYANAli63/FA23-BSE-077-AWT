import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App.jsx'
import './index.css'

// Apply saved theme on initial load
const saved = localStorage.getItem('theme') || 'dark'
document.documentElement.classList.toggle('dark', saved === 'dark')

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
)
