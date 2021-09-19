const { expect } = require("chai");

let deployer, token, priest;
let txn, receipt;

describe("Breed", function () {
  it("Deploy and test token contract", async function () {
    // Get account
    if (network.name == 'hardhat') {
      await hre.network.provider.request({
        method: "hardhat_impersonateAccount",
        params: [process.env.ADDRESS],
      });
      deployer = await ethers.getSigner(process.env.ADDRESS)
    } else if (network.name == 'fantom') {
      deployer = (await ethers.getSigners())[0];
    }
    console.log("Deployer", deployer.address);

    let initialSupply = 10 ** 6; // 1 million
    // Deploy token
    const Token = await ethers.getContractFactory("DragonPriestToken");
    token = await Token.connect(deployer).deploy(initialSupply);
    await token.deployed();
    console.log("Token address", token.address);

    // Check that balance of token contract = initial supply
    expect(await token.balanceOf(token.address)).to.equal(initialSupply);
    console.log("Total supply", parseInt(await token.totalSupply()));

    // Deploy priest contract
    const Priest = await ethers.getContractFactory("Priest");
    priest = await Priest.deploy(token.address);
    await priest.deployed();
    console.log("Priest address", priest.address);

    // Try setting priest address
    txn = await token.setPriest(priest.address);
    receipt = await txn.wait();
    console.log(receipt.events);
    // check that priest address set
    expect(await token.priest()).to.equal(priest.address);
    // check that all tokens transferred
    expect(await token.balanceOf(token.address)).to.equal(0);
    expect(await token.balanceOf(priest.address)).to.equal(initialSupply);


    // Try setting priest address again, should throw error
    await expect(token.setPriest(priest.address)).to.be.revertedWith('Priest already set');
    expect(await token.priest()).to.equal(priest.address);

    console.log("Removing Priest");
    // Try removing priest address
    txn = await token.removePriest();
    receipt = await txn.wait();
    console.log(receipt.events);
    // check that priest address set
    expect(await token.priest()).to.equal('0x0000000000000000000000000000000000000000');
    // check that all tokens transferred
    expect(await token.balanceOf(token.address)).to.equal(initialSupply);
    expect(await token.balanceOf(priest.address)).to.equal('0x0000000000000000000000000000000000000000');

    // Try removing priest address again, should throw error
    await expect(token.removePriest()).to.be.revertedWith('No priest set');

  });
});
