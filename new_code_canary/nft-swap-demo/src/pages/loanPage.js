import React, { useState, useEffect, useContext } from "react";
import { useNavigate } from 'react-router-dom';
import Web3 from "web3";
import { WalletContext } from "../contexts/walletContext";

import ERC404ABI from '../abis/ERC404.json';
import ERC20ABI from '../abis/ERC20.json';
import ERC20LoanABI from '../abis/ERC20LoanContract.json';
import '../App.css';
import { ERC20_CONTRACT_ADDRESS, ERC404_CONTRACT_ADDRESS, LOCAL_NODE_URL, ERC20_LOAN_CONTRACT_ADDRESS } from "../constants";

function LoanPage() {
  const navigate = useNavigate();
  const { account, connectWallet } = useContext(WalletContext);
  const [ethBalance, setEthBalance] = useState(null);
  
  const [erc20Balance, setErc20Balance] = useState("加载中...");
  const [erc404Balance, setErc404Balance] = useState("加载中...");
  const [loanPool, setLoanPool] = useState("加载中...");
  const [annualRate, setAnnualRate] = useState("加载中...");
  const [userLoan, setUserLoan] = useState(null);

  const [loanAmountInput, setLoanAmountInput] = useState('');
  const [loanDurationInput, setLoanDurationInput] = useState('');
  const [loanDurationUnit, setLoanDurationUnit] = useState('days');
  const [repayAmountInput, setRepayAmountInput] = useState('');
  const [borrowerAddress, setBorrowerAddress] = useState('');
  const [newAnnualRate, setNewAnnualRate] = useState('');
  const [loadingUpdateRate, setLoadingUpdateRate] = useState(false);
  const [addFundsAmount, setAddFundsAmount] = useState("");
  const [loadingAddFunds, setLoadingAddFunds] = useState(false);

  const [loadingRequestLoan, setLoadingRequestLoan] = useState(false);
  const [loadingRepayLoan, setLoadingRepayLoan] = useState(false);
  const [loadingApproveLoan, setLoadingApproveLoan] = useState(false);

  const [withdrawAmount, setWithdrawAmount] = useState("");
  const [loadingWithdraw, setLoadingWithdraw] = useState(false);

  const [erc20Allowance, setErc20Allowance] = useState(0); // ERC20 授权数量
  const [erc20Amount, setErc20Amount] = useState('');

  // 关于按钮点击时候置灰：
  const [approving, setApproving] = useState(false);

  // 获取账户的测试ETH余额
  useEffect(() => {
    if (account) {
      const updateEthBalance = async () => {
        try {
          console.log('正在查询余额 for:', account);

          const newWeb3 = new Web3(new Web3.providers.HttpProvider(LOCAL_NODE_URL));

          const balance = await newWeb3.eth.getBalance(account);
          console.log('原始余额（wei）:', balance);
  
          const eth = newWeb3.utils.fromWei(balance, "ether");
          console.log('转换后（ETH）:', eth);
  
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

      const erc20Allowance = await erc20Contract.methods.allowance(account, ERC20_LOAN_CONTRACT_ADDRESS).call();
      setErc20Allowance(newWeb3.utils.fromWei(erc20Allowance, "ether"));
      
      const loanContract = new newWeb3.eth.Contract(ERC20LoanABI, ERC20_LOAN_CONTRACT_ADDRESS);
      const pool = await loanContract.methods.totalLoanPool().call();
      setLoanPool(newWeb3.utils.fromWei(pool, "ether"));

      const rate = await loanContract.methods.annualInterestRate().call();
      const rateNum = Number(rate);
      setAnnualRate((rateNum / 100).toString() + "%");

      const userLoanRaw = await loanContract.methods.userLoans(account).call();
      const statusArr = ["无贷款", "申请中", "已放款（还款中）", "已结清"];
      const statusText = statusArr[Number(userLoanRaw.status)] || "未知";

      const startTimeFormatted =
        Number(userLoanRaw.startTime) === 0
            ? "-"
            : new Date(Number(userLoanRaw.startTime) * 1000).toLocaleString();

      if (statusText === "无贷款") {
        // 已还清或未贷款，设置为空
        setUserLoan(null);
      } else {
        // 正常填充信息
        setUserLoan({
            amount: newWeb3.utils.fromWei(userLoanRaw.amount.toString(), "ether"),
            interest: newWeb3.utils.fromWei(userLoanRaw.interest.toString(), "ether"),
            repaid: newWeb3.utils.fromWei(userLoanRaw.repaid.toString(), "ether"),
            duration: (Number(userLoanRaw.duration) / 86400).toFixed(2) + "天",
            startTime: startTimeFormatted,
            status: statusText,
        });
      }
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
        .approve(ERC20_LOAN_CONTRACT_ADDRESS, amountInWei)
        .send({ from: account });
  
      await getTokenBalances();
      alert("授权成功！");
    } catch (err) {
      console.error("授权失败:", err);
      alert("授权失败，请检查控制台日志");
    }
  
    setApproving(false); // 结束 loading
  };

  // 用户申请贷款
  const handleRequestLoan = async () => {
    if (!loanAmountInput || !loanDurationInput) {
        alert("请填写完整贷款金额和期限！");
        return;
    }
    setLoadingRequestLoan(true);
    try {
        const web3 = new Web3(window.shukechain);
        const contract = new web3.eth.Contract(ERC20LoanABI, ERC20_LOAN_CONTRACT_ADDRESS);

        let durationInSeconds;
        if (loanDurationUnit === 'days') {
            durationInSeconds = Number(loanDurationInput) * 86400;
        } else if (loanDurationUnit === 'months') {
            durationInSeconds = Number(loanDurationInput) * 30 * 86400;
        } else if (loanDurationUnit === 'years') {
            durationInSeconds = Number(loanDurationInput) * 365 * 86400;
        }

        await contract.methods.requestLoan(Number(loanAmountInput), durationInSeconds).send({ from: account });
        alert("贷款申请已提交！");
        await getTokenBalances();
    } catch (err) {
        console.error(err);
        alert("贷款申请失败！");
    }
    setLoadingRequestLoan(false);
  };

  // 管理员审批贷款
  const handleApproveLoan = async () => {
    if (!borrowerAddress) {
      alert("请输入需要放款的借款人地址！");
      return;
    }
    setLoadingApproveLoan(true);
    try {
      const web3 = new Web3(window.shukechain);
      const contract = new web3.eth.Contract(ERC20LoanABI, ERC20_LOAN_CONTRACT_ADDRESS);

      const userLoanRaw = await contract.methods.userLoans(borrowerAddress).call();
      const amount =  web3.utils.fromWei(userLoanRaw.amount.toString(), "ether");

      console.log("Number(loanPool):", Number(loanPool));
      console.log("Number(amount):", Number(amount));
      if (Number(loanPool) < Number(amount)) {
        alert("资金池资金不足！");
        setLoadingApproveLoan(false);
        return;
      }

      await contract.methods.approveLoan(borrowerAddress).send({ from: account });
      alert("放款成功！");
      await getTokenBalances();
    } catch (err) {
      console.error(err);
      alert("放款失败！");
    }
    setLoadingApproveLoan(false);
  };

  // 用户还款
  const handleRepayLoan = async () => {
    if (!repayAmountInput) {
      alert("请输入还款金额！");
      return;
    }
    setLoadingRepayLoan(true);
    try {
      const web3 = new Web3(window.shukechain);
      const contract = new web3.eth.Contract(ERC20LoanABI, ERC20_LOAN_CONTRACT_ADDRESS);

      console.log("Number(erc20Allowance):", Number(erc20Allowance));
      console.log("Number(repayAmountInput):", Number(repayAmountInput));
      console.log("Number(erc20Balance):", Number(erc20Balance));
      if (Number(erc20Allowance) < Number(repayAmountInput)) {
        alert("请先在钱包中授权合约足够的代币额度再进行还款！");
        setLoadingRepayLoan(false);
        return;
      }

      // 查询余额
      if (Number(erc20Balance) < Number(repayAmountInput)) {
        alert("账户余额不足，无法还款！");
        setLoadingRepayLoan(false);
        return;
      }

      await contract.methods.repay(Number(repayAmountInput)).send({ from: account });
      alert("还款成功！");
      await getTokenBalances();
    } catch (err) {
      console.error(err);
      alert("还款失败！");
    }
    setLoadingRepayLoan(false);
  };

  // 更新年利率
  const handleUpdateAnnualRate = async () => {
    if (!newAnnualRate) {
        alert("请输入新的年化利率");
        return;
    }
    setLoadingUpdateRate(true);
    try {
        const web3 = new Web3(window.shukechain);
        const contract = new web3.eth.Contract(ERC20LoanABI, ERC20_LOAN_CONTRACT_ADDRESS);

        await contract.methods.updateAnnualInterestRate(newAnnualRate).send({ from: account });

        await getTokenBalances();
        alert("年化利率更新成功！");
    } catch (err) {
        console.error(err);
        alert("年化利率更新失败，请查看控制台");
    }
    setLoadingUpdateRate(false);
  };

  // 向资金池注入资金
  const handleAddFunds = async () => {
    if (!addFundsAmount) {
        alert("请输入注入金额！");
        return;
    }

    setLoadingAddFunds(true);
    try {
        const web3 = new Web3(window.shukechain);
        const contract = new web3.eth.Contract(ERC20LoanABI, ERC20_LOAN_CONTRACT_ADDRESS);

        console.log("Number(erc20Allowance):", Number(erc20Allowance));
        console.log("Number(addFundsAmount):", Number(addFundsAmount));
        console.log("Number(erc20Balance):", Number(erc20Balance));
        if (Number(erc20Allowance) < Number(addFundsAmount)) {
          alert("请先在钱包中授权合约足够的代币额度再进行资金注入！");
          setLoadingAddFunds(false);
          return;
        }
  
        // 查询余额
        if (Number(erc20Balance) < Number(addFundsAmount)) {
          alert("账户余额不足，无法还款！");
          setLoadingAddFunds(false);
          return;
        }
  
        await contract.methods.addFunds(Number(addFundsAmount)).send({
            from: account,
        });

        setAddFundsAmount("");
        await getTokenBalances();
        alert("注入资金成功！");
    } catch (err) {
        console.error("注入资金失败：", err);
        alert("注入资金失败，请检查控制台日志");
    }
    setLoadingAddFunds(false);
  };

  // 银行管理员提现资金池款项   
  const handleWithdraw = async () => {
    if (!withdrawAmount) {
        alert("请输入需要提取的金额！");
        return;
    }
    setLoadingWithdraw(true);
    try {
        const web3 = new Web3(window.shukechain);
        const contract = new web3.eth.Contract(ERC20LoanABI, ERC20_LOAN_CONTRACT_ADDRESS);

        await contract.methods.withdraw(Number(withdrawAmount)).send({
            from: account,
        });

        await getTokenBalances();
        alert("提现成功！");
        setWithdrawAmount("");
    } catch (err) {
        console.error("提现失败：", err);
        alert("提现失败，请检查控制台日志");
    }
    setLoadingWithdraw(false);
};

  return (
    <div className="app-container">
      <h1>银行贷款</h1>
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
        <h2>贷款池信息</h2>
        <p>贷款池可用余额：{loanPool} 元</p>
        <p>年化利率：{annualRate}</p>

        <hr style={{ margin: '30px 0', borderTop: '1px solid #ccc' }} />

        <h2>我的贷款信息</h2>
        {userLoan ? (
        <>
            <p>状态：{userLoan.status}</p>
            <p>本金：{userLoan.amount}</p>
            <p>应付利息：{userLoan.interest}</p>
            <p>已还款：{userLoan.repaid}</p>
            <p>贷款时长：{userLoan.duration}</p>
            <p>贷款开始时间：{userLoan.startTime}</p>
        </>
        ) : (
        <p>暂无贷款信息</p>
        )}

        <hr style={{ margin: '30px 0', borderTop: '1px solid #ccc' }} />

        <h2>申请贷款</h2>
        <input
            type="number"
            placeholder="贷款金额（元）"
            value={loanAmountInput}
            onChange={(e) => setLoanAmountInput(e.target.value)}
            className="input"
        />
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <input
                type="number"
                placeholder="贷款期限"
                value={loanDurationInput}
                onChange={(e) => setLoanDurationInput(e.target.value)}
                className="input"
                style={{ flex: 1 }}
            />
            <select
                value={loanDurationUnit}
                onChange={(e) => setLoanDurationUnit(e.target.value)}
                className="input"
                style={{ width: '80px' }}
            >
                <option value="days">天</option>
                <option value="months">月</option>
                <option value="years">年</option>
            </select>
        </div>
        <button onClick={handleRequestLoan} disabled={loadingRequestLoan}>
            {loadingRequestLoan ? "处理中..." : "申请贷款"}
        </button>

        <hr style={{ margin: '30px 0', borderTop: '1px solid #ccc' }} />

        <h2>还款</h2>
        <input
            type="number"
            placeholder="还款金额（元）"
            value={repayAmountInput}
            onChange={(e) => setRepayAmountInput(e.target.value)}
            className="input"
        />
        <button onClick={handleRepayLoan} disabled={loadingRepayLoan}>
            {loadingRepayLoan ? "处理中..." : "立即还款"}
        </button>

        <hr style={{ margin: '30px 0', borderTop: '1px solid #ccc' }} />

        <h2>银行管理功能</h2>

        <h3>向贷款池注入资金</h3>
        <input
            type="number"
            placeholder="注入金额（元）"
            value={addFundsAmount}
            onChange={(e) => setAddFundsAmount(e.target.value)}
            className="input"
        />
        <button onClick={handleAddFunds} disabled={loadingAddFunds}>
            {loadingAddFunds ? "注入中..." : "注入资金"}
        </button>

        <h3>管理员放款</h3>
        <input
            type="text"
            placeholder="借款人地址"
            value={borrowerAddress}
            onChange={(e) => setBorrowerAddress(e.target.value)}
            className="input"
        />
        <button onClick={handleApproveLoan} disabled={loadingApproveLoan}>
            {loadingApproveLoan ? "处理中..." : "审批并放款"}
        </button>

        <h3>修改年化利率</h3>
        <input
            type="number"
            placeholder="新的年化利率（乘以100，例如500表示5%）"
            value={newAnnualRate}
            onChange={(e) => setNewAnnualRate(e.target.value)}
            className="input"
        />
        <button onClick={handleUpdateAnnualRate} disabled={loadingUpdateRate}>
            {loadingUpdateRate ? "更新中..." : "更新年化利率"}
        </button>

        <h3>提取贷款池资金</h3>
        <input
            type="number"
            placeholder="提现金额（元）"
            value={withdrawAmount}
            onChange={(e) => setWithdrawAmount(e.target.value)}
            className="input"
        />
        <button onClick={handleWithdraw} disabled={loadingWithdraw}>
            {loadingWithdraw ? "提现中..." : "提现资金"}
        </button>

      </div>  

      <div className="create-approve-container">
        <h1>授权模块</h1>

        {/* 当前已授权信息 */}
        <div>
          <span>当前账户已授权给 <strong>银行贷款系统</strong>：</span>
          <p>人民币：{erc20Allowance} 个</p>
        </div>

        {/* 授权 ERC20 */}
        <div>
          <h3>人民币 授权</h3>
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
      </div>

    </div>
  );
}

export default LoanPage;



