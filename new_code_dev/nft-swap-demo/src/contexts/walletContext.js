import React, { createContext, useEffect, useState } from "react";

export const WalletContext = createContext();

export const WalletProvider = ({ children }) => {
  const [account, setAccount] = useState(null);
  const [walletReady, setWalletReady] = useState(false);

  // 检测钱包插件
  useEffect(() => {
    let tries = 0;
    const maxTries = 20;
    const interval = setInterval(() => {
      tries++;
      if (window.shukechain && window.shukechain.isChangan) {
        console.log("✅ 检测到 环球数科 插件钱包");
        setWalletReady(true);
        clearInterval(interval);
      } else {
        console.log(`⏳ 第 ${tries} 次检查...`);
      }

      if (tries >= maxTries) {
        clearInterval(interval);
        // alert("未检测到 环球数科 钱包，请确认插件已安装并启用。");
      }
    }, 500);

    return () => clearInterval(interval);
  }, []);

  // 监听账户变更
  useEffect(() => {
    if (walletReady && window.shukechain) {
      const handleAccountsChanged = (accounts) => {
        setAccount(accounts.length > 0 ? accounts[0] : null);
      };
      window.shukechain.on("accountsChanged", handleAccountsChanged);

      return () => {
        window.shukechain.removeListener("accountsChanged", handleAccountsChanged);
      };
    }
  }, [walletReady]);

  const connectWallet = async () => {
    if (account) return;
    try {
      const accounts = await window.shukechain.request({ method: "eth_requestAccounts" });
      setAccount(accounts[0]);
    } catch (err) {
      alert("未检测到 环球数科 钱包，请确认插件已安装并启用。")
      console.error("连接钱包失败:", err);
    }
  };

  return (
    <WalletContext.Provider value={{ account, walletReady, connectWallet }}>
      {children}
    </WalletContext.Provider>
  );
};


