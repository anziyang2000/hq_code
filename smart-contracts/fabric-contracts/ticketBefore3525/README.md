# README

## 参数配置

注：此版本为门票未做分割处理的存储版本
在运行合约之前，请确保已经正确配置以下参数：

- **Fabric 网络配置**：确保 Fabric 网络已正确搭建并配置，且 peer 节点和 orderer 节点正常运行。
- **合约配置**：将合约部署到 Fabric 网络的链码容器中。

## 运行方式

1. **部署合约**

   将合约部署到 Fabric 网络中。

   ```sh
   cd /fabric-deploy/
   ./network.sh chaincode ccDeploy -deploy_mode multi -channel_name tourism -org_name yilvtong -ccn digital-tickets -ccv 1.0.0 -ccs 1 -ccp /node-data/code/smart-contracts/fabric-contracts/ticket3525/ -ccl javascript
   ```

2. **初始化合约**

   使用 CLI 调用 `Initialize` 函数：

   ```sh
   export FABRIC_CFG_PATH=/fabric-deploy/data/org/yilvtong/peers/peer1
   export ContractName="digital-tickets"

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

### 协议功能

1. **Mint**

   铸造新的 NFT 代币。

   - **函数**: `Mint`
   - **描述**: 铸造一个新的门票库存
   - **参数**:
     - `tokenId`(String): 要创建的库存 ID
     - `to`(String): 要铸造的非同质代币的唯一标识符
     - `slot`(JSON Object): 有关票证信息
     - `balance`(String): 要铸造的非同质代币的数量
     - `metadata`(JSON Object): 有关票证信息的其他附加信息
     - `triggerTime`(String): 合约事件记录的时间戳
   - **返回值(Object)：** 门票库存的对象

### 订单管理

1. **StoreOrder**

   C 端订单上链。

   - **函数**: `StoreOrder`
   - **描述**: 存储订单数据到区块链中
   - **参数**: 
     - `ticketsData`(JSON Object): 有关订单数据的对象
     - `triggerTime`(String): 合约事件记录的时间戳
   - **返回值(Boolean)：** 成功返回 `true`，否则抛出 throw

2. **StoreRefund**

   C 端退单上链。

   - **函数**: `StoreRefund`
   - **描述**: C 端退单上链，以及转移门票所有权
   - **参数**: 
     - `orderData`(Object String): 有关退单数据的对象
     - `triggerTime`(String): 合约事件记录的时间戳
   - **返回值(Boolean)：** 成功返回 `true`，否则抛出 throw

3. **DistributionOrder**

   B 端购票及订单上链。

   - **函数**: `DistributionOrder`
   - **描述**: 采购订单上链，以及转移门票所有权
   - **参数**: 
     - `transferDetails`(Object Array): 有关门票所有权转移的信息详情
     - `orderData`(Object String): 有关订单数据对象
     - `triggerTime`(String): 合约事件记录的时间戳
   - **返回值(Boolean)：** 成功返回 `true`，否则抛出 throw

4. **DistributionRefund**

   B 端退票及订单上链。

   - **函数**: `DistributionRefund`
   - **描述**: 采购退单上链，以及转移门票所有权
   - **参数**: 
     - `transferDetails`(Object Array): 有关门票所有权转移的信息详情
     - `orderData`(Object String): 有关退单数据对象
     - `triggerTime`(String): 合约事件记录的时间戳
   - **返回值(Boolean)：** 成功返回 `true`，否则抛出 throw

5. **ReadOrder**

   读取订单信息。

   - **函数**: `ReadOrder`
   - **描述**: 读取订单信息
   - **参数**: 
     - `orderId`(String): 唯一订单号标识
   - **返回值(Object)：** 返回订单信息

### 票务管理

1. **UpdatePriceInfo**

   设置门票价格策略。

   - **函数**: `UpdatePriceInfo`
   - **描述**: 更新直销、代理价格
   - **参数**:
     - `tokenId`(String): 要更新的库存的 ID
     - `type`(String): 判断是分销还是直销
     - `updatedFields`(JSON Object): 有关更新的价格信息
     - `triggerTime`(String): 合约事件记录的时间戳
   - **返回值(Boolean)：** 成功返回 `true`，否则抛出 throw

2. **VerifyTicket**

   门票核销。

   - **函数**: `VerifyTicket`
   - **描述**: 存储核验信息到区块链中
   - **参数**: 
     - `verifyInfosData`(JSON Array): 有关要存储的票务核销数据的数组
     - `triggerTime`(String): 合约事件记录的时间戳
   - **返回值(Boolean)：** 成功返回 `true`，否则抛出 throw

3. **UpdateIssueTickets**

   更新门票出票信息。

   - **函数**: `UpdateIssueTickets`
   - **描述**: 根据提供的票务数据创建票号ID、二维码、签名，并分割铸造出新门票，以及更新库存余额
   - **参数**: 
     - `ticketsData`(JSON Array): 有关要更新的票务数据
   - **返回值(Boolean)：** 成功返回 `true`，否则抛出 throw

4. **CreateTicketId**

   C 端出票。
   
   - **函数**: `CreateTicketId`
   - **描述**: 根据提供的出票信息更新对于的出票信息数据
   - **参数**:
     - `tokenIds`(Object Array): 库存的 ID 的数组
     - `issuanceType`(String): 判断是一票一人/一票多人
     - `ticketsData`(JSON Array): 有关创建票号的数据
     - `triggerTime`(String): 合约事件记录的时间戳
   - **返回值(JSON Array)：** 返回包含票号ID、二维码、签名对象的数组信息

5. **TimerUpdateTickets**

   过期门票状态推送。

   - **函数**: `TimerUpdateTickets`
   - **描述**: 过期更新票务信息
   - **参数**: 
     - `ticketsData`(JSON Array): 有关要更新的票务数据的数组
     - `triggerTime`(String): 合约事件记录的时间戳
   - **返回值(Boolean)：** 成功返回 `true`，否则抛出 throw

6. **ActivateTickets**

   激活门票。

   - **函数**: `ActivateTickets`
   - **描述**: 门票激活
   - **参数**: 
     - `activeInfo`(JSON Array): 有关要激活门票的数组
     - `triggerTime`(String): 合约事件记录的时间戳
   - **返回值(Boolean)：** 成功返回 `true`，否则抛出 throw

7. **ReadTicket**

   读取门票信息。

   - **函数**: `ReadTicket`
   - **描述**: 读取门票的完整信息
   - **参数**: 
     - `tokenId`(string): 要读取的门票的唯一标识符
   - **返回值(Boolean)：** 返回门票信息对象

### 交易管理

1. **StoreCreditInfo**

   预授信信息上链。

   - **函数**: `StoreCreditInfo`
   - **描述**: 预授信信息上链
   - **参数**: 
     - `type`(String): 区分新增、修改、激活
     - `creditData`(JSON Object): 有关要上链授信信息的对象
     - `triggerTime`(String): 合约事件记录的时间戳
   - **返回值(Boolean)：** 成功返回 `true`，否则抛出 throw

2. **TransferCredit**

   预授信交易。
   
   - **函数**: `TransferCredit`
   - **描述**: 预授信交易
   - **参数**: 
     - `from`(String): 交易发送方
     - `to`(String): 交易接收方
     - `creditData`(JSON Object): 有关要授信交易的对象
     - `triggerTime`(String): 合约事件记录的时间戳
   - **返回值(Boolean)：** 成功返回 `true`，否则抛出 throw

3. **PaymentFlow**

   银行流水存证上链。

   - **函数**: `PaymentFlow`
   - **描述**: 流水凭证上链
   - **参数**: 
     - `paymentInfo`(JSON Object): 有关要上链流水凭证的对象
     - `triggerTime`(String): 合约事件记录的时间戳
   - **返回值(Boolean)：** 成功返回 `true`，否则抛出 throw
        

       























