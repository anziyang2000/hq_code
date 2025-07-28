import React, { useState, useEffect, useContext } from "react";
import { useNavigate } from 'react-router-dom';
import Web3 from "web3";
import { WalletContext } from "../contexts/walletContext";
import { isAddress } from 'web3-validator';

import ERC404ABI from '../abis/ERC404.json';
import ERC20ABI from '../abis/ERC20.json';
import MarketplaceABI from '../abis/Marketplace.json';
import '../App.css';
import { ERC20_CONTRACT_ADDRESS, ERC404_CONTRACT_ADDRESS, LOCAL_NODE_URL, MARKETPLACE_CONTRACT_ADDRESS } from "../constants";

function TicketPage() {
  const navigate = useNavigate();
  const { account, connectWallet } = useContext(WalletContext);
  const [ethBalance, setEthBalance] = useState(null);
  const [mintTo, setMintTo] = useState(""); 
  const [mintAmount, setMintAmount] = useState("");   // 门票数量
  const [burnValue, setBurnValue] = useState("");
  const [updateIPFS, setUpdateIPFS] = useState("");
  // ToB/ToC 下单输入
  const [tobOrderInput, setTobOrderInput] = useState({
    orderId: "",
    seller: "",
    amount: "",
    pricePerTicket: "",
    ipfsHash: ""
  });
  const [tocOrderInput, setTocOrderInput] = useState({
    orderId: "",
    seller: "",
    amount: "",
    pricePerTicket: ""
  });
    
  // ToB/ToC 退单输入
  const [cancelTobOrderId, setCancelTobOrderId] = useState("");
  const [cancelTocOrderId, setCancelTocOrderId] = useState("");

  const [erc20Balance, setErc20Balance] = useState("加载中...");
  const [erc404Balance, setErc404Balance] = useState("加载中...");

  const [erc20Allowance, setErc20Allowance] = useState(0); // ERC20 授权数量
  const [erc404Allowance, setErc404Allowance] = useState(0); // ERC404 授权数量
  const [erc20Amount, setErc20Amount] = useState('');
  const [erc404Amount, setErc404Amount] = useState('');

  // 关于按钮点击时候置灰：
  const [mintLoading, setMintLoading] = useState(false);
  const [burnLoading, setBurnLoading] = useState(false);
  const [updateLoading, setUpdateLoading] = useState(false);
  const [creatingOrder, setCreatingOrder] = useState(false);
  const [canceling, setCanceling] = useState(false);
  const [approving, setApproving] = useState(false);
  const [erc404Approving, setErc404Approving] = useState(false);

  // 获取账户的测试ETH余额
  useEffect(() => {
    if (account) {
      const updateEthBalance = async () => {
        try {
          console.log('🔍 正在查询余额 for:', account);

          const newWeb3 = new Web3(new Web3.providers.HttpProvider(LOCAL_NODE_URL));

          const balance = await newWeb3.eth.getBalance(account);
          console.log('✅ 原始余额（wei）:', balance);
  
          const eth = newWeb3.utils.fromWei(balance, "ether");
          console.log('✅ 转换后（ETH）:', eth);
  
          setEthBalance(eth);
        } catch (err) {
          console.error("获取余额失败:", err?.message || err);
        }
      };
  
      updateEthBalance();
    } else {
      console.warn("account 或 web3 不存在");
    }
  }, [account]);

  // 获取ERC20和ERC404代币余额
  const getTokenBalances = async () => {
    try {
      const newWeb3 = new Web3(new Web3.providers.HttpProvider(LOCAL_NODE_URL));
    //   const newWeb3 = new Web3(window.shukechain);

      const erc20Contract = new newWeb3.eth.Contract(ERC20ABI, ERC20_CONTRACT_ADDRESS);
      const erc20BalanceRaw = await erc20Contract.methods.balanceOf(account).call();
      setErc20Balance(newWeb3.utils.fromWei(erc20BalanceRaw, "ether"));
  
      const erc404Contract = new newWeb3.eth.Contract(ERC404ABI, ERC404_CONTRACT_ADDRESS);
      const erc404BalanceRaw = await erc404Contract.methods.balanceOf(account, '1').call();
      setErc404Balance(newWeb3.utils.fromWei(erc404BalanceRaw, "ether"));

      const erc20Allowance = await erc20Contract.methods.allowance(account, MARKETPLACE_CONTRACT_ADDRESS).call();
      setErc20Allowance(newWeb3.utils.fromWei(erc20Allowance, "ether"));
      
      const erc404Allowance = await erc404Contract.methods.allowance(account, MARKETPLACE_CONTRACT_ADDRESS).call();
      setErc404Allowance(newWeb3.utils.fromWei(erc404Allowance, "ether"));
    } catch (err) {
      console.error("获取代币余额失败:", err);
      // handleError(err);
    }
  };
   
  useEffect(() => {
    if (account) {
      getTokenBalances();
    }
  }, [account]);

  // 发售门票逻辑（mint）
  const mintTicket = async () => {
    if (!mintTo || !mintAmount) {
      alert("请输入接收地址和门票数量");
      return;
    }
  
    if (!isAddress(mintTo)) {
      alert("接收地址格式不正确，请输入合法的以太坊地址");
      return;
    }
  
    if (!Number.isInteger(Number(mintAmount)) || Number(mintAmount) <= 0) {
      alert("门票数量必须是正整数");
      return;
    }
  
    setMintLoading(true); // 设置为发售中
  
    try {
      const newWeb3 = new Web3(window.shukechain);
      const erc404Contract = new newWeb3.eth.Contract(ERC404ABI, ERC404_CONTRACT_ADDRESS);
      console.log("mintTo:", mintTo);
      console.log("mintAmount:", mintAmount);
      console.log("account:", account);
  
      await erc404Contract.methods
        .mint(mintTo, mintAmount)
        .send({ from: account });
  
      await getTokenBalances();
      alert("门票发售成功！");
    } catch (error) {
      alert("门票发售失败！");
      console.error("门票发售失败:", error);
    }
  
    setMintLoading(false); // 发售结束
  };
  
  //核销门票   
  const handleBurn = async () => {
    if (!burnValue.trim()) {
      alert("请输入要核销的数量");
      return;
    }
  
    const value = burnValue.trim();
    const web3 = new Web3(window.shukechain);
    const erc404 = new web3.eth.Contract(ERC404ABI, ERC404_CONTRACT_ADDRESS);
  
    const amount = Number(value);
    if (isNaN(amount) || amount <= 0) {
      alert("请输入有效的核销数量");
      return;
    }
  
    setBurnLoading(true); // ⏳ 开始 loading
  
    try {
      await erc404.methods.burn(amount).send({ from: account });
      alert(`已核销 ${amount} 张门票`);
      await getTokenBalances(); // 更新余额
      setBurnValue(""); // 清空输入
    } catch (err) {
      alert("核销失败，请检查网络或输入信息");
      console.error("核销失败:", err);
    }
  
    setBurnLoading(false); // ✅ 结束 loading
  };
  
  // 🚀 更新门票信息（tokenURI） ----- 目前是只有管理员可以修改
  const updateTicketURI = async () => {
    if (!updateIPFS) {
      alert("请填写门票内容");
      return;
    }
  
    setUpdateLoading(true); // ⏳ 开始 loading
  
    try {
      const web3 = new Web3(window.shukechain);
      const erc404 = new web3.eth.Contract(ERC404ABI, ERC404_CONTRACT_ADDRESS);
      console.log('updateIPFS:', updateIPFS);
      console.log('typeof(updateIPFS):', typeof(updateIPFS));
  
      await erc404.methods.setIpfsHash(updateIPFS).send({ from: account });
  
      alert("门票信息更新成功！");
    } catch (err) {
      alert("更新失败");
      console.error("更新失败", err);
    }
  
    setUpdateLoading(false); // ✅ 结束 loading
  };
  
  // 注意订单和退单中的Number(input.orderId)这里默认的输入的orderId不会超出js的最大整数限制   
  const handleCreateOrder = async (type) => {
    const web3 = new Web3(window.shukechain);
    const contract = new web3.eth.Contract(MarketplaceABI, MARKETPLACE_CONTRACT_ADDRESS);
    const input = type === "ToB" ? tobOrderInput : tocOrderInput;
  
    if (!input.orderId || !input.seller || !input.amount || !input.pricePerTicket) {
      return alert("请填写完整的字段");
    }
  
    console.log('input.ipfsHash:', input.ipfsHash);
    console.log('input.ipfsHash:', typeof(input.ipfsHash));
  
    setCreatingOrder(true); // ⏳ 开始 loading
  
    try {
      const orderType = type === "ToB" ? 0 : 1;
      await contract.methods
        .createOrder(
          Number(input.orderId),
          input.seller,
          Number(input.amount),
          Number(input.pricePerTicket),
          orderType,
          type === "ToB" ? input.ipfsHash : ""
        )
        .send({ from: account });
  
      await getTokenBalances();
      alert('订单创建成功');
    } catch (err) {
      alert('订单创建失败');
      console.error(err);
    }
  
    setCreatingOrder(false); // ✅ 结束 loading
  };

  const handleCancelOrder = async (orderId, type) => {
    if (!orderId) return alert("请输入订单 ID");
  
    setCanceling(true); // 开始 loading
  
    try {
      const web3 = new Web3(window.shukechain);
      const contract = new web3.eth.Contract(MarketplaceABI, MARKETPLACE_CONTRACT_ADDRESS);
      await contract.methods.cancelOrder(Number(orderId)).send({ from: account });
  
      await getTokenBalances();
      alert('退单成功');
    } catch (err) {
      alert('退单失败');
      console.error(err);
    }
  
    setCanceling(false); // 结束 loading
  };

  // 授权ERC20代币(通过)
  const handleErc20Approve = async () => {
    if (!erc20Amount) {
      alert("请输入授权数量！");
      return;
    }
  
    setApproving(true); // 开始 loading
  
    try {
      const newWeb3 = new Web3(window.shukechain);
      const erc20Contract = new newWeb3.eth.Contract(ERC20ABI, ERC20_CONTRACT_ADDRESS);
      const amountInWei = newWeb3.utils.toWei(erc20Amount, "ether");
  
      await erc20Contract.methods
        .approve(MARKETPLACE_CONTRACT_ADDRESS, amountInWei)
        .send({ from: account });
  
      await getTokenBalances();
      alert("授权成功！");
    } catch (err) {
      console.error("授权失败:", err);
      alert("授权失败，请检查控制台日志");
    }
  
    setApproving(false); // 结束 loading
  };

  // 授权ERC404门票（通过）
  const handleErc404Approve = async () => {
    if (!erc404Amount) {
      alert("请输入授权数量！");
      return;
    }
  
    setErc404Approving(true);
  
    try {
      console.log('授权的account:', account);
      const newWeb3 = new Web3(window.shukechain);
      const erc404Contract = new newWeb3.eth.Contract(ERC404ABI, ERC404_CONTRACT_ADDRESS);
      const amountInWei = newWeb3.utils.toWei(erc404Amount, "ether");
  
      await erc404Contract.methods
        .approve(MARKETPLACE_CONTRACT_ADDRESS, amountInWei)
        .send({ from: account });
  
      await getTokenBalances();
      alert("门票授权成功！");
    } catch (err) {
      alert("授权失败!");
      console.error("授权失败:", err);
    }
  
    setErc404Approving(false);
  };

  return (
    <div className="app-container">
      <h1>Ticket DApp</h1>
      <p>
        当前账户地址：<strong>{account || "未连接"}</strong>
      </p>
      <p>
        ETH余额：<strong>{ethBalance ? `${ethBalance} ETH` : "加载中..."}</strong>
      </p>
      <p>
        人民币余额：{erc20Balance}
      </p>
      <p>
        门票张数：{erc404Balance}
      </p>

      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '20px' }}>
        <button onClick={connectWallet}>
            {account ? "已连接" : "登录钱包账户"}
        </button>
      </div>

      <hr style={{ margin: '30px 0', borderTop: '1px solid #ccc' }} />

      <div className="create-order-container">
        <h2>发售门票</h2>
          {/* 输入接收地址 */}
        <input
            type="text"
            placeholder="输入接收地址"
            value={mintTo}
            onChange={(e) => setMintTo(e.target.value)}
            className="input"
        />
        {/* 输入门票数量 */}
        <input
            type="number"
            placeholder="输入门票数量"
            value={mintAmount}
            onChange={(e) => setMintAmount(e.target.value)}
            className="input"
        />
        <button onClick={mintTicket} disabled={mintLoading}>
          {mintLoading ? "发售中..." : "发售门票"}
        </button>
      </div>

      <hr style={{ margin: '30px 0', borderTop: '1px solid #ccc' }} />

      {/* 🧨 核销门票 */}
      <div className="burn-ticket-container">
        <h2>核销门票</h2>

        <input
            type="text"
            placeholder="请输入销毁数量（例如：5）"
            value={burnValue}
            onChange={(e) => setBurnValue(e.target.value)}
            className="input"
        />

        <button onClick={handleBurn} disabled={burnLoading}>
          {burnLoading ? "核销中..." : "确认核销"}
        </button>
      </div>


      <hr style={{ margin: '30px 0', borderTop: '1px solid #ccc' }} />

      {/* 📝 更新门票信息 */}
      <div className="update-order-container">
        <h2>更新门票信息</h2>
        <input type="text" placeholder="门票内容" value={updateIPFS} onChange={(e) => setUpdateIPFS(e.target.value)} className="input" />
        <button onClick={updateTicketURI} disabled={updateLoading}>
          {updateLoading ? "更新中..." : "更新门票信息"}
        </button>
      </div>

      <hr style={{ margin: '30px 0', borderTop: '1px solid #ccc' }} />

      {/* ToB 下单 */}
      <div>
        {/* <h2>B端 创建订单</h2> */}
        <h2>创建订单</h2>
        <input className="input" placeholder="订单 ID" value={tobOrderInput.orderId} onChange={e => setTobOrderInput({ ...tobOrderInput, orderId: e.target.value })} />
        <input className="input" placeholder="卖家账户" value={tobOrderInput.seller} onChange={e => setTobOrderInput({ ...tobOrderInput, seller: e.target.value })} />
        <input className="input" placeholder="门票数量" value={tobOrderInput.amount} onChange={e => setTobOrderInput({ ...tobOrderInput, amount: e.target.value })} />
        <input className="input" placeholder="单价" value={tobOrderInput.pricePerTicket} onChange={e => setTobOrderInput({ ...tobOrderInput, pricePerTicket: e.target.value })} />
        <input className="input" placeholder="备注" value={tobOrderInput.ipfsHash} onChange={e => setTobOrderInput({ ...tobOrderInput, ipfsHash: e.target.value })} />
        <button onClick={() => handleCreateOrder("ToB")} disabled={creatingOrder}>
          {creatingOrder ? "创建中..." : "创建订单"}
        </button>
      </div>

      {/* ToB 退单 */}
      <div>
        {/* <h2>B端 退单</h2> */}
        <h2>退单</h2>
        <input className="input" placeholder="订单 ID" value={cancelTobOrderId} onChange={(e) => setCancelTobOrderId(e.target.value)} />
        <button onClick={() => handleCancelOrder(cancelTobOrderId, "ToB")} disabled={canceling}>
          {canceling ? "退单中..." : "退单"}
        </button>
      </div>

      <hr style={{ margin: '30px 0', borderTop: '1px solid #ccc' }} />

      {/* ToC 下单 */}
      {/* <div>
        <h2>C端 创建订单</h2>
        <input className="input" placeholder="订单 ID" value={tocOrderInput.orderId} onChange={e => setTocOrderInput({ ...tocOrderInput, orderId: e.target.value })} />
        <input className="input" placeholder="卖家账户" value={tocOrderInput.seller} onChange={e => setTocOrderInput({ ...tocOrderInput, seller: e.target.value })} />
        <input className="input" placeholder="门票数量" value={tocOrderInput.amount} onChange={e => setTocOrderInput({ ...tocOrderInput, amount: e.target.value })} />
        <input className="input" placeholder="单价" value={tocOrderInput.pricePerTicket} onChange={e => setTocOrderInput({ ...tocOrderInput, pricePerTicket: e.target.value })} />
        <button onClick={() => handleCreateOrder("ToC")}>创建订单</button>
      </div> */}

      {/* ToC 退单 */}
      {/* <div>
        <h2>C端 退单</h2>
        <input className="input" placeholder="订单 ID" value={cancelTocOrderId} onChange={(e) => setCancelTocOrderId(e.target.value)} />
        <button onClick={() => handleCancelOrder(cancelTocOrderId, "ToC")}>退单</button>
      </div>

      <hr style={{ margin: '30px 0', borderTop: '1px solid #ccc' }} /> */}

      <div className="create-approve-container">
        <h1>授权模块</h1>

        {/* 当前已授权信息 */}
        <div>
          <span>当前账户已授权给 <strong>门票交易系统</strong>：</span>

          <p>人民币：{erc20Allowance} 个</p>
          <p>门票：{erc404Allowance} 张</p>
        </div>

        {/* 授权 ERC20 */}
        <div>
          <h3>人民币 授权</h3>
          {/* <input
            type="text"
            placeholder="请输入账户地址"
            value={erc20Address}
            onChange={(e) => setErc20Address(e.target.value)}
            // wozhidaomeiyouxiacizaijianba  guitudefengyizhigua,youduoshaoxixiaoruma    xiangyichangdamengruta        zijizuodejiaoziei  zijibaode  niubiha   niubiha  niubi  niubibafanzhengshi  fanzhengshiniubideha fanzhengshi de ha woyaoqushijiedejintou   liuxianixiangmengdeyangliu
            className="input"
          /> */}
          <input
            type="number"
            placeholder="请输入授权数量"
            value={erc20Amount}
            onChange={(e) => setErc20Amount(e.target.value)}
            className="input"
          />
          <button onClick={handleErc20Approve} disabled={approving}>
            {approving ? "授权中..." : "授权人民币"}
          </button>
        </div>

        {/* 授权 ERC404 */}
        <div>
          <h3>门票授权</h3>
          {/* <input
            type="text"
            placeholder="请输入账户地址"
            value={erc404Address}
            onChange={(e) => setErc404Address(e.target.value)}
            className="input"
          /> */}
          <input
            type="number"
            placeholder="请输入授权数量"
            value={erc404Amount}
            onChange={(e) => setErc404Amount(e.target.value)}
            className="input"
          />
          <button onClick={handleErc404Approve} disabled={erc404Approving}>
            {erc404Approving ? "授权中..." : "授权门票"}
          </button>
        </div>
      </div>

    </div>
  );
}

export default TicketPage;
