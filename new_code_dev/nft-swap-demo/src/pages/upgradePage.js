import React, { useState, useEffect, useContext } from "react";
import Web3 from "web3";
import { WalletContext } from "../contexts/walletContext";
import LogicABI from '../abis/Logic.json';
import { Logic_CONTRACT_ADDRESS } from "../constants";

function UpgradePage() {
  const { account, connectWallet } = useContext(WalletContext);
  const [version, setVersion] = useState("");
  const [count, setCount] = useState(0);
  const [loading, setLoading] = useState(false); // 用于增加按钮
  const [upgraded, setUpgraded] = useState(true);
  const [switchs, setSwitchs] = useState(true);
  const [resetLoading, setResetLoading] = useState(false); // 用于重置按钮
  const [upgradeLoading, setUpgradeLoading] = useState(false); // 用于升级按钮
  const [switchLoading, setSwitchLoading] = useState(false); // 用于切换按钮

  const web3 = new Web3(window.shukechain);

  const contract = new web3.eth.Contract(LogicABI, Logic_CONTRACT_ADDRESS);

  const fetchData = async () => {
    if (!account) return;
  
    try {
      const version = await contract.methods.getVersion().call();
      const count = await contract.methods.getCount().call();
  
      setVersion(version);
      setCount(count);
  
      if (version === "V1") {
        setUpgraded(false);
        setSwitchs(true);
      } else if (version === "V2") {
        setUpgraded(true);
        setSwitchs(false);
      } else {
        // 比如 V3 或其他意外版本
        setUpgraded(true);
        setSwitchs(true);
      }
    } catch (err) {
      console.error("获取合约信息失败:", err);
      setVersion("未知");
      setCount(0);
      setUpgraded(false);
      setSwitchs(false);
    }
  };
  
  useEffect(() => {
    if (account) fetchData();
  }, [account]);

  const handleIncrement = async () => {
    setLoading(true);
    try {
      await contract.methods.increment().send({ from: account });
      alert("增加成功！");
      fetchData();
    } catch (err) {
      alert("增加失败，请查看控制台");
      console.error(err);
    }
    setLoading(false);
  };

  const handleReset = async () => {
    setResetLoading(true);
    try {
      await contract.methods.reset().send({ from: account });
      alert("重置成功！");
      fetchData();
    } catch (err) {
      console.error(err);
  
      if (version === "V1") {
        alert("当前版本 V1 不支持重置功能，请先升级合约！");
      } else {
        alert("发生错误，请检查控制台。");
      }
    }
    setResetLoading(false);
  };
  
  // const handleUpgrade = async () => {
  //   alert("模拟升级成功：合约已升级为 V2。");
  //   setVersion("V2");
  //   setUpgraded(true);
  // };
  
  const handleUpgrade = async () => {
    const newImplementationAddress = "0x9b5FFA56871D025Bee70A878a98686d275a1e974"; // 替换成你的实际地址
    const upgradeData = "0x";
  
    setUpgradeLoading(true); // 开始加载
  
    try {
      await contract.methods
        .upgradeToAndCall(newImplementationAddress, upgradeData)
        .send({ from: account });
  
      alert("合约已升级到 V2");
      setVersion("V2");
      setUpgraded(true);
      setSwitchs(false);
      fetchData();
    } catch (err) {
      alert("升级失败，请检查控制台日志");
      console.error(err);
    }
  
    setUpgradeLoading(false); // 结束加载
  };
  
  const handleUpgrade2 = async () => {
    const newImplementationAddress = "0x0F9C41F408E125232Bdb4e68E3cf037880A96F10"; // LogicV1 地址
    const upgradeData = "0x";
  
    setSwitchLoading(true); // 开始切换中
  
    try {
      await contract.methods
        .upgradeToAndCall(newImplementationAddress, upgradeData)
        .send({ from: account });
  
      alert("合约切换到 V1");
      setVersion("V1");
      setUpgraded(false);
      setSwitchs(true);
      fetchData();
    } catch (err) {
      console.error(err);
      alert("切换失败，请检查控制台日志");
    }
  
    setSwitchLoading(false); // 结束切换中
  };
  
  return (
    <div className="app-container" >
      <h1>智能合约升级演示</h1>

      <p>
        当前钱包地址：<strong>{account || "未连接"}</strong>
      </p>

      <button onClick={connectWallet}>
        {account ? "已连接" : "连接钱包"}
      </button>

      <hr style={{ margin: "30px 0", borderTop: "1px solid #ccc" }} />

      <div style={{ background: "#f2f2f2", padding: "15px", borderRadius: "8px", marginBottom: '30px' }}>
        <h2>当前合约信息</h2>
        <p>合约版本：<strong>{version || "未获取"}</strong></p>
        <p>当前计数值：<strong>{count}</strong></p>

        <button onClick={handleIncrement} disabled={!account || loading}>
          {loading ? "增加中..." : "增加"}
        </button>

        <button onClick={handleReset}  disabled={!account || resetLoading} style={{ marginLeft: "10px" }}>
        {resetLoading ? "重置中..." : "重置为 0"}
        </button>

        <div style={{ marginTop: "10px", fontSize: "14px", color: "#666" }}>
          <p>升级后将会解锁以下功能：</p>
          <ul>
            <li>“增加”操作由每次 <strong>+1</strong> 变为每次 <strong>+2</strong></li>
            <li>支持 <strong>重置计数</strong> 为 0</li>
          </ul>
        </div>
      </div>

      <div style={{ background: "#e8f0fe", padding: "15px", borderRadius: "8px" }}>
        <h3>关于合约升级</h3>
        <ul>
          <li>合约部署后，原本不能修改</li>
          <li>通过代理合约，我们可以“换掉逻辑”，但地址不变</li>
          <li>升级后，功能增强，但用户操作不变</li>
        </ul>
        <p><strong>点击下方按钮</strong>，将模拟合约从 V1 升级为 V2</p>

        <button onClick={handleUpgrade} disabled={upgraded || upgradeLoading} style={{ marginTop: "10px", marginRight: "10px" }}>
          {upgradeLoading ? "升级中..." : "升级合约到 V2"}
        </button>
        <button onClick={handleUpgrade2} disabled={switchs || switchLoading} style={{ marginTop: "10px" }}>
          {switchLoading ? "切换中..." : "切换合约回 V1"}
        </button>
      </div>
    </div>
  );
}

export default UpgradePage;
