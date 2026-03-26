import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App.jsx' // ตรวจสอบว่ามีบรรทัดนี้เพื่อดึง App มาใช้งาน

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>,
)
