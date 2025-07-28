// SPDX-License-Identifier: MIT
pragma solidity ^0.8.22;

import "./LogicV1.sol";

contract LogicV2 is LogicV1 {
    function getVersion() public pure override returns (string memory) {
        return "V2";
    }
    
    // 升级后：每次加 2 而不是加 1
    function increment() public override {
        count += 2;
    }

    // 新增功能：重置为 0
    function reset() public {
        count = 0;
    }
}
