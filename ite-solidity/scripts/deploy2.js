const { ethers, upgrades } = require("hardhat");

async function main() {
  const [deployer] = await ethers.getSigners();
  console.log("部署者地址:", deployer.address);

  // === 1、部署 MyToken ===
  const MyToken = await ethers.getContractFactory("MyToken");

  // 使用 upgrades.deployProxy 部署代理合约
  const myTokenproxy = await upgrades.deployProxy(MyToken, [deployer.address], {
    initializer: "initialize", // 指定初始化函数
  });

  await myTokenproxy.deployed(); 
  console.log("代理合约部署成功，地址:", myTokenproxy.address);

  // 获取 name 验证一下
  const erc20Name = await myTokenproxy.name();
  console.log("Token name:", erc20Name);

  // === 2、部署 ERC404TicketUpgradeable ===
  const ERC404TicketUpgradeable = await ethers.getContractFactory("ERC404TicketUpgradeable");

  const name = "Ticket";
  const symbol = "HS";
  const decimals = 18;
  const maxTotalSupplyERC721 = 1000;
  const initialOwner = deployer.address;
  const initialMintRecipient = deployer.address;

  const ticketProxy = await upgrades.deployProxy(
    ERC404TicketUpgradeable,
    [name, symbol, decimals, maxTotalSupplyERC721, initialOwner, initialMintRecipient],
    {
      initializer: "initialize",
    }
  );
 
  await ticketProxy.deployed();
  console.log("ERC404TicketUpgradeable 代理合约部署成功，地址:", ticketProxy.address);

  // // 验证一下
  // const ticketInstance = await ethers.getContractAt("ERC404TicketUpgradeable", ticketProxy.address);
  // const ticketSymbol = await ticketInstance.symbol();
  // console.log("Ticket symbol:", ticketSymbol);

  // // === 3. 部署 TicketMarketplace（市场合约）===
  // const TicketMarketplace = await ethers.getContractFactory("TicketMarketplace");

  // const marketProxy = await upgrades.deployProxy(
  //     TicketMarketplace,
  //     [myTokenproxy.address, ticketProxy.address, deployer.address],
  //     {
  //     initializer: "initialize",
  //     }
  // );

  // await marketProxy.deployed();
  // console.log("TicketMarketplace 市场合约部署成功，地址:", marketProxy.address);

  // // === 4. 部署 Exchange（交易所合约）===
  // const ExchangePlus = await ethers.getContractFactory("ExchangePlus");

  // const exchangeProxy = await ExchangePlus.deploy(
  //   myTokenproxy.address,
  //   ticketProxy.address,
  //   10000
  // );

  // await exchangeProxy.deployed();
  // console.log("ExchangePlus 合约部署成功，地址:", exchangeProxy.address);

  // // === 5. 部署 Proof（存证合约）===
  // const Proof = await ethers.getContractFactory("Proof");
  // const proofProxy = await upgrades.deployProxy(
  //     Proof,
  //     [deployer.address],
  //     { initializer: "initialize" }
  // );
  // await proofProxy.deployed();
  // console.log("Proof 合约部署成功:", proofProxy.address);
 
  // // === 6. 部署 LogicV1 ===
  // const LogicV1 = await ethers.getContractFactory("LogicV1");
  // const logicV1Proxy = await upgrades.deployProxy(
  //     LogicV1,
  //     [deployer.address],
  //     { initializer: "initialize" }
  // );
  // await logicV1Proxy.deployed();
  // console.log("logicV1Proxy 合约部署成功:", logicV1Proxy.address);

  // === 7. 部署 Loan（银行贷款合约）===
  const ERC20LoanContract = await ethers.getContractFactory("ERC20LoanContract");
  const erc20LoanContractProxy = await upgrades.deployProxy(
      ERC20LoanContract,
      ["500", "0xDeC3326BE4BaDb9A1fA7Be473Ef8370dA775889a"],
      { initializer: "initialize" }
  );
  await erc20LoanContractProxy.deployed();
  console.log("erc20LoanContractProxy 合约部署成功:", erc20LoanContractProxy.address);

  // const ERC404 = await ethers.getContractAt("ERC404TicketUpgradeable", "0x9004B1860EC9401E17a7bEe425E053c1cAb228eb");
  // const ipfsHash = await ERC404.IpfsHash();
  // console.log("当前 IpfsHash:", ipfsHash);

  // // 或者：
  // // npx hardhat console --network myCustomNet
  // // const contract = await ethers.getContractAt("LogicV1", "0xbebC52079330174978Eb55B1f06Fc510f600eB06");
  // // await contract.getVersion();·

}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});

// 目前 dev、test 环境的各个合约地址：
// 部署者地址: 0xE25583099BA105D9ec0A67f5Ae86D90e50036425
// 代理合约部署成功，地址: 0xcaF566B6936A73C2913cA4CA77Dd4E95CcD0eD03
// ERC404TicketUpgradeable 代理合约部署成功，地址: 0x50F1a0A7092448bd28207966B4C8C41901567315
// TicketMarketplace 市场合约部署成功，地址: 0xD5CAaC5A339A38D2AAA7E0e0554BDA505742bE14
// ExchangePlus 合约部署成功，地址: 
// Proof 合约部署成功: 0x23C5f582BAEdE953e6e2F5b8Dd680d5B97B39E78
// logicV1Proxy 合约部署成功: 0xbebC52079330174978Eb55B1f06Fc510f600eB06
// erc20LoanContractProxy 合约部署成功: 0x6Bd8b919f8f73caD781ea1A21f0A6e41B8716e30


// dev、test - 为了测试导入代币和门票功能是否正常新部署的合约地址：
// 部署者地址: 0xE25583099BA105D9ec0A67f5Ae86D90e50036425
// 代理合约部署成功，地址: 0xf23BCE22E570b937258B3d85DA96fF313185B2BC
// ERC404TicketUpgradeable 代理合约部署成功，地址: 0x658F58f3908aFdB1cCf54A3eff552A41877a2e3d
// 代理合约部署成功，地址: 0x0436bb501448cC7407F2524E4C78a5eB834D0559
// ERC404TicketUpgradeable 代理合约部署成功，地址: 0xf838cAfc6aa127E1A7DCad5FE5aC59e32CAd7B1D



// 目前 canary 环境的各个合约地址：
// 部署者地址: 0xE25583099BA105D9ec0A67f5Ae86D90e50036425
// 代理合约部署成功，地址: 0xDeC3326BE4BaDb9A1fA7Be473Ef8370dA775889a
// ERC404TicketUpgradeable 代理合约部署成功，地址: 0xCC97bb833F9D361Fd8F65e02Ba4b8413E1E0AE0D
// TicketMarketplace 市场合约部署成功，地址: 0xBFfF570853d97636b78ebf262af953308924D3D8
// ExchangePlus 合约部署成功，地址: 0xcC1AdEA804E60d6dCbD53f3f92ab08b612310453
// Proof 合约部署成功: 0x4B6Ea59a4CE0406E98FA6E29440af027dA33B970
// logicV1Proxy 合约部署成功: 0x8d7B78D40C304c78E1740Cb0c878bf81B7365520
// erc20LoanContractProxy 合约部署成功: 0x92eAB1d933C11544F4b4b55b149127DDa87ceC23

// canary - 为了测试导入代币和门票功能是否正常新部署的合约地址：
// 部署者地址: 0xE25583099BA105D9ec0A67f5Ae86D90e50036425
// 代理合约部署成功，地址: 0x5605D2A8822Ae9Facc8D651e1BB1A73Aac2579D0
// ERC404TicketUpgradeable 代理合约部署成功，地址: 0x611f2Bd2907A513e87ba3dC9D18660c1a046244C

