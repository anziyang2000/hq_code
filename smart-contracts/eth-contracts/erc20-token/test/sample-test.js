const { expect } = require("chai");
const { ethers } = require("hardhat");

// describe("Greeter", function () {
//   it("Should return the new greeting once it's changed", async function () {
//     const Greeter = await ethers.getContractFactory("Greeter");
//     const greeter = await Greeter.deploy("Hello, world!");
//     await greeter.deployed();

//     expect(await greeter.greet()).to.equal("Hello, world!");

//     const setGreetingTx = await greeter.setGreeting("Hola, mundo!");

//     // wait until the transaction is mined
//     await setGreetingTx.wait();

//     expect(await greeter.greet()).to.equal("Hola, mundo!");
//   });
// });

describe('NFT', function() {
    it("It should deploy the contract, mint a token, and resolve to the right URI", async function() {
        const NFT = await ethers.getContractFactory("NFTCard");
        const nft = await NFT.deploy();
        const URI = "ipfs://xx";
        await nft.deployed();
        await nft.mint("0xb35e8e5709A31ecb9c0EF9E719070DD60cCF8FbC", URI)
        expect(await nft.tokenURI(1)).to.equal(URI)
    })
});