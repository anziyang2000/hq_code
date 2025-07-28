// SPDX-License-Identifier: MIT
pragma solidity ^0.8.22;

import {Initializable} from "@openzeppelin/contracts-upgradeable/proxy/utils/Initializable.sol";
import {UUPSUpgradeable} from "@openzeppelin/contracts-upgradeable/proxy/utils/UUPSUpgradeable.sol";
import {OwnableUpgradeable} from "@openzeppelin/contracts-upgradeable/access/OwnableUpgradeable.sol";

contract LogicV1 is Initializable, UUPSUpgradeable, OwnableUpgradeable {
    uint256 internal count; // 注意 internal 以便继承访问

    /// @custom:oz-upgrades-unsafe-allow constructor
    constructor() {
        _disableInitializers();
    }

    function initialize(address initialOwner) public initializer {
        __Ownable_init(initialOwner);
        __UUPSUpgradeable_init();
        count = 0;
    }

    function getVersion() public pure virtual returns (string memory) {
        return "V1";
    }

    function getCount() public view returns (uint256) {
        return count;
    }

    function increment() public virtual {
        count += 1;
    }

    function _authorizeUpgrade(address newImplementation) internal override onlyOwner {}
}
