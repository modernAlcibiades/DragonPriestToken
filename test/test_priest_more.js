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
    token = await Token.attach("0xd0F82F2d9Cc60970b4263f828650aba8fE03532D");

    // Try removing priest address
    txn = await token.connect(deployer).removePriest();
    receipt = await txn.wait();
    console.log(receipt.events);

    // Deploy priest contract
    const Priest = await ethers.getContractFactory("DragonPriest");
    //priest = await Priest.attach("0x21c8c018FaC4d79034291C66b2F29f6DE4316810");
    priest = await Priest.connect(deployer).deploy(token.address);
    await priest.deployed();

    // Try setting priest address
    txn = await token.connect(deployer).setPriest(priest.address);
    receipt = await txn.wait();
    console.log(receipt.events);

    // Test all the functions
    // test for Leshner and Kraken the Stud
    const Dragon = await ethers.getContractFactory('Dragon');
    const alive_dragon = await Dragon.attach("0x6b121793d1cB8936BAC7135e8532BfBf3e694166");
    const dead_dragon = await Dragon.attach("0x9830Db8a4E124864AC10A2757874b01aB763011D");

    // Test basic
    txn = await priest.connect(deployer).runBasic(alive_dragon.address);
    receipt = await txn.wait();
    //console.log(receipt.events);
    expect(await priest.num_living_dragons()).to.equal(6); // at the block used for testing
    // Should revert if called on dead dragon
    await expect(priest.connect(deployer).runBasic(dead_dragon.address)).to.be.revertedWith("Dragon is dead");

    // Test heal
    txn = await priest.connect(deployer).runHeal(alive_dragon.address);
    receipt = await txn.wait();
    console.log(parseInt(await priest.dpt_earned(deployer.address)));

    // Test claim
    txn = await priest.connect(deployer).claim();
    receipt = await txn.wait();
    console.log(receipt.events);

  });
});
