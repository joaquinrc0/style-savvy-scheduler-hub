import React from 'react';
import ReactDOM from 'react-dom/client';
import { AuthProvider } from './contexts/AuthContext';
import { AppointmentProvider } from './contexts/AppointmentContext';
import { StylistProvider } from './contexts/StylistContext';
import App from './App';
import './index.css';

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <AuthProvider>
      <StylistProvider>
        <AppointmentProvider>
          <App />
        </AppointmentProvider>
      </StylistProvider>
    </AuthProvider>
  </React.StrictMode>
);
