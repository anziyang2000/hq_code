# README

## 参数配置

在运行合约之前，请确保已经正确配置以下参数：

- **Fabric 网络配置**：确保 Fabric 网络已正确搭建并配置，且 peer 节点和 orderer 节点正常运行。
- **合约配置**：将合约部署到 Fabric 网络的链码容器中。

## 运行方式

1. **部署合约代码**

   将合约部署到 Fabric 网络中。

   ```sh
   # 压缩合约代码：git@git.shukeyun.com:research-and-development/blockchain/blockchain-test.git
   cd blockchain-test/fabric-tx/contract
   tar -zcvf token20.tar.gz token20/

   # 传输代码到server
   cd /fabric-deploy
   mkdir -p chaincode
   cd chaincode
   rz
   tar -zxvf token20.tar.gz

   # 合约部署，合约代码来自于 blockchain-test/fabric-tx/contract/token20
   # 合约名称：digital-cash
   cd /fabric-deploy
   ./network.sh chaincode ccDeploy  -deploy_mode multi -channel_name tourism -org_name yilvtong -ccn digital-cash -ccv 1.0.0 -ccp /fabric-deploy/chaincode/token20 -ccl javascript

   # 合约名称：digital-loan
   cd /fabric-deploy
   ./network.sh chaincode ccDeploy  -deploy_mode multi -channel_name tourism -org_name yilvtong -ccn digital-loan -ccv 1.0.0 -ccp /fabric-deploy/chaincode/token20 -ccl javascript
   ```

2. **合约初始化**

   使用 CLI 调用 `Initialize` 函数：

   ```sh
   # digital-cash 合约初始参数:["digital-cash", "CASH", "9", "yilvtong", "0xsksta91e425813dbbfe97b0f8b7ce743e78899af"]
   export FABRIC_CFG_PATH=/fabric-deploy/data/org/yilvtong/peers/peer1
   export ContractName="digital-cash"

   export CORE_PEER_TLS_ENABLED=true
   export CORE_PEER_LOCALMSPID="yilvtong"
   export CORE_PEER_TLS_ROOTCERT_FILE=/fabric-deploy/data/org/yilvtong/peers/peer1/tls-msp/tlscacerts/tls-cacerts.pem
   export CORE_PEER_MSPCONFIGPATH=/fabric-deploy/data/org/yilvtong/users/0xsksta91e425813dbbfe97b0f8b7ce743e78899af/msp
   export CORE_PEER_ADDRESS=peer1.yilvtong:7001

   peer chaincode invoke -o order1.datamint:5001 --ordererTLSHostnameOverride order1.datamint --tls --cafile "/fabric-deploy/data/org/datamint/orders/order1/tls-msp/tlscacerts/tls-cacerts.pem" \
   -C tourism -n $ContractName \
   --peerAddresses peer1.yilvtong:7001 --tlsRootCertFiles "/fabric-deploy/data/org/yilvtong/peers/peer1/tls-msp/tlscacerts/tls-cacerts.pem" \
   --peerAddresses peer1.upaypal:7001 --tlsRootCertFiles "/fabric-deploy/data/org/upaypal/peers/peer1/tls-msp/tlscacerts/tls-cacerts.pem" \
   --peerAddresses peer1.notarization:7001 --tlsRootCertFiles "/fabric-deploy/data/org/notarization/peers/peer1/tls-msp/tlscacerts/tls-cacerts.pem" \
   -c '{"function":"Initialize","Args":["digital-cash", "CASH", "9", "yilvtong", "0xsksta91e425813dbbfe97b0f8b7ce743e78899af"]}'

   # digital-loan 合约初始参数:["digital-loan", "LOAN", "9", "yilvtong", "0xsksta91e425813dbbfe97b0f8b7ce743e78899af"]
   export FABRIC_CFG_PATH=/fabric-deploy/data/org/yilvtong/peers/peer1
   export ContractName="digital-loan"

   export CORE_PEER_TLS_ENABLED=true
   export CORE_PEER_LOCALMSPID="yilvtong"
   export CORE_PEER_TLS_ROOTCERT_FILE=/fabric-deploy/data/org/yilvtong/peers/peer1/tls-msp/tlscacerts/tls-cacerts.pem
   export CORE_PEER_MSPCONFIGPATH=/fabric-deploy/data/org/yilvtong/users/0xsksta91e425813dbbfe97b0f8b7ce743e78899af/msp
   export CORE_PEER_ADDRESS=peer1.yilvtong:7001

   peer chaincode invoke -o order1.datamint:5001 --ordererTLSHostnameOverride order1.datamint --tls --cafile "/fabric-deploy/data/org/datamint/orders/order1/tls-msp/tlscacerts/tls-cacerts.pem" \
   -C tourism -n $ContractName \
   --peerAddresses peer1.yilvtong:7001 --tlsRootCertFiles "/fabric-deploy/data/org/yilvtong/peers/peer1/tls-msp/tlscacerts/tls-cacerts.pem" \
   --peerAddresses peer1.upaypal:7001 --tlsRootCertFiles "/fabric-deploy/data/org/upaypal/peers/peer1/tls-msp/tlscacerts/tls-cacerts.pem" \
   --peerAddresses peer1.notarization:7001 --tlsRootCertFiles "/fabric-deploy/data/org/notarization/peers/peer1/tls-msp/tlscacerts/tls-cacerts.pem" \
   -c '{"function":"Initialize","Args":["digital-loan", "LOAN", "9", "yilvtong", "0xsksta91e425813dbbfe97b0f8b7ce743e78899af"]}'
   ```

## 合约功能

### 1. **初始化合约**

- **函数**: `Initialize`
- **描述**: 使用名称、符号、小数参数、组织名称和管理员名称初始化合约
- **参数**:
  - `name`(String): 代币名称
  - `symbol`(String): 代币符号
  - `decimals`(String): 代币小数位数
  - `org`(String): 组织名称
  - `admin`(String): 管理员名称
- **返回值(Boolean)：** 成功返回 `true`，否则抛出 throw
```json
successful returns:
{
    "code": 20000,
    "data": true
}
```

### 2. **获取代币名称**

- **函数**: `TokenName`
- **描述**: 检索代币的名称
- **返回值(String)：** 代币的名称
```json
successful returns:
{
    "code": 20000,
    "data": "hqsk"
}
```

### 3. **获取代币符号**

- **函数**: `Symbol`
- **描述**: 检索代币的符号
- **返回值(String)：** 代币的符号
```json
successful returns:
{
    "code": 20000,
    "data": "HQSK"
}
```

### 4. **获取代币小数位数**

- **函数**: `Decimals`
- **描述**: 检索代币的小数位数
- **返回值(Number)：** 代币的小数位数
```json
successful returns:
{
    "code": 20000,
    "data": 18
}
```

### 5. **获取总代币供应量**

- **函数**: `TotalSupply`
- **描述**: 检索代币的总供应量
- **返回值(Number)：** 代币的总供应量
```json
successful returns:
{
    "code": 20000,
    "data": 100000
}
```

### 6. **获取账户余额**

- **函数**: `BalanceOf`
- **描述**: 检索指定账户的代币余额
- **参数**:
  - `owner`(String): 要查询的账户地址
- **返回值(Number)：** 指定账户的余额
```json
successful returns:
{
    "code": 20000,
    "data": 100
}
```

### 7. **转移代币**

- **函数**: `Transfer`
- **描述**: 将代币从调用者账户转移给指定的接收者
- **参数**:
  - `to`(String): 接收者地址。
  - `value`(String): 要转移的代币数量
- **返回值(Boolean)：** 成功返回 `true`，否则抛出 throw
```json
successful returns:
{
    "code": 20000,
    "data": true
}
```

### 8. **从账户转移代币**

- **函数**: `TransferFrom`
- **描述**: 如果调用者已被所有者批准，将代币从一个账户转移给另一个账户
- **参数**:
  - `from`(String): 发送者地址
  - `to`(String): 接收者地址
  - `value`(String): 要转移的代币数量
- **返回值(Boolean)：** 成功返回 `true`，否则抛出 throw
```json
successful returns:
{
    "code": 20000,
    "data": true
}
```

### 9. **批准支出**

- **函数**: `Approve`
- **描述**: 批准指定地址以代表所有者支出指定数量的代币
- **参数**:
  - `spender`(String): 要批准支出的地址
  - `value`(String): 要批准的代币数量
- **返回值(Boolean)：** 成功返回 `true`，否则抛出 throw
```json
successful returns:
{
    "code": 20000,
    "data": true
}
```

### 10. **检查账户批准额度**

- **函数**: `Allowance`
- **描述**: 检索所有者已批准给支出者的代币数量
- **参数**:
  - `owner`(String): 所有者地址
  - `spender`(String): 支出者地址
- **返回值(Number)：** 具体授权的额度
```json
successful returns:
{
    "code": 20000,
    "data": 100
}
```

### 11. **铸造代币**

- **函数**: `Mint`
- **描述**: 铸造新代币并将其添加到调用者的账户中
- **参数**:
  - `amount`(String): 要铸造的代币数量
- **返回值(Boolean)：** 成功返回 `true`，否则抛出 throw
```json
successful returns:
{
    "code": 20000,
    "data": true
}
```

### 12. **销毁代币**

- **函数**: `Burn`
- **描述**: 从调用者的账户中销毁代币
- **参数**:
  - `amount`(String): 要销毁的代币数量
- **返回值(Boolean)：** 成功返回 `true`，否则抛出 throw
```json
successful returns:
{
    "code": 20000,
    "data": true
}
```

### 13. **获取客户端账户余额**

- **函数**: `ClientAccountBalance`
- **描述**: 检索调用者账户的余额
- **返回**: 调用者账户的余额

### 14. **获取客户端账户 ID**

- **函数**: `ClientAccountID`
- **描述**: 检索调用者账户的 ID
- **返回**: 调用者账户的 ID

### 15. **设置锁状态**

- **函数**: `SetLock`
- **描述**: 设置合约的锁状态
- **返回值(Boolean)：** 成功返回 `true`，否则抛出 throw
```json
successful returns:
{
    "code": 20000,
    "data": true
}
```

### 16. **获取锁状态**

- **函数**: `GetLock`
- **描述**: 检索合约的当前锁状态
- **返回值(Boolean)：** 锁状态（如果已锁定则返回 `true`，否则返回 `false`）
```json
successful returns:
{
    "code": 20000,
    "data": true / false
}
```

### 17. **设置组织管理员**

- **函数**: `SetOrgAdmin`
- **描述**: 设置组织的管理员
- **参数**:
  - `org`(String): 组织名称
  - `admin`(String): 管理员地址
- **返回值(Boolean)：** 成功返回 `true`，否则抛出 throw
```json
successful returns:
{
    "code": 20000,
    "data": true / false
}
```

### 18. **获取组织管理员**

- **函数**: `GetOrgAdmins`
- **描述**: 检索组织到其管理员的映射
- **返回值(Boolean)：** 组织到其管理员的映射
```json
successful returns:
{
    "code": 20000,
    "data": {
        "yilvtong": [
            "0xsksta91e425813dbbfe97b0f8b7ce743e78899af",
            "0xskstb9397001d2c5edf206601443092f0e6f991e"
            ]
    }
}
```

## 使用

- 使用所需的代币参数调用 `Initialize` 函数初始化合约
- 使用诸如 `Transfer`、`Approve`、`BalanceOf` 等函数与合约交互，管理代币转移和批准
- 使用 `Mint` 函数铸造新代币，并使用 `Burn` 函数销毁代币
- 使用 `SetLock` 和 `GetLock` 函数设置或检查合约的锁状态
- 使用 `SetOrgAdmin` 和 `GetOrgAdmins` 函数管理组织管理员

## 安全注意事项

-

