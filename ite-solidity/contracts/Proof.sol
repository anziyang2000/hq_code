// SPDX-License-Identifier: MIT
pragma solidity ^0.8.22;

import {Initializable} from "./openzeppelin/contracts-upgradeable/proxy/utils/Initializable.sol";
import {OwnableUpgradeable} from "./openzeppelin/contracts-upgradeable/access/OwnableUpgradeable.sol";
import {PausableUpgradeable} from "./openzeppelin/contracts-upgradeable/security/PausableUpgradeable.sol";

contract Proof is Initializable, OwnableUpgradeable, PausableUpgradeable {
    enum ProofType { FINANCE, BANK_RECEIPT, EVIDENCE, EXCHANGE, TICKET }

    string[] private hashes;

    struct Record {
        uint256 timestamp;
        string typeName;
        string ipfsHash;
    }

    mapping(address => Record[]) private userRecords;

    event Submitted(string ipfsHash, uint256 indexed index, address indexed user, string typeName);

    /// @custom:oz-upgrades-unsafe-allow constructor
    constructor() {
        _disableInitializers();
    }

    function initialize(address owner) public initializer {
        __Ownable_init(owner);
        __Pausable_init();
    }

    function submit(string calldata typeName, string calldata ipfsHash) external onlyOwner whenNotPaused {
        require(bytes(ipfsHash).length > 0, "Empty hash");
        require(_isValidType(typeName), "Invalid type name");

        hashes.push(ipfsHash);

        // 记录到用户的历史
        Record memory r = Record({
            timestamp: block.timestamp,
            typeName: typeName,
            ipfsHash: ipfsHash
        });

        userRecords[msg.sender].push(r);

        emit Submitted(ipfsHash, hashes.length - 1, msg.sender, typeName);
    }

    function count() external view returns (uint256) {
        return hashes.length;
    }

    function get(uint256 index) external view returns (string memory) {
        require(index < hashes.length, "Invalid index");
        return hashes[index];
    }

    function getRecordsByUser(address user) external view returns (Record[] memory) {
        return userRecords[user];
    }

    function pause() external onlyOwner {
        _pause();
    }

    function unpause() external onlyOwner {
        _unpause();
    }

    function _isValidType(string calldata typeName) internal pure returns (bool) {
        return keccak256(bytes(typeName)) == keccak256("FINANCE") ||
               keccak256(bytes(typeName)) == keccak256("BANK_RECEIPT") ||
               keccak256(bytes(typeName)) == keccak256("EVIDENCE") || 
               keccak256(bytes(typeName)) == keccak256("EXCHANGE") || 
               keccak256(bytes(typeName)) == keccak256("TICKET");
    }
}