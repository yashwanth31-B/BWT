import React from 'react';
import ReactDOM from 'react-dom/client';
import { BrowserRouter } from 'react-router-dom';
import App from './App';
import { AuthProvider } from './context/AuthContext';
import { FoodProvider } from './context/FoodContext';
import './index.css';

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <BrowserRouter>
      <AuthProvider>
        <FoodProvider>
          <App />
        </FoodProvider>
      </AuthProvider>
    </BrowserRouter>
  </React.StrictMode>
);
