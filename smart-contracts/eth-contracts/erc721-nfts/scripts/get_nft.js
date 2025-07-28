const hre = require("hardhat");

async function main() {
    const NFT = await hre.ethers.getContractFactory("NFTCard");
    const CONTRACT_ADDRESS = "0xBaEB792bAe06990D546E36a47c515Fe21fB534c7"
    const contract = NFT.attach(CONTRACT_ADDRESS);
    const owner = await contract.ownerOf(2);
    console.log("Owner:", owner);
    const uri = await contract.tokenURI(2);
    console.log("URI: ", uri);
}

main().then(() => process.exit(0))
    .catch(error => {
        console.error(error);
        process.exit(1);
    });