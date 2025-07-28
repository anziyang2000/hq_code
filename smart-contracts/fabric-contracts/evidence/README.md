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
   ./network.sh chaincode ccDeploy -deploy_mode multi -channel_name tourism -org_name yilvtong -ccn evidence -ccv 1.0.0 -ccs 1 -ccp /node-data/code/smart-contracts/fabric-contracts/evidence/ -ccl javascript
   ```

2. **初始化合约**

   使用 CLI 调用 `Initialize` 函数：

   ```sh
   export FABRIC_CFG_PATH=/fabric-deploy/data/org/yilvtong/peers/peer1
   export ContractName="evidence"

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

### 存证上链功能

1. **StoreEvidence**

   上链存证信息。

   - **函数**: `StoreEvidence`
   - **描述**: 用户上传文件之后的文件/文本的 hash、名称、时间等信息
   - **参数**:
     - `fileHash`(String): 文件/文本的哈希值，用于验证文件/文本完整性
     - `fileName`(String): 读取的文件名称
     - `fileTime`(JSON Object): 上传文件的时间
     - `tokenId`(String): 加密ID（还不太清楚这个字段的作用）
     - `userId`(JSON Object): 用户ID
     - `type`(String): 上传的类型
     - `name`(String): 用户在页面上输入的名称
     - `contentUrl`(String): 上传文件后返回的CID
   - **返回值(Object)：** 成功返回 `true`，否则抛出 throw
   - **事件的数据结构**:
      ```JavaScript
      const evidenceInfo = {
         // 文件哈希
         file_hash: '',
         // 读取的文件名称
         file_name: '',
         // 上传文件时间
         file_time: '',
         // 加密ID
         token_id: '',
         // 用户ID
         user_id: '',
         // 上传类型
         type: '',
         // 用户在页面上输入的名称
         name: '',
         // s上传文件后返回的CID
         content_url: ''
      };
      ```
   - **上链的数据结构**: 使用交易哈希作为 key
      ```JavaScript
      const value = {
         // 这里是读取文件的名称
         fileName: '',
         // 文件hash
         fileHash: '',
         // 上传文件的时间
         fileTime: ''
      }
      ```