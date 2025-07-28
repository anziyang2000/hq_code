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

7. **UpdateStockInfo**

   更新门票库存信息

   - **函数**: `UpdateStockInfo`
   - **描述**: 门票过期重新推送创建库存，更新库存信息
   - **参数**: 
     - `stockNumber`(String): 库存号
     - `updatedFields`(JSON Object): 有关要更新门票的库存信息对象
     - `triggerTime`(String): 合约事件记录的时间戳
   - **返回值(Boolean)：** 成功返回 `true`，否则抛出 throw

8. **ReadTicket**

   读取门票信息。

   - **函数**: `ReadTicket`
   - **描述**: 读取门票的完整信息
   - **参数**: 
     - `tokenId`(string): 要读取的门票的唯一标识符
   - **返回值(Object)：** 返回门票信息对象

   
9. **StoreEvidence**

   易旅宝交易及商品信息存证证书。

   - **函数**: `StoreEvidence`
   - **描述**: 易旅宝交易及商品信息存证证书
   - **参数**: 
     - `dataArray`(string): 需要存证上链的信息
   - **返回值(Boolean)：** 成功返回 `true`，否则抛出 throw

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
        

## 目前门票的完整结构
注意：目前的门票是分割成不同的模块使用不同的key进行存储上链的
- **整体的门票结构**: 使用 'nft' + tokenId 作为唯一 key 存储
- **门票的基本信息**: 使用 'nft' + tokenId + 'basicinfo' 作为唯一 key 存储
- **门票的价格信息**: 使用 'nft' + tokenId + 'priceinfo' 作为唯一 key 存储
- **门票的整体核销信息**: 使用 'nft' + tokenId + 'checkdata' 作为唯一 key 存储
- **门票的单个核销信息**: 使用 复合键('checkdata', [tokenId, txId])  作为唯一 key 存储
- **门票的出票信息**: 使用 'nft' + tokenId + 'ticketdata' 作为唯一 key 存储
- **门票的库存信息**: 使用 'nft' + tokenId + 'stockinfo' 作为唯一 key 存储

```JavaScript
const tickets = {
    // 可使用的门票数量
    balance: '',
    // 门票URL等信息
    metadata: {
        description: '',
        token_url: ''
    },
    // 门票拥有者
    owner: '',
    // 门票的详细信息
    slot: {
      // 附加信息(可更新的字段)
      AdditionalInformation: {
         // 价格策略
         PriceInfo: [
               {
                  // 价格详细信息
                  PriceDetailedInfo: {
                     // 佣金比例
                     commission_rate: 0,
                     // 组合销售价
                     compose_price: 0,
                     // 分组
                     group: [''],
                     // 组合销售
                     is_compose: true,
                     // 价格 id
                     price_id: '',
                     // 销售价
                     sale_price: 0,
                  },
                  // 分销商
                  distributor_id: '',
                  // 商品 id
                  goods_id: ''
               }
         ],
         // 可变的库存信息
         StockInfo: {
               // 购买有效开始时间
               purchase_begin_time: '',
               // 购买有效结束时间
               purchase_end_time: '',
               // 入园有效开始时间
               stock_enter_begin_time: '',
               // 入园有效结束时间
               stock_enter_end_time: '',
         },
         // 核销信息集合
         TicketCheckData: [
               {
                  //账户
                  account: '',
                  // 核销次数
                  check_number: 0,
                  // 检票类型
                  check_type: 0,
                  // 核销时间
                  enter_time: '',
                  // 检票设备 id
                  equipment_id: '',
                  // 检票设备名称
                  equipment_name: '',
                  // 检票设备类型
                  equipment_type: '',
                  // 身份证
                  id_card: '',
                  // 姓名
                  id_name: '',
                  // 组织
                  org: '',
                  // 检票点id
                  point_id: '',
                  // 检票点名称
                  point_name: '',
                  // 二维码
                  qr_code: '',
                  // 景区id
                  scenic_id: '',
                  // 库存批次号
                  stock_batch_number: '',
                  // 票号
                  ticket_number: '',
                  // 操作人员用户 id
                  user_id: '',
                  // 操作人员用户名
                  username: ''
               }
         ],
         // 出票信息
         TicketData:  {
               // 游客信息
               BuyerInfo: [
                  {
                     // 姓名
                     buyerInfo_id_name: '',
                     // 身份证
                     id_number: ''
                  }
               ],
               // 退订人数
               cancel_count: 0,
               // 已检票人数
               checked_num: 0,
               // 入园开始时段
               enter_begin_time: '',
               // 入园结束时段
               enter_end_time: '',
               // 入园时间
               enter_time: '',
               // 类型
               issuance_type: 0,
               // 组合订单id
               order_group_id: '',
               // 订单号
               order_id: '',
               // 过期时间
               overdue_time: '',
               // 联系人手机号
               phone:'',
               // 游玩人数
               player_num: 0,
               // 二维码
               print_encode: '',
               // 服务商id
               provider_id: '',
               // 销售渠道
               sale_channel: 0,
               // 实际售价
               selling_price: 0,
               // 门票状态
               status: 0,
               // 店铺id
               store_id: '',
               // 票号
               ticket_id: '',
               // 已使用次数
               used_count: 0,
               // 已入园天数
               used_days: 0,
               // 库存批次号
               stock_batch_number: '',
         }
      },
      // 基本信息(不变的字段)
      BasicInformation: {
         // 产品信息
         SimpleTicket: {
               // 库存信息
               TicketStock: {
                  // 结算id
                  account_id: '',
                  // 景区批次号
                  batch_id: '',
                  // 每天库存
                  nums: 0,
                  // 服务商id
                  stock_operator_id: '',
                  // 景区id
                  stock_scenic_id: '',
                  // 景区名称
                  stock_scenic_name: '',
                  // 产品id
                  stock_ticket_id: '',
                  // 产品名称
                  ticket_name: '',
                  // 产品类型
                  ticket_type: 0,
                  // 总库存
                  total_stock: 0,
               },
               // 可入园天数
               available_days: 0,
               // 首日激活（开/关）
               is_activate: 0,
               // 市场标准价格
               market_price: 0,
               // 服务商id
               operator_id: '',
               // 入园统计（开/关）
               park_statistic: 0,
               // 产品类型
               pro_type: 0,
               // 控制方式（不控制/按星期控制）
               restrict_type: 0,
               // 控制星期
               restrict_week: '',
               // 景区id
               scenic_id: '',
               // 景区名称
               scenic_name: '',
               // 产品名称
               simple_name: '',
               // 商品信息集合
               ticketGoods: [
                  {
                     // 检票规则
                     RuleCheck: {
                           // 检票通行方式
                           adopt_type: 0,
                           // 检票点
                           check_point_ids: [''],
                           // 检票控制方式
                           control_type: 0,
                           // 身份识别类型
                           identity_type: '',
                           // 检票间隔时间
                           interval_time: 0,
                           // 检票规则名称
                           ruleCheck_name: '',
                           // 分时预约设置
                           time_share_book: 0
                     },
                     // 出票规则
                     RuleIssue: {
                           // 审批内容
                           approve_content: '',
                           // 审批id
                           approve_id: '',
                           // 实名方式
                           is_real_name: 0,
                           // 审批(开/关)
                           need_approval: 0,
                           // 限制本人购买
                           only_owner_buy: 0,
                           // 仅窗口售票(开/关)
                           only_window_sale: 0,
                           // 校验实名制
                           real_name_check: 0,
                           // 校验权益
                           rights_check: 0,
                           // 权益id
                           rights_id: '',
                           // 当天购票开始时间
                           ruleIssue_begin_time: '',
                           // 当天购票结束时间
                           ruleIssue_end_time: '',
                           // 出票规则名称
                           ruleIssue_name: '',
                           // 出票类型
                           ruleIssue_type: 0,
                           // 出票方式
                           ruleIssue_way: 0,
                           // 规则类型(权益票/权益卡/普通票)
                           rule_type: 0,
                           // 使用时间
                           use_time: ''
                     },
                     // 退票规划
                     RuleRetreat: {
                           // 默认退票费率
                           default_rate: 0,
                           // 可退票(开/关)
                           is_retreat: 0,
                           // 退票规则名称
                           ruleRetreat_name: ''
                     },
                     // 分销商开始折扣率
                     begin_discount: 0,
                     // 分销商结束折扣率
                     end_discount: 0,
                     // 商品名称
                     goods_name: '',
                     // 单次最大预订量
                     max_people: 0,
                     // 最小起订量
                     min_people: 0,
                     // 特殊折扣率
                     overall_discount: 0,
                     // 购买数量限制(开/关)
                     people_number: 0,
                     // 商品id
                     ticketGoods_id: '',
                     // 票种
                     ticketGoods_type: 0,
                     // 分时预约id
                     time_share_id: ''
                  }
               ],
               // 分时预约集合
               timeSharing: [
                  {
                     // 分时预约开始时间
                     timeSharing_begin_time: '',
                     // 分时预约结束时间
                     timeSharing_end_time: '',
                     // 分时预约id
                     timeSharing_id: ''
                  }
               ],
               // 分时预约（开/关）
               time_restrict: 0,
               // 使用次数
               use_count: 0,
               // 使用方式（每天/一共）
               use_type: 0,
               // 使用有效期
               validity_day: 0
         },
         // 是否交易所发布
         is_exchange: 0
      }
   },
    // 记录库存
    stockBatchNumber: [],
    // 门票唯一标识符
    token_id: '',
};
```
