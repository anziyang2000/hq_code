const hre = require("hardhat");

async function main() {
    const NFT = await hre.ethers.getContractFactory("NFTCard");
    const URI = "https://gateway.pinata.cloud/ipfs/QmZKEseUHa6DK8NFwN8tMuKSntXa6T58xUV9kGGn2LwUSo"

    const CONTRACT_ADDRESS = "0xBaEB792bAe06990D546E36a47c515Fe21fB534c7"
    const contract = NFT.attach(CONTRACT_ADDRESS);
    await contract._setTokenURI(1, "http://lovfer.com");
    console.log("NFT uri update successed:", contract);
}

main().then(() => process.exit(0))
    .catch(error => {
        console.error(error);
        process.exit(1);
    });