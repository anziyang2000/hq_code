const hre = require("hardhat");

async function main() {
    const Etoken = await hre.ethers.getContractFactory("HToken");
    const etoken = await Etoken.deploy();
    await etoken.deployed();
    console.log("token deployed to:", etoken.address);
}

main().then(() => process.exit(0))
    .catch(error => {
        console.error(error);
        process.exit(1);
    });