import './index.css';

import React from 'react';
import ReactDOM from 'react-dom/client';
import { HashRouter } from 'react-router-dom';

import App from './App';

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <HashRouter basename={import.meta.env.VITE_PUBLIC_PATH as string}>
      <App />
    </HashRouter>
  </React.StrictMode>,
);
