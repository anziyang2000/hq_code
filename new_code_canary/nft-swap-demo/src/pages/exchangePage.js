import React, { useState, useEffect, useContext } from "react";
import { useNavigate } from 'react-router-dom';
import Web3 from "web3";
import { WalletContext } from "../contexts/walletContext";

import ExchangeABI from '../abis/Exchange.json';
import ERC404ABI from '../abis/ERC404.json';
import ERC20ABI from '../abis/ERC20.json';
import '../App.css';
import { ERC20_CONTRACT_ADDRESS, ERC404_CONTRACT_ADDRESS, EXCHANGE_CONTRACT_ADDRESS, LOCAL_NODE_URL } from "../constants";

function ExchangePage() {
  const navigate = useNavigate();
//   const [account, setAccount] = useState(null);
//   const [walletReady, setWalletReady] = useState(false);
  const { account, walletReady, connectWallet } = useContext(WalletContext);
  const [ethBalance, setEthBalance] = useState(null);
  const [orderPrice, setOrderPrice] = useState(""); // 卖单价格
  const [orderAmount, setOrderAmount] = useState(0);  // 新增一个 state 来保存订单数量
  const [orderBuyPrice, setOrderBuyPrice] = useState(""); // 买单价格
  const [orderBuyAmount, setOrderBuyAmount] = useState(0);  // 买单数量
  const [orders, setOrders] = useState([]); // 存储卖单列表
  const [ordersBuy, setOrdersBuy] = useState([]); // 存储买单列表
  const [web3, setWeb3] = useState(null); // web3 状态
  const [erc20Balance, setErc20Balance] = useState("加载中...");
  const [erc404Balance, setErc404Balance] = useState("加载中...");
  const [erc20Allowance, setErc20Allowance] = useState(0); // ERC20 授权数量
  const [erc404Allowance, setErc404Allowance] = useState(0); // ERC404 授权数量
  const [erc20Amount, setErc20Amount] = useState('');
  const [erc404Amount, setErc404Amount] = useState('');

  // 点击按钮之后的文字变化和置灰：
  const [creatingOrder, setCreatingOrder] = useState(false);
  const [creatingBuyOrder, setCreatingBuyOrder] = useState(false);
  const [approvingErc20, setApprovingErc20] = useState(false);
  const [approvingErc404, setApprovingErc404] = useState(false);

  // const handleError = (error) => {
  //   console.error("Error:", error);
  //   if (error && error.stack) {
  //     console.error("Error Stack:", error.stack);
  //   }

  //   if (error && typeof error === "object") {
  //     console.error(JSON.stringify(error, null, 2));
  //   }
  // };

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
  }, [account, web3]);

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
  
      const erc20Allowance = await erc20Contract.methods.allowance(account, EXCHANGE_CONTRACT_ADDRESS).call();
      setErc20Allowance(newWeb3.utils.fromWei(erc20Allowance, "ether"));
  
      const erc404Allowance = await erc404Contract.methods.allowance(account, EXCHANGE_CONTRACT_ADDRESS).call();
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
  }, [account, web3]);
  
  // 授权ERC20代币(通过)
  const handleErc20Approve = async () => {
    if (!erc20Amount) {
      alert("请输入授权数量！");
      return;
    }
  
    setApprovingErc20(true); // 开始 loading
  
    try {
      const newWeb3 = new Web3(window.shukechain);
  
      const erc20Contract = new newWeb3.eth.Contract(ERC20ABI, ERC20_CONTRACT_ADDRESS);
      const amountInWei = newWeb3.utils.toWei(erc20Amount, "ether");
  
      await erc20Contract.methods
        .approve(EXCHANGE_CONTRACT_ADDRESS, amountInWei)
        .send({ from: account });
  
      await getTokenBalances();
      alert("授权成功！");
    } catch (err) {
      alert("授权失败！");
      console.error("授权失败:", err);
    } finally {
      setApprovingErc20(false); // 恢复按钮状态
    }
  };
  
  // 授权ERC404门票（通过）
  const handleErc404Approve = async () => {
    if (!erc404Amount) {
      alert("请输入授权数量！");
      return;
    }
  
    setApprovingErc404(true); // 开始 loading
  
    try {
      console.log('授权的account:', account);
      const newWeb3 = new Web3(window.shukechain);
      const erc404Contract = new newWeb3.eth.Contract(ERC404ABI, ERC404_CONTRACT_ADDRESS);
      const amountInWei = newWeb3.utils.toWei(erc404Amount, "ether");
  
      await erc404Contract.methods
        .approve(EXCHANGE_CONTRACT_ADDRESS, amountInWei)
        .send({ from: account });
  
      await getTokenBalances();
      alert("ERC404 门票授权成功！");
    } catch (err) {
      alert("授权失败！");
      console.error("ERC404 授权失败:", err);
    } finally {
      setApprovingErc404(false); // 结束 loading
    }
  };
  
  // 创建卖单(通过)
  const createOrder = async () => {
    if (!orderPrice || !orderAmount) {
      alert("请输入价格和数量");
      return;
    }
  
    setCreatingOrder(true);
  
    try {
      const newWeb3 = new Web3(window.shukechain);
  
      const exchangeContract = new newWeb3.eth.Contract(
        ExchangeABI,
        EXCHANGE_CONTRACT_ADDRESS
      );
  
      await exchangeContract.methods
        .listNFT(orderPrice, orderAmount)
        .send({ from: account });
  
      await getTokenBalances();
      await fetchAllOrders();
      alert("订单创建成功！");
    } catch (error) {
      alert("订单创建失败！");
      console.log(error);
    } finally {
      setCreatingOrder(false); // 保证无论成功失败都恢复按钮
    }
  };
  
  // 创建买单(通过)
  const createBuyOrder = async () => {
    if (!orderBuyPrice || !orderBuyAmount) {
      alert("请输入价格和数量");
      return;
    }
  
    setCreatingBuyOrder(true);
  
    try {
      const newWeb3 = new Web3(window.shukechain);
  
      const exchangeContract = new newWeb3.eth.Contract(
        ExchangeABI,
        EXCHANGE_CONTRACT_ADDRESS
      );
  
      await exchangeContract.methods
        .createBuyOrder(orderBuyPrice, orderBuyAmount)
        .send({ from: account });
  
      await getTokenBalances();
      await fetchAllBuyOrders();
      alert("买单创建成功！");
    } catch (error) {
      alert("买单创建失败！");
      console.error(error);
    } finally {
      setCreatingBuyOrder(false); // 确保操作后按钮恢复
    }
  };
  
  // 购买卖单
  const buyNFT = async (orderIndex) => {
    const order = orders[orderIndex];
    const { initialPrice, orderId } = order;

    // console.log("order", order);
    // console.log("initialPrice", initialPrice);
    // console.log("orderId", orderId);
    // console.log("当前订单列表", orders);
    // console.log("orderIndex", orderIndex);

    try {
      const newWeb3 = new Web3(window.shukechain);

      const exchangeContract = new newWeb3.eth.Contract(
        ExchangeABI,
        EXCHANGE_CONTRACT_ADDRESS
      );

      await exchangeContract.methods
        .purchaseNFT(orderId, initialPrice)
        .send({ from: account });

      await getTokenBalances();
      await fetchAllOrders();
      alert("购买成功！");
    } catch (error) {
      alert("购买失败");
      // handleError(error);
    }
  };

  // 购买买单
  const acceptBuyOrder = async (orderIndex) => {

    const order = ordersBuy[orderIndex];
    const { orderId } = order;

    // console.log("order", order);
    // console.log("orderId", orderId);
    // console.log("buyer", buyer);
    // console.log("当前订单列表", orders);
    // console.log("orderIndex", orderIndex);

    try {
      const newWeb3 = new Web3(window.shukechain);

      const exchangeContract = new newWeb3.eth.Contract(
        ExchangeABI,
        EXCHANGE_CONTRACT_ADDRESS
      );

      await exchangeContract.methods
        .acceptBuyOrder(orderId)
        .send({ from: account });

      await getTokenBalances();
      await fetchAllBuyOrders();
      alert("购买成功！");
    } catch (error) {
      alert("购买失败");
      // handleError(error);
    }
  };

  // 修改卖单价格（通过）
  const modifyOrderPrice = async (orderIndex) => {
    const newPrice = prompt("请输入新的订单价格(人民币):");
    if (!newPrice) return;

    // 根据 orderIndex 获取对应的订单
    const order = orders[orderIndex];
    const orderId = order.orderId;

    try {
      const newWeb3 = new Web3(window.shukechain);

      const exchangeContract = new newWeb3.eth.Contract(
        ExchangeABI,
        EXCHANGE_CONTRACT_ADDRESS
      );

      await exchangeContract.methods
        .updatePrice(orderId, newPrice)
        .send({ from: account });

      await fetchAllOrders();
      alert("订单价格修改成功！");
    } catch (error) {
      alert("修改订单价格失败");
      // handleError(error);
    }
  };

  // 修改卖单数量
  const modifyOrderAmount = async (orderIndex) => {
    const newAmount = prompt("请输入新的订单数量(门票数量):");
    if (!newAmount) return;

    // 根据 orderIndex 获取对应的订单
    const order = orders[orderIndex];
    const orderId = order.orderId;
    const oldAmount = order.amount;

    // 如果新的数量大于旧的数量，需要额外转账 ERC404
    if (parseFloat(newAmount) > parseFloat(oldAmount)) {
      const additionalAmount = parseFloat(newAmount) - parseFloat(oldAmount);

      try {
        const newWeb3 = new Web3(window.shukechain);

        // 实例化 ERC404 合约
        const erc404Contract = new newWeb3.eth.Contract(ERC404ABI, ERC404_CONTRACT_ADDRESS);
  
        // 这里先暂时做成直接转账，不授权的形式
        // 转账差额部分 ERC404 到交易所合约
        await erc404Contract.methods
          .transfer(EXCHANGE_CONTRACT_ADDRESS, additionalAmount * 10 ** 18)
          .send({ from: account });

        alert(`已再次质押到交易所合约${additionalAmount}张门票！`);
      } catch (error) {
        alert("质押门票失败！");
        return;
      }
    }

    try {
      const newWeb3 = new Web3(window.shukechain);

      const exchangeContract = new newWeb3.eth.Contract(
        ExchangeABI,
        EXCHANGE_CONTRACT_ADDRESS
      );

      // 将新的订单数量转换为 BigNumber
      console.log("orderId:", orderId);
      console.log("newAmountType:", typeof(newAmount));
      console.log("parseFloat(newAmount)Type:", typeof(parseFloat(newAmount)));

      await exchangeContract.methods
        .updateSellOrderAmount(orderId, parseFloat(newAmount))
        .send({ from: account });

      await getTokenBalances();
      await fetchAllOrders();
      alert("订单门票数量修改成功！");
    } catch (error) {
      alert("修改订单门票数量失败");
      // handleError(error);
    }
  };

  // 修改买单价格
  const updateBuyOrderPrice = async (orderIndex) => {
    const newPrice = prompt("请输入新的订单价格(人民币):");
    if (!newPrice) return;

    // 根据 orderIndex 获取对应的订单
    const order = ordersBuy[orderIndex];
    const orderId = order.orderId;

    const oldPrice = ordersBuy[orderIndex].price;
    const priceDifference = parseFloat(newPrice) - parseFloat(oldPrice);

    try {
      const newWeb3 = new Web3(window.shukechain);

      const exchangeContract = new newWeb3.eth.Contract(
        ExchangeABI,
        EXCHANGE_CONTRACT_ADDRESS
      );
      // 如果新价格比旧价格更高
      if (priceDifference > 0) {
        const tokenContract = new newWeb3.eth.Contract(ERC20ABI, ERC20_CONTRACT_ADDRESS);

        // 直接转账差额给交易所合约
        await tokenContract.methods
        .transfer(EXCHANGE_CONTRACT_ADDRESS, priceDifference * 10 ** 18)
        .send({ from: account });
      }

      await exchangeContract.methods
        .updateBuyOrderPrice(orderId, newPrice)
        .send({ from: account });

      await getTokenBalances();
      await fetchAllBuyOrders();
      alert("订单价格修改成功！");
    } catch (error) {
      alert("修改订单价格失败");
      // handleError(error);
    }
  };

  // 修改买单数量(通过)
  const modifyBuyOrderAmount = async (orderIndex) => {
    const newAmount = prompt("请输入新的订单数量(门票数量):");
    if (!newAmount) return;

    // 根据 orderIndex 获取对应的订单
    const order = ordersBuy[orderIndex];
    const orderId = order.orderId;

    try {
      const newWeb3 = new Web3(window.shukechain);

      const exchangeContract = new newWeb3.eth.Contract(
        ExchangeABI,
        EXCHANGE_CONTRACT_ADDRESS
      );

      // 将新的订单数量转换为 BigNumber
      console.log("orderId:", orderId);
      console.log("newAmountType:", typeof(newAmount));
      console.log("newAmount", newAmount);
      console.log("parseFloat(newAmount)Type:", typeof(parseFloat(newAmount)));

      await exchangeContract.methods
        .updateBuyOrderAmount(orderId, parseFloat(newAmount))
        .send({ from: account });

      await getTokenBalances();
      await fetchAllBuyOrders();
      alert("订单门票数量修改成功！");
    } catch (error) {
      alert("修改订单门票数量失败");
      // handleError(error);
    }
  }

  // 撤销卖单(通过)
  const cancelOrder = async (orderIndex) => {
    // 根据 orderIndex 获取对应的订单
    const order = orders[orderIndex];
    const orderId = order.orderId;
    
    try {
      const newWeb3 = new Web3(window.shukechain);

      const exchangeContract = new newWeb3.eth.Contract(
        ExchangeABI,
        EXCHANGE_CONTRACT_ADDRESS
      );

      await exchangeContract.methods
        .revokeListing(orderId)
        .send({ from: account });

      await getTokenBalances();
      await fetchAllOrders();
      alert("订单撤销成功！");
    } catch (error) {
      alert("撤销订单失败");
      // handleError(error);
    }
  };

  // 撤销买单(通过)
  const cancelBuyOrder = async (orderIndex) => {
    // 根据 orderIndex 获取对应的订单
    const order = ordersBuy[orderIndex];
    const orderId = order.orderId;
    
    try {
      const newWeb3 = new Web3(window.shukechain);
      
      const exchangeContract = new newWeb3.eth.Contract(
        ExchangeABI,
        EXCHANGE_CONTRACT_ADDRESS
      );

      await exchangeContract.methods
        .cancelBuyOrder(orderId)
        .send({ from: account });

        await getTokenBalances();
        await fetchAllBuyOrders();
        alert("订单撤销成功！");
    } catch (error) {
      alert("撤销订单失败");
      // handleError(error);
    }
  };

  // 获取所有卖单(通过)
  const fetchAllOrders = async () => {
    if (account) {
      try {
        const newWeb3 = new Web3(new Web3.providers.HttpProvider(LOCAL_NODE_URL));

        const exchangeContract = new newWeb3.eth.Contract(
          ExchangeABI,
          EXCHANGE_CONTRACT_ADDRESS
        );

        const allOrders = await exchangeContract.methods.getAllSellOrders().call();
        const formattedOrders = allOrders.map(order => ({
          orderId: order[0],
          currentPrice: order[1],
          initialPrice: order[2],
          amount: order[3],
          owner: order[4],
          isActive: order[5],
          isPurchased: order[6],
          isCancelled: order[7],
        }));

        setOrders(formattedOrders);
      } catch (err) {
        console.error("获取所有订单失败:", err);
        // alert("获取所有订单失败!");
      }
    }
  };

  // 获取所有买单(通过)
  const fetchAllBuyOrders = async () => {
    if (account) {
      try {
        const newWeb3 = new Web3(new Web3.providers.HttpProvider(LOCAL_NODE_URL));

        const exchangeContract = new newWeb3.eth.Contract(
          ExchangeABI,
          EXCHANGE_CONTRACT_ADDRESS
        );

        const allOrders = await exchangeContract.methods.getAllBuyOrders().call();

        const formattedOrders = allOrders.map(order => ({
          orderId: order[0],
          price: order[1],
          amount: order[2],
          buyer: order[3],
          isActive: order[4],
          isPurchased: order[5],
          isCancelled: order[6],
        }));

        setOrdersBuy(formattedOrders);

      } catch (err) {
        console.error("获取所有订单失败:", err);
        // alert("获取所有订单失败!");
      }
    }
  };

  useEffect(() => {
    if (account) {
      fetchAllOrders();
      fetchAllBuyOrders();
    }
  }, [account, web3]);

  function shortenAddress(address) {
    return address.slice(0, 7) + '...' + address.slice(-5);
  }

  return (
    <div className="app-container">
      <h1>Ticket Swap DApp</h1>
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

      <br /><br />
      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '20px' }}>
        <button onClick={connectWallet}>
            {account ? "已连接" : "登录钱包账户"}
        </button>
      </div>

      <hr style={{ margin: '30px 0', borderTop: '1px solid #ccc' }} />

      <h1>交易所模块</h1>
      <div className="create-order-container">
        {/* 提示信息 */}
        <div className="notice-box">
          <p>1. <strong>创建卖单</strong>之前要确保授权给<strong>交易所</strong>至少 <strong>1张门票</strong>。</p>
          <p>2. <strong>购买卖单</strong>之前确保授权给<strong>交易所</strong>至少相应卖单价格的 <strong>人民币</strong>。</p>
        </div>
        <h2>创建卖单</h2>
        <input
          type="number"
          placeholder="输入价格 (人民币)"
          value={orderPrice}
          onChange={(e) => setOrderPrice(e.target.value)}
          className="input"
        />
        {/* 新增输入框，卖家可以输入订单中包含的门票数量 */}
        <input
          type="number"
          placeholder="输入门票数量"
          value={orderAmount}
          onChange={(e) => setOrderAmount(e.target.value)} // 新的状态变量用来管理门票数量
          className="input"
        />
        <button onClick={createOrder} disabled={creatingOrder}>
          {creatingOrder ? "创建中..." : "创建卖单"}
        </button>
      </div>

      <div className="orders-list">
        <h2>卖单列表</h2>
        <table className="table">
          <thead>
            <tr>
              <th>卖单号</th>
              <th>卖家</th>
              <th>卖家出价</th>
              <th>门票数量</th>
              <th>操作</th>
              <th>修改价格</th>
              <th>修改数量</th>
              <th>撤销订单</th>
            </tr>
          </thead>
          <tbody>
            {/* {orders.map((order, index) => ( */}
            {orders.slice().reverse().map((order, index) => (
              // <tr key={index}>
              <tr key={orders.length - 1 - index}>
                <td>{order.orderId}</td>
                <td>{shortenAddress(order.owner)}</td>
                <td>{order.initialPrice}</td>
                <td>{order.amount}</td>
                <td>
                  <button
                    // onClick={() => buyNFT(index)} 
                    onClick={() => buyNFT(orders.length - 1 - index)} // 同样使用反转后的索引
                    disabled={!order.isActive || order.isPurchased || order.isCancelled } 
                    className="button"
                  >
                    {order.isPurchased ? "已售卖" : "购买"}
                  </button>
                </td>
                <td>
                  <button onClick={() => modifyOrderPrice(orders.length - 1 - index)} disabled={account.toLowerCase() !== order.owner.toLowerCase() || !order.isActive || order.isPurchased }>修改价格</button>
                </td>
                <td>
                  <button onClick={() => modifyOrderAmount(orders.length - 1 - index)} disabled={account.toLowerCase() !== order.owner.toLowerCase() || !order.isActive || order.isPurchased }>修改数量</button>
                </td>
                <td>
                  <button onClick={() => cancelOrder(orders.length - 1 - index)} disabled={account.toLowerCase() !== order.owner.toLowerCase() || !order.isActive || order.isPurchased || order.isCancelled }>{order.isCancelled ? "已撤销" : "撤销卖单"}</button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <hr style={{ margin: '30px 0', borderTop: '1px solid #ccc' }} />

      <div className="create-order-container">
        {/* 提示信息 */}
        <div className="notice-box">
          <p>1. <strong>创建买单</strong>之前确保授权给<strong>交易所</strong>至少相应买单价格的 <strong>人民币</strong>。</p>
          <p>2. <strong>接受买单</strong>之前要确保授权给<strong>交易所</strong>至少 <strong>1张门票</strong>。</p>
        </div>
        <h2>创建买单</h2>
        <input
          type="number"
          placeholder="输入价格 (人民币)"
          value={orderBuyPrice}
          onChange={(e) => setOrderBuyPrice(e.target.value)}
          className="input"
        />
        {/* 新增输入框，用户输入购买的门票数量 */}
        <input
          type="number"
          placeholder="输入门票数量"
          value={orderBuyAmount}
          onChange={(e) => setOrderBuyAmount(e.target.value)}  // 新增的 state 变量管理数量
          className="input"
        />
        <button onClick={createBuyOrder} disabled={creatingBuyOrder}>
          {creatingBuyOrder ? "创建中..." : "创建买单"}
        </button>
      </div>

      <div className="orders-list">
        <h2>买单列表</h2>
        <table className="table">
          <thead>
            <tr>
              <th>买单号</th>
              <th>买家</th>
              <th>买家出价</th>
              <th>门票数量</th>
              <th>操作</th>
              <th>修改价格</th>
              <th>修改数量</th>
              <th>撤销订单</th>
            </tr>
          </thead>
          <tbody>
            {ordersBuy.slice().reverse().map((order, index) => (
            // {ordersBuy.map((order, index) => (
              // <tr key={index}>
              <tr key={ordersBuy.length - 1 - index}>
                <td>{order.orderId}</td>
                <td>{shortenAddress(order.buyer)}</td>
                <td>{order.price}</td>
                <td>{order.amount}</td>
                <td>
                  <button
                    onClick={() => acceptBuyOrder(ordersBuy.length - 1 - index)} // 使用反转后的索引 
                    disabled={!order.isActive || order.isPurchased || order.isCancelled } 
                    className="button"
                  >
                    {order.isPurchased ? "已成交" : "接受"}
                  </button>
                </td>
                <td>
                  <button onClick={() => updateBuyOrderPrice(ordersBuy.length - 1 - index)} disabled={account.toLowerCase() !== order.buyer.toLowerCase() || !order.isActive || order.isPurchased || order.isCancelled }>修改价格</button>
                </td>
                <td>
                  <button onClick={() => modifyBuyOrderAmount(ordersBuy.length - 1 - index)} disabled={account.toLowerCase() !== order.buyer.toLowerCase() || !order.isActive || order.isPurchased || order.isCancelled }>修改数量</button>
                </td>
                <td>
                  <button onClick={() => cancelBuyOrder(ordersBuy.length - 1 - index)} disabled={account.toLowerCase() !== order.buyer.toLowerCase() || !order.isActive || order.isPurchased || order.isCancelled }>{order.isCancelled ? "已撤销" : "撤销买单"}</button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <hr style={{ margin: '30px 0', borderTop: '1px solid #ccc' }} />

      <div className="create-approve-container">
        <h1>授权模块</h1>

        {/* 当前已授权信息 */}
        <div>
          <span>当前账户已授权给 <strong>交易所</strong>：</span>

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
          <button onClick={handleErc20Approve} disabled={approvingErc20}>
            {approvingErc20 ? "授权中..." : "授权人民币"}
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
          <button onClick={handleErc404Approve} disabled={approvingErc404}>
            {approvingErc404 ? "授权中..." : "授权门票"}
          </button>
        </div>
      </div>
      
    </div>
  );
}

export default ExchangePage;
