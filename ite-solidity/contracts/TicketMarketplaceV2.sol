// SPDX-License-Identifier: MIT
pragma solidity ^0.8.22;

import {Initializable} from "./openzeppelin/contracts-upgradeable/proxy/utils/Initializable.sol";
import {OwnableUpgradeable} from "./openzeppelin/contracts-upgradeable/access/OwnableUpgradeable.sol";
import {PausableUpgradeable} from "./openzeppelin/contracts-upgradeable/security/PausableUpgradeable.sol";
import {MyToken} from "./ERC20.sol";
import {ERC404TicketUpgradeable} from "./ERC404.sol"; 

contract TicketMarketplaceV2 is Initializable, OwnableUpgradeable, PausableUpgradeable {
    enum OrderType { ToB, ToC }
    enum OrderStatus { Created, Cancelled }

    struct Order {
        uint256 id;
        address buyer;
        address seller;
        uint256 amount;
        uint256 pricePerTicket;
        OrderType orderType;
        OrderStatus status;
        string ipfsHash; // 仅ToB订单可选传
    }

    MyToken public paymentToken;
    ERC404TicketUpgradeable public ticketToken;

    mapping(uint256 => Order) public orders;

    event OrderCreated(
        uint256 indexed orderId,
        address indexed buyer,
        address indexed seller,
        uint256 amount,
        uint256 pricePerTicket,
        OrderType orderType,
        string ipfsHash
    );

    event OrderCancelled(uint256 indexed orderId);

    function initialize(address _erc20, address _erc404, address initialOwner_) public initializer {
        require(_erc20 != address(0) && _erc404 != address(0), "Invalid address");
        __Ownable_init(initialOwner_);
        __Pausable_init();

        paymentToken = MyToken(_erc20);
        ticketToken = ERC404TicketUpgradeable(_erc404);
    }

    // 创建 ToB 订单（分销商从景区购票） (这个目前是只有买家可以调用)
    function createOrder(
        uint256 orderId,
        address seller,
        uint256 amount,
        uint256 pricePerTicket,
        OrderType orderType,
        string calldata ipfsHash
    ) external {
        require(orders[orderId].buyer == address(0), "Order ID exists");
        require(amount > 0 && pricePerTicket > 0, "Invalid params");
        require(seller != address(0), "Invalid seller");

        uint256 totalCost = amount * pricePerTicket;

        // 1. 支付方（msg.sender）批准并有足够 ERC20
        require(paymentToken.allowance(msg.sender, address(this)) >= totalCost * 10**18, "approved required");
        require(paymentToken.balanceOf(msg.sender) >= totalCost * 10**18, "Insufficient balance of ERC20 tokens");

        // 2. 卖方提供足够门票
        require(ticketToken.allowance(seller, address(this)) >= amount * 10**18, "approved required");
        require(ticketToken.erc20BalanceOf(seller) >= amount * 10**18, "Insufficient balance");

        // 3. 转账 & 转票
        paymentToken.transferFrom(msg.sender, seller, totalCost * 10**18);
        ticketToken.erc20TransferFrom(seller, msg.sender, amount * 10**18);

        // 4. 存储订单
        orders[orderId] = Order({
            id: orderId,
            buyer: msg.sender,
            seller: seller,
            amount: amount,
            pricePerTicket: pricePerTicket,
            orderType: orderType,
            status: OrderStatus.Created,
            ipfsHash: orderType == OrderType.ToB ? ipfsHash : ""
        });

        emit OrderCreated(orderId, msg.sender, seller, amount, pricePerTicket, orderType, ipfsHash);
    }

    // 退单（买家退票，退款，门票转回卖家） (这个目前是都可以调用)
    function cancelOrder(uint256 orderId) external {
        Order storage order = orders[orderId];
        require(order.status == OrderStatus.Created, "Not cancellable");

        order.status = OrderStatus.Cancelled;

        uint256 total = order.amount * order.pricePerTicket;

        require(paymentToken.allowance(order.seller,address(this)) >= total * 10**18, "approved required");
        require(paymentToken.balanceOf(order.seller) >= total * 10**18, "Insufficient balance of ERC20 tokens");
        require(ticketToken.allowance(order.buyer,address(this)) >= order.amount * 10**18, "approved required");
        require(ticketToken.erc20BalanceOf(order.buyer) >= order.amount * 10**18, "Insufficient balance");
        paymentToken.transferFrom(order.seller, order.buyer, total * 10**18);
        ticketToken.erc20TransferFrom(order.buyer, order.seller, order.amount * 10**18);

        emit OrderCancelled(orderId);
    }
    
}