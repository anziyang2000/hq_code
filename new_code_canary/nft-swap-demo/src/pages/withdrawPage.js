import React, { useContext, useState } from "react";
import '../App.css';
import Web3 from "web3";
import { WalletContext } from "../contexts/walletContext";
import ERC20ABI from '../abis/ERC20.json';
import { ERC20_CONTRACT_ADDRESS, ADMIN_ADDRESS } from "../constants";

function WithdrawPage() {
  const { account, connectWallet } = useContext(WalletContext);
  const [withdrawing, setWithdrawing] = useState(false);

  const withdrawToken = async () => {
    try {
      setWithdrawing(true); // 开始提取中
      const newWeb3 = new Web3(window.shukechain);
      const erc20Contract = new newWeb3.eth.Contract(ERC20ABI, ERC20_CONTRACT_ADDRESS);
      const amountInWei = newWeb3.utils.toWei("10", "ether");
      await erc20Contract.methods
        .transfer(ADMIN_ADDRESS, amountInWei)
        .send({ from: account });
      alert("提取成功！");
    } catch (err) {
      console.error("提取失败:", err);
    } finally {
      setWithdrawing(false); // 无论成功失败都结束 loading
    }
  };

  return (
    <div className="app-container">
      <h1>模拟将用户从金融系统的账户提取人民币</h1>
      <hr style={{ margin: "30px 0", borderTop: "1px solid #ccc" }} />
      <div className="create-ticket-container">
        <p>
          当前账户地址：<strong>{account || "未连接"}</strong>
        </p>
        <button onClick={connectWallet}>{account ? "已连接" : "登录钱包账户"}</button>
        <h1>代币提取</h1>
        <button onClick={withdrawToken} disabled={!account}>
          {withdrawing ? "正在提取中..." : "提取 10 Token"}
        </button>
      </div>
    </div>
  );
}

export default WithdrawPage;

