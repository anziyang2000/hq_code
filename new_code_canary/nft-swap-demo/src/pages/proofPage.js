import React, { useState, useContext, useEffect } from "react";
import Web3 from "web3";
import { WalletContext } from "../contexts/walletContext";
import ProofABI from "../abis/Proof.json";
import { PROOF_CONTRACT_ADDRESS } from "../constants";

function ProofPage() {
  const { account, connectWallet } = useContext(WalletContext);
  const [userInput, setUserInput] = useState("");
  const [typeName, setTypeName] = useState("");
  const [uploading, setUploading] = useState(false);
  const [records, setRecords] = useState([]);

  const formatTimestamp = (ts) => {
    const date = new Date(ts);
    return date.toLocaleString();
  };

//   useEffect(() => {
//     if (account) {
//       loadUserRecords();
//     }
//   }, [account]);

//   const loadUserRecords = async () => {
//     try {
//       const web3 = new Web3(window.shukechain);
//       const contract = new web3.eth.Contract(ProofABI, PROOF_CONTRACT_ADDRESS);
//       const result = await contract.methods.getRecordsByUser(account).call();

//       const formatted = result.map((item) => ({
//         timestamp: parseInt(item.timestamp) * 1000,
//         typeName: item.typeName,
//         ipfsHash: item.ipfsHash,
//         txHash: "", // 无法从调用中获取 txHash，除非监听事件
//       }));

//       setRecords(formatted);
//     } catch (err) {
//       console.error("加载记录失败", err);
//     }
//   };

  const handleSubmit = async () => {
    if (!userInput.trim()) {
      alert("请输入要存证的内容");
      return;
    }
    if (!typeName) {
      alert("请选择存证类型");
      return;
    }

    try {
      setUploading(true);

      const blob = new Blob([userInput], { type: "text/plain" });
      const formData = new FormData();
      const now = new Date();
      const localTimestamp = now.getTime(); // ← 改名
      const shortInput = userInput.slice(0, 10).replace(/[\s\n\r]/g, "_");
      const fileName = `proof_${localTimestamp}_${shortInput}.txt`;


      formData.append("file", blob, fileName);

      const response = await fetch(
        "http://192.168.90.141:30001/api/v0/add?stream-channels=true&pin=false&wrap-with-directory=false&progress=false",
        {
          method: "POST",
          body: formData,
        }
      );

    //   const result = await response.json();
      console.log('response:', response);
      const text = await response.text();
      const result = JSON.parse(text.trim().split("\n").pop()); // 兼容 IPFS 返回多行内容
      console.log('result:', result);
      const ipfsHash = result.Hash;
      if (!ipfsHash) throw new Error("未获取到 IPFS 哈希");

      const web3 = new Web3(window.shukechain);
      const contract = new web3.eth.Contract(ProofABI, PROOF_CONTRACT_ADDRESS);

      const tx = await contract.methods
        .submit(typeName, ipfsHash)
        .send({ from: account });

      // 获取链上当前 block timestamp（可选）
      const block = await web3.eth.getBlock(tx.blockNumber);
      const timestamp = parseInt(block.timestamp) * 1000;

      setRecords((prev) => [
        ...prev,
        {
          timestamp,
          typeName,
          ipfsHash,
          txHash: tx.transactionHash,
        },
      ]);

      alert("存证成功！交易哈希：" + tx.transactionHash);
      setUserInput("");
      setTypeName("");
    } catch (err) {
      alert("存证失败：" + err.message);
    } finally {
      setUploading(false);
    }
  };

  return (
    <div className="app-container">
      <h1>链上信息存证</h1>

      <p>
        当前钱包地址：<strong>{account || "未连接"}</strong>
      </p>

      <button onClick={connectWallet}>
        {account ? "已连接" : "连接钱包"}
      </button>

      <hr style={{ margin: "30px 0", borderTop: "1px solid #ccc" }} />

      <h3>请选择存证类型并输入要存证的内容：</h3>
      <select
        value={typeName}
        onChange={(e) => setTypeName(e.target.value)}
        className="input"
        style={{ width: "100%", marginBottom: "20px" }}
      >
        <option value="">-- 请选择 --</option>
        <option value="FINANCE">金融</option>
        <option value="BANK_RECEIPT">银行流水</option>
        <option value="EVIDENCE">存证</option>
        <option value="EXCHANGE">交易所</option>
        <option value="TICKET">门票</option>
      </select>
      <br></br>
      <textarea
        value={userInput}
        onChange={(e) => setUserInput(e.target.value)}
        rows={6}
        className="input"
        placeholder="请输入要存证的内容"
        style={{ width: "100%" }}
      />
      <br></br>
      <button onClick={handleSubmit} disabled={uploading}>
        {uploading ? "正在存证..." : "上传存证"}
      </button>

      {records.length > 0 && (
        <>
          <h2 style={{ marginTop: 40 }}>存证历史记录</h2>
          <table className="table" style={{ width: "100%", borderCollapse: "collapse" }}>
            <thead>
              <tr style={{ borderBottom: "1px solid #ccc" }}>
                <th style={{ padding: "8px" }}>存证时间</th>
                <th style={{ padding: "8px" }}>类型</th>
                <th style={{ padding: "8px" }}>IPFS 哈希</th>
                <th style={{ padding: "8px" }}>链上交易哈希</th>
                <th style={{ padding: "8px" }}>操作</th>
              </tr>
            </thead>
            <tbody>
              {[...records].reverse().map((record, index) => (
                <tr key={index} style={{ borderBottom: "1px solid #eee" }}>
                  <td style={{ padding: "8px", fontSize: 12 }}>{formatTimestamp(record.timestamp)}</td>
                  <td style={{ padding: "8px", fontSize: 12 }}>{record.typeName}</td>
                  <td style={{ padding: "8px", fontSize: 12, wordBreak: "break-all" }}>{record.ipfsHash}</td>
                  <td style={{ padding: "8px", fontSize: 12, wordBreak: "break-all" }}>
                    {record.txHash || "--"}
                  </td>
                  <td style={{ padding: "8px" }}>
                    <button
                      style={{ marginRight: 8 }}
                      onClick={() =>
                        window.open(
                          `http://192.168.90.141:30001/ipfs/bafybeigggyffcf6yfhx5irtwzx3cgnk6n3dwylkvcpckzhqqrigsxowjwe/#/ipfs/${record.ipfsHash}`,
                          "_blank"
                        )
                      }
                    >
                      查看 IPFS
                    </button>
                    {record.txHash && (
                      <button
                        onClick={() =>
                          window.open(`http://192.168.120.31:4000/tx/${record.txHash}`, "_blank")
                        }
                      >
                        查看链上
                      </button>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </>
      )}

      {/* Fabric 区块链浏览器入口 */}
      <div style={{ marginTop: 60 }}>
        <h3
         style={{ cursor: 'pointer' }}
          onClick={() =>
            window.open("https://explorer.shukechain.com/", "_blank")
          }
        >
          点击打开区块链浏览器（Fabric 链）
        </h3>
      </div>
    </div>
  );
}

export default ProofPage;
