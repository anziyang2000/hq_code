const hre = require('hardhat')
const { ethers, upgrades } = require('hardhat')

async function main() {
  console.log("当前网络:", hre.network.name);
  console.log("RPC URL:", hre.network.config.url);

  const [deployer] = await hre.ethers.getSigners();
  // 注意这句代码：console.log('deployer:', deployer);
  //   deployer 是一个 SignerWithAddress 对象，它包装了一个 JsonRpcSigner。在 console.log(deployer) 的时候，Node.js 会尝试「递归展开」这个对象，访问其内部字  段。一旦访问到 未初始化的 provider 或挂载到 localhost:8545 的默认 provider，就可能访问失败，或者引发 隐式错误：Error: insufficient funds for intrinsic transaction cost 这个错误通常在尝试发送交易（或者内部执行 .estimateGas()）时触发，而打印复杂对象有可能间接触发这些调用
  console.log("地址:", deployer.address);


  // // 1. 部署逻辑合约（MyToken）
  // const MyToken = await ethers.getContractFactory("MyToken");
  // const myTokenImpl = await MyToken.deploy();
  // await myTokenImpl.deployed(); 
  // console.log("逻辑合约 MyToken 部署在:", myTokenImpl.address);

  // // 2. 准备初始化数据（调用 initialize(address)）
  // const initCalldata = MyToken.interface.encodeFunctionData("initialize", [deployer.address]);

  // // 3. 部署 ProxyAdmin
  // const MyProxyAdmin = await ethers.getContractFactory("MyProxyAdmin");
  // const proxyAdmin = await MyProxyAdmin.deploy(deployer.address);
  // await proxyAdmin.deployed(); 
  // console.log("ProxyAdmin 部署在:", proxyAdmin.address);

  // // 4. 部署 TransparentUpgradeableProxy（MyProxy）
  // const MyProxy = await ethers.getContractFactory("MyProxy");
  // const proxy = await MyProxy.deploy(
  //   myTokenImpl.address,
  //   proxyAdmin.address,
  //   initCalldata
  // );
  // await proxy.deployed(); 
  // console.log("代理合约部署在:", proxy.address);

  // // 5. 通过代理地址访问逻辑合约的功能
  // const token = await ethers.getContractAt("MyToken", proxy.address);
  // const name = await token.name();
  // console.log("代理合约的 name 调用结果:", name);

  // 6. 部署LogicV2逻辑合约
  const LogicV2 = await ethers.getContractFactory("LogicV2");
  const logicV2 = await LogicV2.deploy();
  await logicV2.deployed(); 
  console.log("逻辑合约 logicV2 部署在:", logicV2.address);
}

// We recommend this pattern to be able to use async/await everywhere
// and properly handle errors.
main()
  .then(() => process.exit(0))
  .catch(error => {
    console.error(error)
    process.exitCode = 1
  })


// 执行命令部署合约：npx hardhat run scripts/deploy.js --network myCustomNet 

// 目前 test 环境的 logicV1 和 logicV2 合约地址：
// 逻辑合约 logicV2 部署在: 0x9b5FFA56871D025Bee70A878a98686d275a1e974
// 逻辑合约 logicV1 部署在: 0x0F9C41F408E125232Bdb4e68E3cf037880A96F10

// 目前 canary 环境的 logicV1 和 logicV2 合约地址：
// 逻辑合约 logicV1 部署在: 0xde04C2eE8feC137bea7DeaB6Eacc01cf0cC69e7F
// 逻辑合约 logicV2 部署在: 0x15330e245151602A5f78a3429ebbF6FE168B93d4