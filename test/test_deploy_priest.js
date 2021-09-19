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

    let initialSupply = 10 ** 9; // 1 billion
    // Deploy token
    const Token = await ethers.getContractFactory("DragonPriestToken");
    token = await Token.connect(deployer).deploy(initialSupply);
    await token.deployed();
    console.log("Token address", token.address);

    // Deploy priest contract
    const Priest = await ethers.getContractFactory("DragonPriest");
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

    // Test all the functions
    // test for Leshner and Kraken the Stud
    const Dragon = await ethers.getContractFactory('Dragon');
    const alive_dragon = await Dragon.attach("0x6b121793d1cB8936BAC7135e8532BfBf3e694166");
    const dead_dragon = await Dragon.attach("0x9830Db8a4E124864AC10A2757874b01aB763011D");

    // Test basic
    txn = await priest.connect(deployer).runBasic(alive_dragon.address);
    receipt = await txn.wait();
    //console.log(receipt.events);
    expect(await priest.num_living_dragons()).to.equal(7); // at the block used for testing
    expect(await priest.dpt_earned(deployer.address)).to.equal(928);

    // Should revert if called on dead dragon
    await expect(priest.connect(deployer).runBasic(dead_dragon.address)).to.be.revertedWith("Dragon is dead");

    // Test heal
    txn = await priest.connect(deployer).runHeal(alive_dragon.address);
    receipt = await txn.wait();
    console.log(parseInt(await priest.dpt_earned(deployer.address)));

    // Test upgrade
    txn = await priest.connect(deployer).runUpgrade(alive_dragon.address, Math.floor(4 * random()));
    receipt = await txn.wait();
    console.log(receipt.events);
    console.log(await priest.dpt_earned(deployer.address));


    // Test breed - not sure how to

    // Test claim
    txn = await priest.connect(deployer).claim();
    receipt = await txn.wait();
    console.log(receipt.events);


    // Final values
    expect(await alive_dragon.trust(priest.address)).to.equal(3);

  });
});
