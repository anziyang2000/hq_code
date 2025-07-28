  const { ethers, upgrades } = require("hardhat");

  async function main() {
    const proxyAddress = "0xeEAED437E619defa1C037a734F8e71D1e684bc0C"; 
    const proxyAdminAddress = "0xc6b0A7be76C8463080Dd754abf8724B8A0086553"; 

    const [deployer] = await hre.ethers.getSigners();
  
    // 1. 获取新的逻辑合约（MyTokenV2）
    const MyTokenV2 = await ethers.getContractFactory("MyTokenV2");
    const newImpl = await MyTokenV2.deploy();
    await newImpl.deployed(); 
    console.log("MyTokenV2 实现合约部署在:", newImpl.address);
  
    // 2. 准备初始化数据（调用 initialize(address)）
    const initCalldata = MyTokenV2.interface.encodeFunctionData("initializeV2", [deployer.address]);
  
    // 3. 连接 ProxyAdmin 合约
    const proxyAdmin = await ethers.getContractAt("MyProxyAdmin", proxyAdminAddress);

    // 调用 owner() 方法
    const owner = await proxyAdmin.owner();
    console.log("ProxyAdmin owner address:", owner);
  
    // 4. 升级 + 调用
    const tx = await proxyAdmin.upgradeAndCall(proxyAddress, newImpl.address, "");
    await tx.wait();
    console.log("升级完成！");

  
    // 5. 调用 version() 验证
    const upgraded = await ethers.getContractAt("MyTokenV2", proxyAddress);
    const version = await upgraded.version();
    console.log("升级后的版本:", version); // 应输出 "v2"
  }
  
  main().catch((error) => {
    console.error(error);
    process.exitCode = 1;
  });


// 执行命令部署合约：npx hardhat run scripts/upgrade.js --network myCustomNet 
