//SPDX-License-Identifier: MIT
pragma solidity ^0.8.22;

import {Initializable} from "./openzeppelin/contracts-upgradeable/proxy/utils/Initializable.sol";
import {OwnableUpgradeable} from "./openzeppelin/contracts-upgradeable/access/OwnableUpgradeable.sol";
import {PausableUpgradeable} from "./openzeppelin/contracts-upgradeable/security/PausableUpgradeable.sol";
import {Strings} from "./openzeppelin/contracts/utils/Strings.sol";
import {ERC404} from "./ERC404Plus.sol";

contract ERC404TicketUpgradeable is Initializable, OwnableUpgradeable, PausableUpgradeable, ERC404 {
    uint256 public maxSupply;

    // 全局 IPFS 哈希
    string public IpfsHash;

    /// @custom:oz-upgrades-unsafe-allow constructor
    constructor() {
        _disableInitializers();
    }

    function initialize(
        string memory name_,
        string memory symbol_,
        uint8 decimals_,
        uint256 maxTotalSupplyERC721_,
        address initialOwner_,
        address initialMintRecipient_
    ) public initializer {
        __Ownable_init(initialOwner_);
        __Pausable_init();

        __ERC404_init(name_, symbol_, decimals_);

        maxSupply = maxTotalSupplyERC721_ * units;

        _setERC721TransferExempt(initialMintRecipient_, true);
        _mintERC20(initialMintRecipient_, maxSupply);
    }

    // 设置全局 IPFS 哈希
    function setIpfsHash(string memory ipfsHash) external onlyOwner {
        IpfsHash = ipfsHash;
    }

    // 查询门票信息（所有 tokenId 共用全局 IPFS 哈希）
    function tokenURI(uint256 tokenId) public view override returns (string memory) {
        return IpfsHash;
    }

    // 发行门票
    function mint(address to, uint256 amount) external whenNotPaused {
        require(amount > 0, "Amount must be greater than zero");
        _mintERC20(to, amount * units);
    }

    // 销毁门票
    function burn(uint256 value_) external {
        _transferERC20WithERC721(msg.sender, address(0), value_ * units);
    }

    function burnERC721(uint256 id_) external {
        require(ownerOf(id_) == msg.sender, "Not owner");
        _transferERC721(msg.sender, address(0), id_); // 销毁 NFT
        _transferERC20(msg.sender, address(0), units); // 扣除对应的 ERC-20
    }

    // 冻结和解冻门票（限制合约的调用） 
    function pause() external onlyOwner {
        _pause();
    }

    function unpause() external onlyOwner {
        _unpause();
    }

}
