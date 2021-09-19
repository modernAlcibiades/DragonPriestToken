// We require the Hardhat Runtime Environment explicitly here. This is optional
// but useful for running the script in a standalone fashion through `node <script>`.
//
// When running the script with `npx hardhat run <script>` you'll find the Hardhat
// Runtime Environment's members available in the global scope.
const hre = require("hardhat");

let deployer, token, priest;
let txn, receipt;

async function main() {
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

    let initialSupply = 10 ** 8; // 100 million
    // Deploy token
    const Token = await ethers.getContractFactory("DragonPriestToken");
    token = await Token.connect(deployer).deploy(initialSupply);
    await token.deployed();


    // Deploy priest contract
    const Priest = await ethers.getContractFactory("DragonPriest");
    priest = await Priest.deploy(token.address);
    await priest.deployed();

    // set priest
    txn = await token.setPriest(priest.address);
    receipt = await txn.wait();
    console.log(receipt.events);

    // check that priest address set
    console.log("Token address", token.address);
    console.log("Priest address", priest.address);
    console.log("Priest address set at ", await token.priest());
    // check that all tokens transferred
    console.log("Initial supply", parseInt(await token.balanceOf(priest.address)), parseInt(await token.totalSupply()));
}

// We recommend this pattern to be able to use async/await everywhere
// and properly handle errors.
main()
    .then(() => process.exit(0))
    .catch((error) => {
        console.error(error);
        process.exit(1);
    });
