import React from 'react';
import ReactDOM from 'react-dom/client';
import { BrowserRouter } from 'react-router-dom';
import { AuthProvider } from './contexts/AuthContext';
import { AppointmentProvider } from './contexts/AppointmentContext';
import { StylistProvider } from './contexts/StylistContext';
import App from './App';
import './index.css';

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <BrowserRouter>
      <AuthProvider>
        <StylistProvider>
          <AppointmentProvider>
            <App />
          </AppointmentProvider>
        </StylistProvider>
      </AuthProvider>
    </BrowserRouter>
  </React.StrictMode>
);
