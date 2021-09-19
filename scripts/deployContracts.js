// We require the Hardhat Runtime Environment explicitly here. This is optional
// but useful for running the script in a standalone fashion through `node <script>`.
//
// When running the script with `npx hardhat run <script>` you'll find the Hardhat
// Runtime Environment's members available in the global scope.
const hre = require("hardhat");

let deployer, token, priest;
let txn, receipt, nonce;
let SLEEPMS = 1000;
let initialSupply = '100000000.0'; // 100 million

function sleep(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
}

async function wait_nonce() {
    while (nonce == await deployer.getTransactionCount()) {
        await sleep(SLEEPMS);
        console.log("Nonce not updated", nonce);
    }
    nonce++;
}

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

    // Deploy token
    const supply = ethers.utils.parseEther(initialSupply);
    console.log(supply);
    const Token = await ethers.getContractFactory("DragonPriestToken");
    token = await Token.connect(deployer).deploy(supply);
    console.log(await token.owner());

    nonce = await deployer.getTransactionCount();
    // Try removing previous priest address
    // txn = await token.connect(deployer).removePriest();
    // receipt = await txn.wait();
    // console.log(receipt.events);
    // await wait_nonce();

    // Deploy priest contract
    const Priest = await ethers.getContractFactory("DragonPriest");
    priest = await Priest.connect(deployer).deploy(token.address);
    await priest.deployed();

    // set priest
    //nonce = await deployer.getTransactionCount();
    txn = await token.connect(deployer).setPriest(priest.address);
    receipt = await txn.wait();
    console.log(receipt.events);
    await wait_nonce();

    // Get balance and claim tokens
    const balance = parseInt(await priest.dpt_earned(deployer.address));
    console.log(balance);
    if (balance > 0) {
        txn = await priest.connect(deployer).claim();
        receipt = await txn.wait();
        console.log(receipt.events);
    }
    console.log("Balance", ethers.utils.formatEther(await token.balanceOf(deployer.address)));
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
