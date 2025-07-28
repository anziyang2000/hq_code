// SPDX-License-Identifier: MIT
// Compatible with OpenZeppelin Contracts ^5.0.0
pragma solidity ^0.8.22;

import {ERC20Upgradeable} from "./openzeppelin/contracts-upgradeable@5.3.0/token/ERC20/ERC20Upgradeable.sol";
import {ERC20BurnableUpgradeable} from "./openzeppelin/contracts-upgradeable@5.3.0/token/ERC20/extensions/ERC20BurnableUpgradeable.sol";
import {ERC20PausableUpgradeable} from "./openzeppelin/contracts-upgradeable@5.3.0/token/ERC20/extensions/ERC20PausableUpgradeable.sol";
import {Initializable} from "./openzeppelin/contracts-upgradeable@5.3.0/proxy/utils/Initializable.sol";
import {OwnableUpgradeable} from "./openzeppelin/contracts-upgradeable@5.3.0/access/OwnableUpgradeable.sol";

contract MyToken is Initializable, ERC20Upgradeable, ERC20BurnableUpgradeable, ERC20PausableUpgradeable, OwnableUpgradeable {
    /// @custom:oz-upgrades-unsafe-allow constructor
    constructor() {
        _disableInitializers();
    }

    function initialize(address initialOwner) public initializer {
        __ERC20_init("MyToken", "MTK");
        __ERC20Burnable_init();
        __ERC20Pausable_init();
        __Ownable_init(initialOwner);
    }

    function pause() public onlyOwner {
        _pause();
    }

    function unpause() public onlyOwner {
        _unpause();
    }

    function mint(address to, uint256 amount) public onlyOwner {
        _mint(to, amount * 10**18);
    }

    // The following functions are overrides required by Solidity.

    function _update(address from, address to, uint256 value)
        internal
        override(ERC20Upgradeable, ERC20PausableUpgradeable)
    {
        super._update(from, to, value);
    }
}
