const hre = require("hardhat");

async function main() {
    const NFT = await hre.ethers.getContractFactory("NFTCard");
    const URI = "https://gateway.pinata.cloud/ipfs/QmZKEseUHa6DK8NFwN8tMuKSntXa6T58xUV9kGGn2LwUSo"
    //const WALLET_ADDRESS = "0x6c32D26A4dAf029c2f781236d4a95F2496d4D494" // ryan
    const WALLET_ADDRESS = "0xE15396104ae57e7dB40592992ADcF88c0162C115" // jiang

    const CONTRACT_ADDRESS = "0xBaEB792bAe06990D546E36a47c515Fe21fB534c7"
    const contract = NFT.attach(CONTRACT_ADDRESS);
    await contract.mint(WALLET_ADDRESS, URI);
    console.log("NFT minted:", contract);
}

main().then(() => process.exit(0))
    .catch(error => {
        console.error(error);
        process.exit(1);
    });