const { ethers, upgrades } = require("hardhat");

async function main() {
    // // 1. 升级 MyToken 到 MyTokenV2
    // const myTokenProxyAddress = ""; // TODO: 填入之前部署的 MyToken 代理地址
    // const MyTokenV2 = await ethers.getContractFactory("MyTokenV2");
    // console.log("\n=== 升级 MyToken 到 V2 ===");
    // const myTokenUpgraded = await upgrades.upgradeProxy(myTokenProxyAddress, MyTokenV2);
    // console.log("升级完成:", myTokenUpgraded.address);
    // console.log("版本:", await myTokenUpgraded.version());

    // // 2. 升级 ERC404TicketUpgradeable 到 V2
    // const ticketProxyAddress = "";
    // const TicketV2 = await ethers.getContractFactory("ERC404TicketUpgradeableV2");
    // console.log("\n=== 升级 ERC404TicketUpgradeable 到 V2 ===");
    // const ticketUpgraded = await upgrades.upgradeProxy(ticketProxyAddress, TicketV2);
    // console.log("升级完成:", ticketUpgraded.address);
    // // 如果有 version() 方法可选调用
    // if (ticketUpgraded.version) {
    //     console.log("版本:", await ticketUpgraded.version());
    // }

    // // 3. 升级 TicketMarketplace 到 V2
    // const marketProxyAddress = "0x7a7511f5Cd2EDaDf6Fb3a38cd47372F54540fe79";
    // const MarketplaceV2 = await ethers.getContractFactory("TicketMarketplaceV2");
    // console.log("\n=== 升级 TicketMarketplace 到 V2 ===");
    // const marketUpgraded = await upgrades.upgradeProxy(marketProxyAddress, MarketplaceV2);
    // console.log("升级完成:", marketUpgraded.address);
    // if (marketUpgraded.version) {
    //     console.log("版本:", await marketUpgraded.version());
    // }

    // // 4. 升级 Proof 到 V2
    // const proofProxyAddress = "";
    // const ProofV2 = await ethers.getContractFactory("ProofV2");
    // console.log("\n=== 升级 Proof 到 V2 ===");
    // const proofUpgraded = await upgrades.upgradeProxy(proofProxyAddress, ProofV2);
    // console.log("升级完成:", proofUpgraded.address);
    // if (proofUpgraded.version) {
    //     console.log("版本:", await proofUpgraded.version());
    // }

    // 5. 升级 LogicV1 到 V2
    const logicV1Proxy = "0xbebC52079330174978Eb55B1f06Fc510f600eB06";
    const LogicV2Proxy = await ethers.getContractFactory("LogicV2");
    console.log("\n=== 升级 TicketMarketplace 到 V2 ===");
    const logicUpgraded = await upgrades.upgradeProxy(logicV1Proxy, LogicV2Proxy);
    console.log("升级完成:", logicUpgraded.address);
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});

