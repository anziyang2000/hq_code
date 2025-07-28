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
   ./network.sh chaincode ccDeploy -deploy_mode multi -channel_name tourism -org_name yilvtong -ccn exchange-contract -ccv 1.0.0 -ccs 1 -ccp /node-data/code/smart-contracts/fabric-contracts/exchange/ -ccl javascript
   ```

2. **初始化合约**

   使用 CLI 调用 `Initialize` 函数：

   ```sh
   export FABRIC_CFG_PATH=/fabric-deploy/data/org/yilvtong/peers/peer1
   export ContractName="exchange-contract"

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


### 交易所上链接口

1. **StoreProjectBidding**

   上链交易所公告项目信息。

   - **函数**: `StoreProjectBidding`
   - **描述**: 存储交易所公告项目信息到区块链中
   - **参数**: 
     - `ctx`: 交易上下文
     - `dataInfo`(Object): 有关公告项目信息的 JSON 对象，其数据结构如下：
     ```JavaScript
      // 公告项目信息的数据结构
      const ProjectBidding = {
         // 企业ID
         company_id: '',
         // 交易所ID
         exchange_id: '',
         // 节点描述 审核备注
         node_description: '',
         // 父项目ID
         parent_project_id: '',
         // 附件的文件ID集合,逗号隔开
         project_annex: '',
         // 项目上链唯一id
         project_chain_unique_id: '',
         // 项目详情
         project_description: '',
         // 1拍，2拍，3拍
         project_grade: '',
         //项目id
         project_id: '',
         // 项目名称
         project_name: '',
         // 项目编号
         project_number: '',
         // 项目状态
         project_status: '',
         // 项目类型
         project_type: '',
         // 审核时间
         review_time: ''
      };
     ```
   - **返回值(Boolean)：** 成功返回 `true`，否则抛出 throw
   - **事件的数据结构(Event)：** 
   ```JavaScript
      {
         "method_name": "",
         "project_id ": "",
         "project_name ": "",
         "project_status ": "",
         "review_time ": "",
         "node_description": "",
         "project_chain_unique_id ": ""
      }
   ```
   - **上链的数据结构：** 
      - key：交易哈希作为key
      - value：整体的dataInfo参数

2. **StoreInstrument**

   上链交易所标的信息。

   - **函数**: `StoreInstrument`
   - **描述**: 存储交易所标的信息到区块链中
   - **参数**: 
     - `ctx`: 交易上下文
     - `dataInfo`(Object): 有关标的信息的 JSON 对象，其数据结构如下：
     ```JavaScript
      // 标的票务信息
      const InstrumentTicket = {
         // 购买结束时间
         buy_end_date: '',
         // 购买开始时间
         buy_start_date: '',
         // 商品ID
         goods_id: '',
         //  标的信息
         instrument: {
            // 资产类型
            asset_type: '',
            // 企业ID
            company_id: '',
            // 联系人名称
            contact_name: '',
            // 联系人电话
            contact_phone: '',
            // 标的附件(文件IDs)
            instrument_annex: '',
            // 标的规则
            instrument_bidding_rule: {
                  // 加价或减价幅度
                  bidding_changes: '',
                  // 成交规则
                  bidding_deal_rule: '',
                  // 延时时间（秒）
                  bidding_delay_time: '',
                  // 竞拍保证金
                  bidding_deposit: '',
                  // 其他规则描述
                  bidding_description: '',
                  // 竞价结束时间
                  bidding_end_time: '',
                  // 拍卖起始价
                  bidding_start_price: '',
                  // 竞价开始时间
                  bidding_start_time: '',
                  // 拍卖类型
                  bidding_type: '',
                  // 拍次 (1拍，2拍，3拍)
                  instrument_grade: '',
                  // 标的ID
                  instrument_id: '',
                  // 总数量
                  instrument_quantity: '',
            },
            // 标的销售
            instrument_bidding_sales: {
                  // 出价数量
                  bid_quantity: '',
                  // 当前价
                  current_price: '',
                  // 当前剩余数量，针对即刻拍
                  current_remaining_quantity: '',
                  // 预计结束时间
                  estimated_end_time: '',
                  // 预计开始时间
                  estimated_start_time: '',
                  // 标的ID
                  instrument_id: '',
                  // 围观次数
                  instrument_views: '',
                  // 报名数
                  registration_quantity: '',
            },
            // 标的描述
            instrument_description: '',
            // 标的ID
            instrument_id: '',
            // 宣传图片(文件IDs)
            instrument_images: '',
            // 标的物名称
            instrument_name: '',
            // 标的状态
            instrument_status: '',
            // 标的类型
            instrument_type: '',
            // 宣传视频
            instrument_video: '',
            // 父标的ID
            parent_instrument_id: '',
            // 项目ID
            project_id: '',
         },
         // 标的ID
         instrument_id: '',
         // 项目上链唯一id
         project_chain_unique_id: '',
         // 产品类型
         product_type: '',
         // 景区所属区
         scenic_area_code: '',
         // 景区所属市
         scenic_city_code: '',
         // 景区ID
         scenic_id: '',
         // 景区所属省
         scenic_province_code: '',
         // 票种
         ticket_type: '',
         // 入园结束时间
         use_end_date: '',
         // 入园开始时间
         use_start_date: ''
      };
     ```
   - **返回值(Boolean)：** 成功返回 `true`，否则抛出 throw
   - **事件的数据结构(Event)：** 
   ```JavaScript
      {
         "method_name": "",
         "instrument_id ": "",
         "instrument_name ": "",
         "project_id": "",
         "project_chain_unique_id ": ""
      }
   ```
   - **上链的数据结构：** 
      - key：交易哈希作为key
      - value：整体的dataInfo参数

3. **StoreMarginOrder**

   上链保证金订单信息。

   - **函数**: `StoreMarginOrder`
   - **描述**: 存储保证金订单信息到区块链中
   - **参数**: 
     - `ctx`: 交易上下文
     - `dataInfo`(Object): 有关保证金订单信息的 JSON 对象，其数据结构如下：
     ```JavaScript
      // 保证金订单上链
      const MarginOrder = {
         // 公告 Id
         projectId: '',
         // 公告名称
         projectName: '',
         // 交易所信息
         exchange: {
            // 交易所 Id
            exchangeId: '',
            // 交易所名称
            exchangeName: ''
         },
         // 标的信息
         Instrument: {
            // 标的物ID
            instrumentId:'', 
            // 标的物名称
            instrumentName:'',
            // 委托方ID
            sellerId:'',
            // 委托方名称'
            sellerName:'',
            // 竞买人ID
            buyerId:'',
            // 竞买人名称
            buyerName:'',
            // 保证金信息
            bidbond: {
                  // 保证金数额
                  bidbondAmount: '',
                  // 授权号
                  outTradeNo: '', 
                  // 授权明细号  
                  tradeNo: '',  
                  // 订单创建时间
                  createTime: '',
                  // 订单号
                  orderId: ''
            }
         }
      };
     ```
   - **返回值(Boolean)：** 成功返回 `true`，否则抛出 throw
   - **上链的数据结构：** 
      - key：交易哈希作为key
      - value：整体的dataInfo参数

4. **StoreMarginPayment**

   上链保证金支付成功的订单信息。

   - **函数**: `StoreMarginPayment`
   - **描述**: 存储保证金支付成功的订单信息到区块链中
   - **参数**: 
     - `ctx`: 交易上下文
     - `dataInfo`(Object): 有关保证金支付成功的订单信息的 JSON 对象，其数据结构如下：
     ```JavaScript
      // 保证金支付成功上链
      const MarginPayment = {
         // 公告 Id
         projectId: '',
         // 公告名称
         projectName: '',
         // 交易所信息
         exchange: {
            // 交易所 Id
            exchangeId: '',
            // 交易所名称
            exchangeName: ''
         },
         // 标的信息
         Instrument: {
            // 标的物ID
            instrumentId:'', 
            // 标的物名称
            instrumentName:'',
            // 委托方ID
            sellerId:'',
            // 委托方名称'
            sellerName:'',
            // 竞买人ID
            buyerId:'',
            // 竞买人名称
            buyerName:'',
            // 保证金信息
            bidbond: {
                  // 保证金数额
                  bidbondAmount: '',
                  // 授权号
                  outTradeNo: '',
                  // 授权明细号  
                  tradeNo: '',
                  // 竞买号
                  bidNumber: '',
                  // 支付号
                  paymentTradeNo: '',
                  // 支付时间
                  paymentTime: ''
            }
         }
      };
     ```
   - **返回值(Boolean)：** 成功返回 `true`，否则抛出 throw
   - **上链的数据结构：** 
      - key：交易哈希作为key
      - value：整体的dataInfo参数

5. **StoreInstrumentOrder**

   竞拍摘牌订单上链。

   - **函数**: `StoreInstrumentOrder`
   - **描述**: 存储竞拍摘牌订单的信息到区块链中
   - **参数**: 
     - `ctx`: 交易上下文
     - `dataInfo`(Object): 有关标的订单信息的 JSON 对象，其数据结构如下：
     ```JavaScript
      // 竞拍摘牌订单上链
      const InstrumentOrder = {
         // 订单ID
         trade_id: '',
         // 交易所id
         exchange_id: '',
         // 卖方ID
         seller_id: '',
         //买方ID
         buyer_id: '',
         //交易金额
         trade_amount: '',
         //交易类型
         trade_type: '',
         //交易状态
         trade_status: '',
         //交易时间
         trade_datetime: '',
         //创建时间
         create_time: '',
         //修改时间
         update_time: '',
         // 企业ID
         company_id: '',
         // 企业名称
         company_name: '',
         // 公告id
         project_id: '',
         // 公告名称
         project_name: '',
         // 交易所名称
         exchange_name: '',
         // 标的物id
         instrument_id: '',
         // 标的物名称
         instrument_name: '',
         //交易明细
         settlement_id: '',
         //支付渠道
         settlement_type: ''
      };
     ```
   - **返回值(Boolean)：** 成功返回 `true`，否则抛出 throw
   - **事件的数据结构(Event)：** 
   ```JavaScript
      {
         "method_name": "",
         "trade_id": "",
         "trade_type": "",
         "create_time": ""
      }
   ```
   - **上链的数据结构：** 
      - key：交易哈希作为key
      - value：整体的dataInfo参数

6. **StoreConvertToInvoice**

   保证金转为价款信息上链。

   - **函数**: `StoreConvertToInvoice`
   - **描述**: 存储保证金转为价款信息到区块链中
   - **参数**: 
     - `ctx`: 交易上下文
     - `dataInfo`(Object): 有关保证金转为价款信息的 JSON 对象，其数据结构如下：
     ```JavaScript
      // 保证金转为价款信息上链
      const ConvertToInvoice =  {
         // 公告ID
         project_id: '',
         // 公告名称
         project_name: '',
         // 交易所ID
         exchange_id: '',
         // 交易所名称
         exchange_name: '',
         // 委托方ID
         seller_id: '',
         // 委托方名称
         seller_name: '',
         // 标的物ID
         instrument_id: '',
         // 标的物名称
         instrument_name: '',
         // 竞买人ID
         buyer_id: '',
         // 竞买人名称
         buyer_name: '',
         // 保证金金额
         bidbond_amount: '',
         //成交总金额
         transaction_amount: '',
         //保证金转为价款金额
         converted_amount: '',
         // 状态：已转为价款
         status: '',
         // 更新时间
         update_time: ''
      };
     ```
   - **返回值(Boolean)：** 成功返回 `true`，否则抛出 throw
   - **上链的数据结构：** 
      - key：交易哈希作为key
      - value：整体的dataInfo参数

7. **StoreRefundBalance**

   保证金余款自动退回信息上链。

   - **函数**: `StoreRefundBalance`
   - **描述**: 存储保证金余款自动退回信息到区块链中
   - **参数**: 
     - `ctx`: 交易上下文
     - `dataInfo`(Object): 有关保证金余款自动退回信息的 JSON 对象，其数据结构如下：
     ```JavaScript
      // 保证金余款自动退回信息上链
      const RefundBalance =  {
         // 公告ID
         project_id: '',
         // 公告名称
         project_name: '',
         // 交易所ID
         exchange_id: '',
         // 交易所名称
         exchange_name: '',
         // 委托方ID
         seller_id: '',
         // 委托方名称
         seller_name: '',
         // 标的物ID
         instrument_id: '',
         // 标的物名称
         instrument_name: '',
         // 竞买人ID
         buyer_id: '',
         // 竞买人名称
         buyer_name: '',
         // 保证金金额
         bidbond_amount: '',
         //成交总金额
         transaction_amount: '',
         //保证金转为价款金额
         converted_amount: '',
         //保证金退回金额
         refund_amount: '',
         // 状态：已退回
         status: '',
         // 更新时间
         update_time: ''
      };
     ```
   - **返回值(Boolean)：** 成功返回 `true`，否则抛出 throw
   - **上链的数据结构：** 
      - key：交易哈希作为key
      - value：整体的dataInfo参数

8. **StoreFullRefund**

   保证金全额自动退回信息上链。

   - **函数**: `StoreFullRefund`
   - **描述**: 存储保证金全额自动退回信息到区块链中
   - **参数**: 
     - `ctx`: 交易上下文
     - `dataInfo`(Object): 有关保证金全额自动退回信息的 JSON 对象，其数据结构如下：
     ```JavaScript
      // 保证金全额自动退回信息上链
      const FullRefund =  {
         // 公告ID
         project_id: '',
         // 公告名称
         project_name: '', 
         // 交易所ID
         exchange_id: '',
         // 交易所名称
         exchange_name: '',
         // 委托方ID
         seller_id: '',
         // 委托方名称
         seller_name: '',
         // 标的物ID
         instrument_id: '',
         // 标的物名称
         instrument_name: '',
         // 竞买人ID
         buyer_id: '',
         // 竞买人名称
         buyer_name: '',
         // 保证金金额
         bidbond_amount: '',
         //保证金退回金额
         refund_amount: '',
         // 状态：已退回
         status: '',
         // 更新时间
         update_time: '' 
      };
     ```
   - **返回值(Boolean)：** 成功返回 `true`，否则抛出 throw
   - **上链的数据结构：** 
      - key：交易哈希作为key
      - value：整体的dataInfo参数

9. **StoreTradeCharge**

   交易服务费订单信息上链。

   - **函数**: `StoreTradeCharge`
   - **描述**: 存储交易服务费订单信息到区块链中
   - **参数**: 
     - `ctx`: 交易上下文
     - `dataInfo`(Object): 有关交易服务费订单信息的 JSON 对象，其数据结构如下：
     ```JavaScript
      // 交易服务费订单信息上链
      const TradeCharge  = {
         // 交易服务费订单号
         trade_charge_id: '',
         // 关联成交订单号
         trade_id: '',
         // 收费对象
         charge_object: '',
         // 企业名称
         company_name: '',
         // 服务费金额
         charge_amount: '',
         // 状态
         payment_status: '',
         // 创建时间
         create_time: '',
         // 到期时间
         expiry_datetime: '',
         // 收款单位名称
         payee_account_name: '',
         // 收款单位银行账号
         payee_account_number: '',
         // 收款单位开户银行名称
         payee_bank_name: '',
         // 银行交易流水号
         transaction_flow_id: '',
         // 付款单位名称
         payer_account_name: '',
         // 付款单位银行账号
         payer_account_number: '',
         // 付款单位开户银行名称
         payer_bank_name: '',
         // 银行水单（图片）
         file_url: '',
         // 提交验证时间
         submit_time: '',
         // 审核结果
         audit_result: '',
         // 不通过原因
         remark: '',
         // 审核时间
         audit_time: ''
      };
     ```
   - **返回值(Boolean)：** 成功返回 `true`，否则抛出 throw
   - **事件的数据结构(Event)：** 
   ```JavaScript
      {
         "method_name": "",
         "trade_id": "",
         "trade_type": "",
         "create_time": ""
      }
   ```
   - **上链的数据结构：** 
      - key：交易哈希作为key
      - value：整体的dataInfo参数