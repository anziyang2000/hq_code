# README

## 参数配置

在运行合约之前，请确保已经正确配置以下参数：

- **Fabric 网络配置**：确保 Fabric 网络已正确搭建并配置，且 peer 节点和 orderer 节点正常运行。
- **合约配置**：将合约部署到 Fabric 网络的链码容器中。

## 运行方式

1. **部署合约**

   将合约部署到 Fabric 网络中。

   ```sh
   cd /fabric-deploy/
   ./network.sh chaincode ccDeploy -deploy_mode multi -channel_name tourism -org_name yilvtong -ccn financial-system -ccv 1.0.0 -ccs 1 -ccp /node-data/code/smart-contracts/fabric-contracts/finance/ -ccl javascript
   ```

2. **初始化合约**

   使用 CLI 调用 `Initialize` 函数：

   ```sh
   export FABRIC_CFG_PATH=/fabric-deploy/data/org/yilvtong/peers/peer1
   export ContractName="financial-system"

   export CORE_PEER_TLS_ENABLED=true
   export CORE_PEER_LOCALMSPID="yilvtong"
   export CORE_PEER_TLS_ROOTCERT_FILE=/fabric-deploy/data/org/yilvtong/peers/peer1/tls-msp/tlscacerts/tls-cacerts.pem
   export CORE_PEER_MSPCONFIGPATH=/fabric-deploy/data/org/yilvtong/users/0xsksta91e425813dbbfe97b0f8b7ce743e78899af/msp
   export CORE_PEER_ADDRESS=peer1.yilvtong:7001

   peer chaincode invoke -o order1.datamint:5001 --ordererTLSHostnameOverride order1.datamint --tls --cafile "/fabric-deploy/data/org/datamint/orders/order1/tls-msp/tlscacerts/tls-cacerts.pem" \
   -C tourism -n $ContractName \
   --peerAddresses peer1.yilvtong:7001 --tlsRootCertFiles "/fabric-deploy/data/org/yilvtong/peers/peer1/tls-msp/tlscacerts/tls-cacerts.pem" \
   --peerAddresses peer1.upaypal:7005 --tlsRootCertFiles "/fabric-deploy/data/org/upaypal/peers/peer1/tls-msp/tlscacerts/tls-cacerts.pem" \
   --peerAddresses peer1.notarization:7009 --tlsRootCertFiles "/fabric-deploy/data/org/notarization/peers/peer1/tls-msp/tlscacerts/tls-cacerts.pem" \
   -c '{"function":"Initialize","Args":["ticket", "TICKET", "yilvtong", "0xsksta91e425813dbbfe97b0f8b7ce743e78899af"]}'
   ```

## 接口列表

### 权限管理

1. **SetOrgAdmin**

   设置组织管理员。

   - **函数**: `SetOrgAdmin`
   - **描述**: 设置组织的管理员
   - **参数**:
     - `org`(String): 组织名称
     - `admin`(String): 管理员地址
   - **返回值(Boolean)：** 成功返回 `true`，否则抛出 throw

2. **GetOrgAdmins**

   获取组织管理员列表。

   - **函数**: `GetOrgAdmins`
   - **描述**: 检索组织到其管理员的映射
   - **返回值(Object)：** 组织到其管理员的映射

3. **SetLock**

   设置锁定状态。

   - **函数**: `SetLock`
   - **描述**: 设置合约锁定状态
   - **返回值(Boolean)：** 成功返回 `true`，否则抛出 throw

4. **GetLock**

   获取锁定状态。

   - **函数**: `GetLock`
   - **描述**: 获取合约的锁定状态
   - **返回值(Boolean)：** `true` 表示合约锁定，`false` 表示合约未锁定


### 金融系统上链接口

1. **StoreCreditRating**

   完成信用评估后，即每次企业累计得分变更时，进行信用评估结果上链。

   - **函数**: `StoreCreditRating`
   - **描述**: 存储企业信用评估结果的信息到区块链中
   - **参数**: 
     - `ctx`: 交易上下文
     - `dataInfo`(Object): 有关信用评估结果信息的 JSON 对象，其数据结构如下：
     ```JavaScript
      // 完成信用评估后，信用评估结果上链
      const CreditRating = {
         // 企业名称
         legalName: '',
         // 企业统一信用代码
         registrationNumber: '',
         // 企业累计得分
         score: '',
         // 等级
         level: '',
         // 更新时间
         assessmentTime: ''
      };
     ```
   - **返回值(Boolean)：** 成功返回 `true`，否则抛出 throw
   - **上链的数据结构：** 
      - key：交易哈希作为key
      - value：整体的dataInfo参数

2. **StoreLoanApplication**

   贷款申请成功后，进行申请贷款上链。

   - **函数**: `StoreLoanApplication`
   - **描述**: 存储贷款申请的信息到区块链中
   - **参数**: 
     - `ctx`: 交易上下文
     - `dataInfo`(Object): 有关贷款申请信息的 JSON 对象，其数据结构如下：
     ```JavaScript
      // 贷款申请
      const LoanApplication = {
         // 贷款申请单号
         applicationNo: '',
         // 企业名称
         legalName: '',
         // 统一信用代码（旅行商）
         debtorRegistrationNumber: '',
         // 所有者权益（万元）
         ownersEquity: '',
         // 许可经营范围
         businessScope: '',
         // 企业经济类型
         businessEconomicType: '',
         // 企业电话
         businessPhone: '',
         // 企业传真
         businessFax: '',
         // 企业邮箱
         businessEmail: '',
         // 申请金融机构
         creditorName: '',
         // 统一信用代码（金融机构）
         creditorRegistrationNumber: '',
         // 融资用途
         financingPurpose: '',
         // 信用等级
         level: '',
         // 拟授信额度
         proposedCreditLimit: '',
         // 申请时间
         createTime: ''
      };
     ```
   - **返回值(Boolean)：** 成功返回 `true`，否则抛出 throw
   - **上链的数据结构：** 
      - key：交易哈希作为key
      - value：整体的dataInfo参数

3. **StoreLoanApproval**

   贷款申请审批上链（通过）。

   - **函数**: `StoreLoanApproval`
   - **描述**: 存储贷款申请通过审批上链信息到区块链中
   - **参数**: 
     - `ctx`: 交易上下文
     - `dataInfo`(Object): 有关贷款申请通过审批上链信息的 JSON 对象，其数据结构如下：
     ```JavaScript
      // 贷款审核（通过）
      const LoanApproval = {
         // 贷款申请单号
         applicationNo: '',
         // 企业名称
         legalName: '',
         // 统一信用代码（旅行商）
         debtorRegistrationNumber: '',
         // 所有者权益（万元）
         ownersEquity: '',
         // 许可经营范围
         businessScope: '',
         // 企业经济类型
         businessEconomicType: '',
         // 企业电话
         businessPhone: '',
         // 企业传真
         businessFax: '',
         // 企业邮箱
         businessEmail: '',
         // 申请金融机构
         creditorName: '',
         // 统一信用代码（金融机构）
         creditorRegistrationNumber: '',
         // 融资用途
         financingPurpose: '',
         // 信用等级
         level: '',
         // 拟授信额度
         proposedCreditLimit: '',
         // 申请时间
         createTime: '',
         // 审批结果
         creditStatus: '',
         // 最大预授信额度（元）
         creditLine: '',
         // 借款期限
         expiresTime: '',
         // 还款方式
         repaymentType: '',
         // 年利率
         rate: '',
         // 期数
         periods: 0,
         // 每月还款日期
         monthlyRepaymentDay: 0,
         // 逾期日利率
         overdueRate: '',
         // 收款单位名称
         repaymentName: '',
         // 收款单位银行账号
         repaymentBankAccount: '',
         // 收款单位开户银行名称
         repaymentBankName: '',
         // 审批时间
         modifyTime: ''
      };
     ```
   - **返回值(Boolean)：** 成功返回 `true`，否则抛出 throw
   - **上链的数据结构：** 
      - key：交易哈希作为key
      - value：整体的dataInfo参数

4. **StoreLoanApprovalFailed**

   贷款申请审批上链（不通过）。

   - **函数**: `StoreLoanApprovalFailed`
   - **描述**: 存储贷款申请未通过审批上链信息到区块链中
   - **参数**: 
     - `ctx`: 交易上下文
     - `dataInfo`(Object): 有关贷款申请未通过审批上链信息的 JSON 对象，其数据结构如下：
     ```JavaScript
      // 贷款审核（不通过）
      const LoanApprovalFailed = {
         // 贷款申请单号
         applicationNo: '',
         // 企业名称
         legalName: '',
         // 统一信用代码（旅行商）
         debtorRegistrationNumber: '',
         // 所有者权益（万元）
         ownersEquity: '',
         // 许可经营范围
         businessScope: '',
         // 企业经济类型
         businessEconomicType: '',
         // 企业电话
         businessPhone: '',
         // 企业传真
         businessFax: '',
         // 企业邮箱
         businessEmail: '',
         // 申请金融机构
         creditorName: '',
         // 统一信用代码（金融机构）
         creditorRegistrationNumber: '',
         // 融资用途
         financingPurpose: '',
         // 信用等级
         level: '',
         // 拟授信额度
         proposedCreditLimit: '',
         // 申请时间
         createTime: '',
         // 审批结果
         creditStatus: '',
         // 不通过原因：
         creditAuditRemark: '',
         // 审批时间
         modifyTime: ''
      };
     ```
   - **返回值(Boolean)：** 成功返回 `true`，否则抛出 throw
   - **上链的数据结构：** 
      - key：交易哈希作为key
      - value：整体的dataInfo参数

5. **StoreLoanReApplication**

   贷款审核失败后，再次申请贷款上链。

   - **函数**: `StoreLoanReApplication`
   - **描述**: 存储再次贷款申请信息到区块链中
   - **参数**: 
     - `ctx`: 交易上下文
     - `dataInfo`(Object): 有关贷款申请信息的 JSON 对象，其数据结构如下：
     ```JavaScript
      // 贷款申请
      const LoanApplication = {
         // 贷款申请单号
         applicationNo: '',
         // 企业名称
         legalName: '',
         // 统一信用代码（旅行商）
         debtorRegistrationNumber: '',
         // 所有者权益（万元）
         ownersEquity: '',
         // 许可经营范围
         businessScope: '',
         // 企业经济类型
         businessEconomicType: '',
         // 企业电话
         businessPhone: '',
         // 企业传真
         businessFax: '',
         // 企业邮箱
         businessEmail: '',
         // 申请金融机构
         creditorName: '',
         // 统一信用代码（金融机构）
         creditorRegistrationNumber: '',
         // 融资用途
         financingPurpose: '',
         // 信用等级
         level: '',
         // 拟授信额度
         proposedCreditLimit: '',
         // 申请时间
         createTime: ''
      };
     ```
   - **返回值(Boolean)：** 成功返回 `true`，否则抛出 throw
   - **上链的数据结构：** 
      - key：交易哈希作为key
      - value：整体的dataInfo参数

6. **StoreBorrowApplication**

   提交借款申请后，进行申请借款上链。

   - **函数**: `StoreBorrowApplication`
   - **描述**: 存储申请借款信息到区块链中
   - **参数**: 
     - `ctx`: 交易上下文
     - `dataInfo`(Object): 有关申请借款信息的 JSON 对象，其数据结构如下：
     ```JavaScript
      // 借款申请
      const BorrowApplication = {
         // 商户订单号
         outTradeNo: '',
         // 申请借款金额（元）
         loanAmount: '',
         // 旅行商
         debtorName: '',
         // 统一信用代码（旅行商）
         debtorRegistrationNumber: '',
         // 申请金融机构
         creditorName: '',
         // 统一信用代码（金融机构）
         creditorRegistrationNumber: '',
         // 交易所
         exchangeName: '',
         // 统一信用代码（交易所）
         exchangeRegistrationNumber: '',
         // 收款单位名称
         receiverCorporateName: '',
         // 收款单位银行账号
         receiverBankAccountNo: '',
         // 收款单位开户银行名称
         receiverBankName: '',
         // 交易订单凭证
         tradeOrderFileUrl: '',
         // 存缴履约保证金凭证
         cautionMoneyFileUrl: '',
         // 受托支付单凭证
         paymentBookFileUrl: '',
         // 申请时间
         applyTime: ''
      };
     ```
   - **返回值(Boolean)：** 成功返回 `true`，否则抛出 throw
   - **上链的数据结构：** 
      - key：交易哈希作为key
      - value：整体的dataInfo参数

7. **StoreBorrowApproval**

   打款成功后，进行借款审批通过上链。

   - **函数**: `StoreBorrowApproval`
   - **描述**: 存储借款审批通过信息到区块链中
   - **参数**: 
     - `ctx`: 交易上下文
     - `dataInfo`(Object): 有关借款审批通过信息的 JSON 对象，其数据结构如下：
     ```JavaScript
      // 借款审核
      const BorrowApproval = {
         // 商户订单号
         outTradeNo: '',
         // 申请借款金额（元）
         loanAmount: '',
         // 旅行商
         debtorName: '',
         // 统一信用代码（旅行商）
         debtorRegistrationNumber: '',
         // 申请金融机构
         creditorName: '',
         // 统一信用代码（金融机构）
         creditorRegistrationNumber: '',
         // 交易所
         exchangeName: '',
         // 统一信用代码（交易所）
         exchangeRegistrationNumber: '',
         // 收款单位名称
         receiverCorporateName: '',
         // 收款单位银行账号
         receiverBankAccountNo: '',
         // 收款单位开户银行名称
         receiverBankName: '',
         // 交易订单凭证
         tradeOrderFileUrl: '',
         // 存缴履约保证金凭证
         cautionMoneyFileUrl: '',
         // 受托支付单凭证
         paymentBookFileUrl: '',
         // 银行水单图片
         payBankSlipFileUrl: '',
         // 付款单位银行交易流水号
         payBankTradeNo: '',
         // 付款单位名称
         payCorporateName: '',
         // 付款单位银行账号
         payBankAccountNo: '',
         // 付款单位开户银行名称
         payBankName: '',
         // 审批时间
         payAuditTime: ''
      };
     ```
   - **返回值(Boolean)：** 成功返回 `true`，否则抛出 throw
   - **上链的数据结构：** 
      - key：交易哈希作为key
      - value：整体的dataInfo参数

8. **StoreRepaymentOrder**

   借款成功生成还款单时，进行生成还款单上链。

   - **函数**: `StoreRepaymentOrder`
   - **描述**: 存储还款单信息到区块链中
   - **参数**: 
     - `ctx`: 交易上下文
     - `dataInfo`(Object): 有关还款单信息的 JSON 对象，其数据结构如下：
     ```JavaScript
      // 还款单生成
      const RepaymentOrder = {
         // 商户订单号
         repaymentNo: '',
         // 旅行商
         debtorName: '',
         // 统一信用代码（旅行商）
         debtorRegistrationNumber: '',
         // 金融机构
         creditorName: '',
         // 统一信用代码（金融机构）
         creditorRegistrationNumber: '',
         // 贷款金额
         totalPrincipal: '',
         // 还款方式
         repaymentType: '',
         // 年利率
         rate: '',
         // 创建时间
         createTime: ''
      };
     ```
   - **返回值(Boolean)：** 成功返回 `true`，否则抛出 throw
   - **上链的数据结构：** 
      - key：交易哈希作为key
      - value：整体的dataInfo参数

9. **StoreRepaymentApplication**

   每一期申请还款时，进行申请还款上链。

   - **函数**: `StoreRepaymentApplication`
   - **描述**: 存储申请还款信息到区块链中
   - **参数**: 
     - `ctx`: 交易上下文
     - `dataInfo`(Object): 有关申请还款信息的 JSON 对象，其数据结构如下：
     ```JavaScript
      // 还款申请
      const RepaymentApplication = {
         // 商户订单号
         repaymentNo: '',
         // 旅行商
         debtorName: '',
         // 统一信用代码（旅行商）
         debtorRegistrationNumber: '',
         // 金融机构
         creditorName: '',
         // 统一信用代码（金融机构）
         creditorRegistrationNumber: '',
         // 贷款金额
         totalPrincipal: '',
         // 本金余额
         principal: '',
         // 还款方式
         repaymentType: '',
         // 年利率
         rate: '',
         // 期数
         periods: 0,
         // 当期还款日
         repaymentDate: '',
         // 是否逾期
         isOverdue: true,
         // 逾期金额
         penaltyInterest: '',
         // 当期还款金额
         amount: '',
         // 银行水单图片
         bankSlip: '',
         // 银行交易流水号
         payBankTradeNo: '',
         // 付款单位名称
         payUnitName: '',
         // 付款单位银行账号
         payBankAccountNo: '',
         // 付款单位开户银行名称
         payBankName: '',
         // 收款单位名称
         repaymentName: '',
         // 收款单位银行账号
         repaymentBankAccount: '',
         // 收款单位开户银行名称
         repaymentBankName: '',
         // 申请时间
         createTime: ''
      };
     ```
   - **返回值(Boolean)：** 成功返回 `true`，否则抛出 throw
   - **上链的数据结构：** 
      - key：交易哈希作为key
      - value：整体的dataInfo参数

10. **StoreRepaymentApproval**

   还款验证审批通过后，进行还款审批上链（通过）。

   - **函数**: `StoreRepaymentApproval`
   - **描述**: 存储通过审批还款信息到区块链中
   - **参数**: 
     - `ctx`: 交易上下文
     - `dataInfo`(Object): 有关通过审批还款信息的 JSON 对象，其数据结构如下：
     ```JavaScript
      // 还款审核（通过）
      const RepaymentApproval = {
         // 商户订单号
         repaymentNo: '',
         // 旅行商
         debtorName: '',
         // 统一信用代码（旅行商）
         debtorRegistrationNumber: '',
         // 金融机构
         creditorName: '',
         // 统一信用代码（金融机构）
         creditorRegistrationNumber: '',
         // 贷款金额
         totalPrincipal: '',
         // 本金余额
         principal: '',
         // 还款方式
         repaymentType: '',
         // 年利率
         rate: '',
         // 期数
         periods: 0,
         // 当期还款日
         repaymentDate: '',
         // 是否逾期
         isOverdue: true,
         // 逾期金额
         penaltyInterest: '',
         // 当期还款金额
         amount: '',
         // 银行水单图片
         bankSlip: '',
         // 银行交易流水号
         payBankTradeNo: '',
         // 付款单位名称
         payUnitName: '',
         // 付款单位银行账号
         payBankAccountNo: '',
         // 付款单位开户银行名称
         payBankName: '',
         // 收款单位名称
         repaymentName: '',
         // 收款单位银行账号
         repaymentBankAccount: '',
         // 收款单位开户银行名称
         repaymentBankName: '',
         // 审批结果
         repaymentStatus: '',
         // 审批时间
         modifyTime: ''
      };
     ```
   - **返回值(Boolean)：** 成功返回 `true`，否则抛出 throw
   - **上链的数据结构：** 
      - key：交易哈希作为key
      - value：整体的dataInfo参数

11. **StoreRepaymentApprovalFailed**

   还款验证审批通过后，进行还款审批上链（不通过）。

   - **函数**: `StoreRepaymentApprovalFailed`
   - **描述**: 存储未通过审批还款信息到区块链中
   - **参数**: 
     - `ctx`: 交易上下文
     - `dataInfo`(Object): 有关未通过审批还款信息的 JSON 对象，其数据结构如下：
     ```JavaScript
      // 还款审核（不通过）
      const RepaymentApprovalFailed = {
         // 商户订单号
         repaymentNo: '',
         // 旅行商
         debtorName: '',
         // 统一信用代码（旅行商）
         debtorRegistrationNumber: '',
         // 金融机构
         creditorName: '',
         // 统一信用代码（金融机构）
         creditorRegistrationNumber: '',
         // 贷款金额
         totalPrincipal: '',
         // 本金余额
         principal: '',
         // 还款方式
         repaymentType: '',
         // 年利率
         rate: '',
         // 期数
         periods: 0,
         // 当期还款日
         repaymentDate: '',
         // 是否逾期
         isOverdue: true,
         // 逾期金额
         penaltyInterest: '',
         // 当期还款金额
         amount: '',
         // 银行水单图片
         bankSlip: '',
         // 银行交易流水号
         payBankTradeNo: '',
         // 付款单位名称
         payUnitName: '',
         // 付款单位银行账号
         payBankAccountNo: '',
         // 付款单位开户银行名称
         payBankName: '',
         // 收款单位名称
         repaymentName: '',
         // 收款单位银行账号
         repaymentBankAccount: '',
         // 收款单位开户银行名称
         repaymentBankName: '',
         // 审批结果
         repaymentStatus: '',
         // 不通过原因
         remark: '',
         // 审批时间
         modifyTime: ''
      };
     ```
   - **返回值(Boolean)：** 成功返回 `true`，否则抛出 throw
   - **上链的数据结构：** 
      - key：交易哈希作为key
      - value：整体的dataInfo参数

12. **StoreReRepaymentApplication**

   还款验证审批不通过后，再次申请还款，进行上链。

   - **函数**: `StoreReRepaymentApplication`
   - **描述**: 存储再次申请还款信息到区块链中
   - **参数**: 
     - `ctx`: 交易上下文
     - `dataInfo`(Object): 有关申请还款信息的 JSON 对象，其数据结构如下：
     ```JavaScript
      // 还款申请
      const RepaymentApplication = {
         // 商户订单号
         repaymentNo: '',
         // 旅行商
         debtorName: '',
         // 统一信用代码（旅行商）
         debtorRegistrationNumber: '',
         // 金融机构
         creditorName: '',
         // 统一信用代码（金融机构）
         creditorRegistrationNumber: '',
         // 贷款金额
         totalPrincipal: '',
         // 本金余额
         principal: '',
         // 还款方式
         repaymentType: '',
         // 年利率
         rate: '',
         // 期数
         periods: 0,
         // 当期还款日
         repaymentDate: '',
         // 是否逾期
         isOverdue: true,
         // 逾期金额
         penaltyInterest: '',
         // 当期还款金额
         amount: '',
         // 银行水单图片
         bankSlip: '',
         // 银行交易流水号
         payBankTradeNo: '',
         // 付款单位名称
         payUnitName: '',
         // 付款单位银行账号
         payBankAccountNo: '',
         // 付款单位开户银行名称
         payBankName: '',
         // 收款单位名称
         repaymentName: '',
         // 收款单位银行账号
         repaymentBankAccount: '',
         // 收款单位开户银行名称
         repaymentBankName: '',
         // 申请时间
         createTime: ''
      };
     ```
   - **返回值(Boolean)：** 成功返回 `true`，否则抛出 throw
   - **上链的数据结构：** 
      - key：交易哈希作为key
      - value：整体的dataInfo参数