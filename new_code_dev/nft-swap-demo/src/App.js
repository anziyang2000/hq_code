import React from 'react';
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { WalletProvider } from "./contexts/walletContext";

import HomePage from './pages/homePage';
import ExchangePage from './pages/exchangePage';
import TicketPage from './pages/ticketPage';
import ProofPage from './pages/proofPage';
import SavePage from './pages/savePage';
import WithdrawPage from './pages/withdrawPage';
import WalletGuidePage from './pages/walletGuidePage';
import UpgradePage from './pages/upgradePage';
import LoanPage from './pages/loanPage';

function App() {
  return (
    <WalletProvider>
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<WalletGuidePage />} />
          <Route path="/homePage" element={<HomePage />} />
          <Route path="/exchange" element={<ExchangePage />} />
          <Route path="/ticket" element={<TicketPage />} />
          <Route path="/proof" element={<ProofPage />} />
          <Route path="/save" element={<SavePage />} />
          <Route path="/withdraw" element={<WithdrawPage />} />
          <Route path="/upgrade" element={<UpgradePage />} />
          <Route path="/loan" element={<LoanPage />} />
        </Routes>
      </BrowserRouter>
    </WalletProvider>
  );
}

export default App;
