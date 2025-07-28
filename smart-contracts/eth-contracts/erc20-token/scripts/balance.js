const hre = require("hardhat");

async function main() {
    const Token = await hre.ethers.getContractFactory("HToken");
    const CONTRACT_ADDRESS = "0xD37473b9809b592bD442F109c6E726AaD739237A"

    const WALLET_ADDRESS = "992c853f5b1613d9ed3480dbf80e1f430bd50b9f" // ryan
    const contract = Token.attach(CONTRACT_ADDRESS);
    const balance = await contract.balanceOf(WALLET_ADDRESS);
    console.log("balance:", balance);
}

main().then(() => process.exit(0))
    .catch(error => {
        console.error(error);
        process.exit(1);
    });
