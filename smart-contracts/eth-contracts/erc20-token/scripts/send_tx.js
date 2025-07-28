const hre = require("hardhat");

async function main() {
    const Token = await hre.ethers.getContractFactory("HToken");
    const CONTRACT_ADDRESS = "0xBaEB792bAe06990D546E36a47c515Fe21fB534c7"
    //const WALLET_ADDRESS = "0x6c32D26A4dAf029c2f781236d4a95F2496d4D494" // ryan
    const WALLET_ADDRESS = "0xE15396104ae57e7dB40592992ADcF88c0162C115" // jiang

    const contract = Token.attach(CONTRACT_ADDRESS);
    let tx = await contract.transfer(WALLET_ADDRESS, URI);
    console.log("tx.hash: ", tx.hash);
}

main().then(() => process.exit(0))
    .catch(error => {
        console.error(error);
        process.exit(1);
    });