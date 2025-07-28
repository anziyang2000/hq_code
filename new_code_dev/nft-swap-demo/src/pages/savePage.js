import React, { useState, useContext  } from "react";
import Web3 from "web3";
import ERC20ABI from '../abis/ERC20.json';
import ERC404ABI from '../abis/ERC404.json';
import { WalletContext } from "../contexts/walletContext";
import '../App.css';
import { ethers } from "ethers";
import { ERC20_CONTRACT_ADDRESS, ERC404_CONTRACT_ADDRESS, LOCAL_NODE_URL, PRIVATE_KEY, ADMIN_ADDRESS } from "../constants";

function SavePage() {
  const [address1, toAddress1] = useState(""); 
  const [address2, toAddress2] = useState(""); 
  const [loading, setLoading] = useState(false); // 添加状态
  const [ethLoading, setEthLoading] = useState(false); // 新增状态
  const [nftLoading, setNFTLoading] = useState(false); // 新增状态
  const [mintAddress, setMintAddress] = useState(""); // 创建门票 - 数量
  const web3 = new Web3(new Web3.providers.HttpProvider(LOCAL_NODE_URL));
  const account = web3.eth.accounts.privateKeyToAccount(PRIVATE_KEY);

  const sendETH = async () => {
    if (address1 == "") {
      alert('请输入有效的账户地址');
      return;
    }

    setEthLoading(true); // 开始充值
    // 初始化 Web3 对象
   
    const nonce = await web3.eth.getTransactionCount(ADMIN_ADDRESS, 'pending')
    // 准备交易数据
    const transaction = {
      nonce: nonce,
      to: address1, // 目标地址
      value: web3.utils.toWei('5', 'ether'), // 价值，单位为ether
      gas: 210000, // Gas Limit
      gasPrice: web3.utils.toWei('50', 'gwei') // Gas Price，单位为gwei
    };

    // 签名交易
    const signedTx = await account.signTransaction(transaction);

    // 发送交易
    web3.eth.sendSignedTransaction(signedTx.rawTransaction)
      .on('transactionHash', function (hash) {
        console.log('交易哈希:', hash);
      })
      .on('receipt', function (receipt) {
        alert('交易成功');
        console.log('交易收据:', receipt);
      })
      .on('error', function (error) {
        alert('错误:', error);
      })
      .finally(() => {
        setEthLoading(false); // 交易结束
      });
  }

  const sendToken = async () => {
    try {
      if (address2 == "") {
        alert('请输入有效的账户地址');
        return;
      }

      setLoading(true); // 开始充值，展示“正在充值中...”
      const provider = new ethers.providers.JsonRpcProvider(LOCAL_NODE_URL);
      const signer = new ethers.Wallet(PRIVATE_KEY, provider);
      const contract = new ethers.Contract(ERC20_CONTRACT_ADDRESS, ERC20ABI, signer);
  
      const tx = await contract.mint(address2, "100");
      await tx.wait();
  
      alert("交易成功！");
    } catch (err) {
      alert('充值失败!');
      console.error("交易失败:", err);
    } finally {
      setLoading(false); // 无论成功或失败都关闭 loading 状态
    }
  }

    // 创建门票（mint）（通过）
    const mintTicket = async () => {
      try {
        if (!mintAddress) {
          alert("请输入有效的账户地址");
          return;
        }

        setNFTLoading(true); // 开始充值，展示“正在充值中...”
        const provider = new ethers.providers.JsonRpcProvider(LOCAL_NODE_URL);
        const signer = new ethers.Wallet(PRIVATE_KEY, provider);
        const contract = new ethers.Contract(ERC404_CONTRACT_ADDRESS, ERC404ABI, signer);
        console.log(1)
        const tx = await contract.mint(mintAddress, "5");
        console.log(1)
        await tx.wait();
        console.log(1)
        alert("获取成功！");
      } catch (err) {
        // handleError(err);
        alert("获取失败");
        console.log('Mint--', err);
      } finally {
        setNFTLoading(false); // 无论成功或失败都关闭 loading 状态
      }
    };

  return (
    <div className="app-container">
      <h1>区块链单方面测试网页，未与金融系统关联</h1>
      <hr style={{ margin: '30px 0', borderTop: '1px solid #ccc' }} />
      <div className="create-ticket-container">
        <h1>ETH免费充值</h1>
        <label>
          地址：
          <input
            type="string"
            placeholder="请输入你的钱包地址"
            value={address1}
            onChange={(e) => toAddress1(e.target.value)}
            className="input"
          />
        </label>
        <button onClick={sendETH}>{ethLoading ? "正在充值中..." : "每次充值 5 ETH"}</button>
      </div>
      <div className="create-ticket-container">
        <h1>代币免费充值</h1>
        <label>
          地址：
          <input
            type="text"
            placeholder="请输入你的钱包地址"
            value={address2}
            onChange={(e) => toAddress2(e.target.value)}
            className="input"
          />
        </label>
        <button onClick={sendToken}>{loading ? "正在充值中..." : "每次充值 100 Token"}</button>
      </div>
      
      <div className="create-ticket-container">
        <h1>门票免费获取</h1>
        <label>
          地址：
          <input
            type="text"
            placeholder="请输入你的钱包地址"
            value={mintAddress}
            onChange={(e) => setMintAddress(e.target.value)}
            className="input"
          />
        </label>
        <button onClick={mintTicket}>{nftLoading ? "正在获取中..." : "每次获取 5 NFT"}</button>
      </div>
    </div>
  );
}
export default SavePage;