// SPDX-License-Identifier: MIT

pragma solidity ^0.8.22;

import {Ownable} from "@openzeppelin/contracts/access/Ownable.sol";
import {MyToken as ERC20} from "./ERC20.sol";
import {Strings} from "@openzeppelin/contracts/utils/Strings.sol";
import {ERC404TicketUpgradeable as ERC404} from "./ERC404.sol"; 

contract ExchangePlus is Ownable {
  ERC20 public erc20token;
  ERC404 public erc404token;
  uint256 topPrice;

  uint256 public sellOrderCounter;  // 卖单订单 ID 计数器
  uint256 public buyOrderCounter;   // 买单订单 ID 计数器

  struct Order {
    uint256 orderId;
    uint256 currentPrice;
    uint256 initialPrice;
    uint256 amount;
    address owner;
    bool isActive;
    bool isPurchased;
    bool isCancelled;
  }

  struct BuyOrder {
    uint256 orderId;
    uint256 price;
    uint256 amount;
    address buyer;
    bool isActive;
    bool isPurchased;
    bool isCancelled;
  }

  mapping(uint256 => Order) public orders;
  mapping(uint256 => BuyOrder) public buyOrders; // 新增买单映射
  Order[] public allSellOrders;  // 所有卖单
  BuyOrder[] public allBuyOrders;  // 所有买单

  event NFTListed(address owner, uint256 initialPrice, uint256 amount);
  event NFTPurchased(address owner, address buyer, uint256 currentPrice);
  event OrderRevoked(address owner);
  event PriceUpdated(address owner, uint256 newPrice);
  event SellOrderAmountUpdated(uint256 orderId, uint256 newAmount);
  event BuyOrderCreated(address buyer, uint256 price, uint256 amount);
  event BuyOrderCancelled(address buyer);
  event BuyOrderAccepted(address buyer, address seller, uint256 price);
  event BuyOrderPriceUpdated(uint256 orderId, uint256 newPrice);
  event BuyOrderAmountUpdated(uint256 orderId, uint256 newAmount);

  constructor(
    address erc20Address,
    address erc404Address,
    uint256 _topPrice
  ) Ownable(msg.sender) {
    erc404token = ERC404(erc404Address);
    erc20token = ERC20(erc20Address);
    topPrice = _topPrice;
    sellOrderCounter = 0;  // 初始化卖单计数器
    buyOrderCounter = 0;   // 初始化买单计数器
  }

  function listNFT(uint256 price, uint256 amount) external {
    require(erc404token.allowance(msg.sender,address(this)) >= amount * 10**18, "approved required");
    require(erc404token.erc20BalanceOf(msg.sender) >= amount * 10**18  && price <= topPrice, "Insufficient balance");

    // approve(address(this), 1);//不需要直接面向用户，合并授权步骤
    erc404token.transferFrom(msg.sender, address(this), amount * 10**18);//转到该合约平台

    // 创建一个新的卖单订单
    uint256 newSellOrderId = uint256(keccak256(abi.encodePacked(msg.sender, block.timestamp, sellOrderCounter))) >> 128;  // 生成唯一的订单ID
    Order memory newOrder = Order({
        orderId: newSellOrderId,
        currentPrice: 0,
        initialPrice: price,
        amount: amount,
        owner: msg.sender,
        isActive: true,
        isPurchased: false,
        isCancelled: false
    });

    // 将订单添加到历史记录中
    allSellOrders.push(newOrder);
    orders[newSellOrderId] = newOrder;

    emit NFTListed(msg.sender, price, amount);
  }
  
  function purchaseNFT(
    uint256 orderId,
    uint256 price
  ) external {
    Order storage order = orders[orderId];

    require(order.isActive, "NFT is not listed");
    require(price <= topPrice, "Incorrect price"); //不能超过官方价
    
    // bijiao bijiao   bijiao  
    // jita  yuyan  gongzuo(kao?)  jianshen  waimao  lvxing
    if(price >= order.initialPrice){
      require(erc20token.allowance(msg.sender,address(this)) >= price * 10**18, "approved required");
      erc20token.transferFrom(msg.sender, order.owner, price * 10**18);
      erc404token.transfer(msg.sender, order.amount * 10**18);
      // erc404token.transfer(msg.sender,1);
      order.isActive = false;
      // order.owner = address(0);
      // order.initialPrice = 0;
      order.currentPrice = 0;
      order.isPurchased = true;

      // 更新 allSellOrders 中的状态
      updateSellOrderInArray(order.orderId, order);
    }else{
      order.currentPrice = price;
      order.isPurchased = true;

      // 更新 allSellOrders 中的状态
      updateSellOrderInArray(order.orderId, order);
    }

    emit NFTPurchased(order.owner, msg.sender, price);
  }

  function revokeListing(uint256 orderId) external {
    Order storage order = orders[orderId];

    require(order.isActive, "NFT is not listed");
    require(order.owner == msg.sender, "Only the owner can revoke this order");

    //erc404token.approve(order.owner, order.initialPrice);
    erc404token.transfer(order.owner, order.amount * 10**18);
    order.isActive = false;
    // order.initialPrice = 0;
    order.currentPrice = 0;
    order.isCancelled = true;
    // order.owner = address(0);

    // 更新 allSellOrders 中的状态
    updateSellOrderInArray(order.orderId, order);

    emit OrderRevoked(msg.sender);
  }

  // 创建买单
  function createBuyOrder(uint256 price, uint256 amount) external {
    require(price <= topPrice, "Price exceeds the top limit");
    require(erc20token.allowance(msg.sender, address(this)) >= price * 10**18, "ERC20 tokens not approved for transfer");
    require(erc20token.balanceOf(msg.sender) >= price * 10**18, "Insufficient balance of ERC20 tokens");
    // 为买单生成唯一的订单 ID
    uint256 newBuyOrderId = uint256(keccak256(abi.encodePacked(msg.sender, block.timestamp, buyOrderCounter))) >> 128;
    
    erc20token.transferFrom(msg.sender, address(this), price * 10**18);// 转到该合约平台

    BuyOrder memory newBuyOrder = BuyOrder({
        orderId: newBuyOrderId,
        price: price,
        amount: amount,
        buyer: msg.sender,
        isActive: true,
        isPurchased: false,
        isCancelled: false
    });

    buyOrders[newBuyOrderId] = newBuyOrder;
    allBuyOrders.push(newBuyOrder);

    emit BuyOrderCreated(msg.sender, price, amount);
  }

  // 接受买单
  function acceptBuyOrder(uint256 orderId) external {
    BuyOrder storage buyOrder = buyOrders[orderId];

    require(buyOrder.isActive, "Buy order is not active");
    require(erc404token.balanceOf(msg.sender) >= buyOrder.amount * 10**18, "Insufficient ERC404 balance");
    require(erc404token.allowance(msg.sender, address(this)) >= buyOrder.amount * 10**18, "ERC404 not approved");

    // 卖家接受买单，转移ERC404给买家，卖家收到ERC20
    erc404token.transferFrom(msg.sender, buyOrder.buyer, buyOrder.amount * 10**18);
    erc20token.transfer(msg.sender, buyOrder.price * 10**18);

    buyOrder.isActive = false;
    buyOrder.isPurchased = true;
    // buyOrder.buyer = address(0);

    // 更新 allSellOrders 中的状态
    updateBuyOrderInArray(buyOrder.orderId, buyOrder);

    emit BuyOrderAccepted(buyOrder.buyer, msg.sender, buyOrder.price);
  }

  // 取消买单
  function cancelBuyOrder(uint256 orderId) external {
    BuyOrder storage buyOrder = buyOrders[orderId];

    require(buyOrder.isActive, "No active buy order");
    require(buyOrder.buyer == msg.sender, "Only the buyer can cancel the buy order");

    buyOrder.isActive = false;
    buyOrder.isCancelled = true;
    // buyOrder.buyer = address(0);

    erc20token.transfer(msg.sender, buyOrder.price * 10**18);

    // 更新 allSellOrders 中的状态
    updateBuyOrderInArray(orderId, buyOrder);

    emit BuyOrderCancelled(msg.sender);
  }

  function updatePrice(uint256 orderId, uint256 newPrice) external {
    Order storage order = orders[orderId];

    require(order.isActive, "NFT is not listed");
    require(order.owner == msg.sender, "Only the owner can update the price");

    order.initialPrice = newPrice;

    // 更新 allSellOrders 中的价格
    updateSellOrderInArray(orderId, order);

    emit PriceUpdated(msg.sender, newPrice);
  }

  function updateSellOrderAmount(uint256 orderId, uint256 newAmount) external {
      Order storage order = orders[orderId];

      require(order.isActive, "NFT is not listed");
      require(order.owner == msg.sender, "Only the owner can update the amount");

      // 检查新数量是否合理
      require(newAmount > 0, "Amount must be greater than zero");

      uint256 oldAmount = order.amount;

      // 如果新数量小于旧数量，从合约退还多余的 ERC404
      // 如果新数量大于就数量，在前端直接多转账给交易所合约相差的数量的erc404
      if (newAmount < oldAmount) {
          uint256 excessAmount = oldAmount - newAmount;
          
          // 退还多余的 ERC404
          erc404token.transfer(msg.sender, excessAmount * 10**18);
      }

      // 更新卖单数量
      order.amount = newAmount;

      // 更新 allSellOrders 中的状态
      updateSellOrderInArray(orderId, order);

      emit SellOrderAmountUpdated(orderId, newAmount);
  }

  // 更新买单价格
  function updateBuyOrderPrice(uint256 orderId, uint256 newPrice) external {
    BuyOrder storage buyOrder = buyOrders[orderId];

    require(buyOrder.isActive, "Buy order does not exist or is inactive");
    require(buyOrder.buyer == msg.sender, "Only the buyer can update the buy order price");

    uint256 oldPrice = buyOrder.price;

    // 如果新价格更低，计算差价并退还给用户
    if (newPrice < oldPrice) {
        uint256 priceDifference = oldPrice - newPrice;

        // 检查合约余额是否足够退还差价
        require(erc20token.balanceOf(address(this)) >= priceDifference * 10**18, "Not enough funds to refund");

        // 将差价退还给用户
        erc20token.transfer(msg.sender, priceDifference * 10**18);
    }
    
    // 更新买单价格
    buyOrder.price = newPrice;

    // 更新 allSellOrders 中的状态
    updateBuyOrderInArray(buyOrder.orderId, buyOrder);

    emit BuyOrderPriceUpdated(orderId, newPrice);
  }

  // 更新买单的数量
  function updateBuyOrderAmount(uint256 orderId, uint256 newAmount) external {
      BuyOrder storage buyOrder = buyOrders[orderId];

      require(buyOrder.isActive, "Buy order does not exist or is inactive");
      require(buyOrder.buyer == msg.sender, "Only the buyer can update the amount");

      // 检查新数量是否合理
      require(newAmount > 0, "Amount must be greater than zero");
      // 更新买单数量
      buyOrder.amount = newAmount;
      // 更新 allBuyOrders 中的状态
      updateBuyOrderInArray(orderId, buyOrder);

      emit BuyOrderAmountUpdated(orderId, newAmount);
  }

  function setTopPrice(uint256 price) onlyOwner public {
    topPrice = price;
  }

  //TOTEST
  function getBalance(address account) public view returns(uint256 , uint256){
    return (erc20token.balanceOf(account), erc404token.balanceOf(account));
  }

  function getOrder(uint256 orderId) external view returns (uint256 currentPrice, uint256 initialPrice, address orderOwner, bool isActive) {
    Order storage order = orders[orderId];
    return (order.currentPrice, order.initialPrice, order.owner, order.isActive);
  }

  function getBuyOrder(uint256 orderId) external view returns (uint256 price, bool isActive) {
    BuyOrder storage buyOrder = buyOrders[orderId];
    return (buyOrder.price, buyOrder.isActive);
  }

  // 更新 allSellOrders 中的卖单
  function updateSellOrderInArray(uint256 orderId, Order storage updatedOrder) internal {
    for (uint256 i = 0; i < allSellOrders.length; i++) {
      if (allSellOrders[i].orderId == orderId) {
        allSellOrders[i] = updatedOrder;
        break;
      }
    }
  }

  // 更新 allBuyOrders 中的买单
  function updateBuyOrderInArray(uint256 orderId, BuyOrder storage updatedBuyOrder) internal {
    for (uint256 i = 0; i < allBuyOrders.length; i++) {
      if (allBuyOrders[i].orderId == orderId) {
        allBuyOrders[i] = updatedBuyOrder;
        break;
      }
    }
  }

  // 获取所有卖单
  function getAllSellOrders() external view returns (Order[] memory) {
      return allSellOrders;
  }

  // 获取所有买单
  function getAllBuyOrders() external view returns (BuyOrder[] memory) {
      return allBuyOrders;
  }

  // 撮合卖单
  // 撮合买单

}

