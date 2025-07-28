// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import {Initializable} from "./openzeppelin/contracts-upgradeable/proxy/utils/Initializable.sol";
import {OwnableUpgradeable} from "./openzeppelin/contracts-upgradeable/access/OwnableUpgradeable.sol";
import {MyToken} from "./ERC20.sol";

// ERC20 贷款合约（固定年化利率）
contract ERC20LoanContract is Initializable, OwnableUpgradeable {
// contract ERC20LoanContract is Ownable {

    uint256 public annualInterestRate; // 年化利率 乘以100表示（即值为100表示：1%，500表示：5%）
    uint256 public totalLoanPool; // 当前贷款池可放贷 ERC20 余额

    MyToken public loanToken; // 用作贷款和还款的 ERC20 代币

    enum LoanStatus { None, Requested, Active, Closed } // 新增贷款状态枚举

    struct Loan {
        uint256 amount;      // 贷款本金
        uint256 interest;    // 应支付利息
        uint256 startTime;   // 放款时间
        uint256 duration;    // 贷款期限（秒）
        uint256 repaid;      // 已还款金额
        LoanStatus status;   // 贷款状态
    }

    mapping(address => Loan) public userLoans;

    event LoanRequested(address indexed user, uint256 amount, uint256 duration);
    event LoanApproved(address indexed user, uint256 amount, uint256 interest);
    event Repaid(address indexed user, uint256 amount);
    event FundsAdded(uint256 amount);

    // 初始化
    function initialize(uint256 _annualInterestRate, address _loanToken) public initializer {
        __Ownable_init(msg.sender);

        require(_loanToken != address(0), "Invalid ERC20 address");
        annualInterestRate = _annualInterestRate;
        loanToken = MyToken(_loanToken);
    }

    // 银行（owner）向贷款池注入 ERC20 资金
    // 需要先对合约执行 approve 授权
    function addFunds(uint256 amount) external onlyOwner {
        require(amount > 0, "Amount must be > 0");
        loanToken.transferFrom(msg.sender, address(this), amount * 10**18);
        totalLoanPool += amount  * 10**18;
        emit FundsAdded(amount);
    }

    // 用户申请贷款
    // （需要抵押物或者抵押保证金的时候）用户需先调用 ERC20 approve 授权合约拉取贷款本金
    function requestLoan(uint256 amount, uint256 duration) external {
        Loan storage loan = userLoans[msg.sender];
        require(
            loan.status == LoanStatus.None || loan.status == LoanStatus.Closed,
            "Existing loan or pending approval"
        );
        require(amount > 0, "Amount must be > 0");

        // 用户将贷款本金发送给合约，作为抵押或保证金（可根据业务需要调整是否收取，如需抵押保证金，可以在加一个参数传递本金的数量，同时授权本金给合约，然后把本金转给合约）
        // loanToken.transferFrom(msg.sender, address(this), amount * 10**18);

        userLoans[msg.sender] = Loan({
            amount: amount * 10**18,
            interest: 0,
            startTime: 0,
            duration: duration,
            repaid: 0,
            status: LoanStatus.Requested // 状态标记为申请中
        });

        emit LoanRequested(msg.sender, amount, duration);
    }

    // 银行审批并放款
    function approveLoan(address borrower) external onlyOwner {
        Loan storage loan = userLoans[borrower];
        require(loan.status == LoanStatus.Requested, "No pending loan request");
        require(loan.startTime == 0, "Already approved");

        uint256 interest = loan.amount * annualInterestRate * loan.duration / 365 days / 10000;
        loan.interest = interest;
        loan.startTime = block.timestamp;
        loan.status = LoanStatus.Active; // 状态改为已激活

        require(totalLoanPool >= loan.amount, "Insufficient loan pool");
        totalLoanPool -= loan.amount;

        loanToken.transfer(borrower, loan.amount);

        emit LoanApproved(borrower, loan.amount, interest);
    }

    // 用户偿还贷款（本金 + 利息）
    // 用户需先调用 ERC20 approve 授权合约拉取还款金额
    function repay(uint256 amount) external {
        Loan storage loan = userLoans[msg.sender];
        require(loan.status == LoanStatus.Active, "No active loan");

        uint256 totalDue = loan.amount + loan.interest;
        require(amount > 0, "Amount must be > 0");
        require(loan.repaid + amount * 10**18 <= totalDue, "Repaying more than due");

        loanToken.transferFrom(msg.sender, address(this), amount * 10**18);
        loan.repaid += amount * 10**18;
        totalLoanPool += amount * 10**18;

        if (loan.repaid == totalDue) {
            loan.status = LoanStatus.Closed; // 状态改为已关闭
        }

        emit Repaid(msg.sender, amount);
    }

    // 更新年化利率
    function updateAnnualInterestRate(uint256 newRate) external onlyOwner {
        annualInterestRate = newRate;
    }

    // 查询用户剩余应还款金额
    function getAmountDue(address user) external view returns (uint256) {
        Loan memory loan = userLoans[user];
        if (loan.status != LoanStatus.Active) return 0;
        return loan.amount + loan.interest - loan.repaid;
    }

    // 银行提取 ERC20 余额（不影响已承诺给贷款池的资金）
    function withdraw(uint256 amount) external onlyOwner {
        // require(amount <= loanToken.balanceOf(address(this)) - totalLoanPool, "Exceeds withdrawable balance");
        loanToken.transfer(owner(), amount * 10**18);
        totalLoanPool -= amount * 10**18;
    }

    // 返回当前区块时间戳（单位：秒）
    function getCurrentTimestamp() external view returns (uint256) {
        return block.timestamp;
    }

    // 返回 Solidity 中 365 days 代表的秒数
    function getSecondsIn365Days() external pure returns (uint256) {
        return 365 days; // Solidity 内置单位，等于 365*24*60*60 = 31536000
    }

}
