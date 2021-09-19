const { network, ethers } = require("hardhat");
const hre = require("hardhat");

let deployer, token, priest;
let txn, receipt, nonce;
let SLEEPMS = 1000;

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
    // Load account
    if (network.name == 'hardhat') {
        await hre.network.provider.request({
            method: "hardhat_impersonateAccount",
            params: [process.env.ADDRESS],
        });
        deployer = await ethers.getSigner(process.env.ADDRESS)
    } else if (network.name == 'fantom') {
        deployer = (await ethers.getSigners())[0];
    }


    // From Lair get all dragons
    const Lair = await ethers.getContractFactory("Lair");
    const lair = await Lair.attach("0x83633dca596e741c80f4fa032c75518cc251b09b");

    const Priest = await ethers.getContractFactory("DragonPriest");
    priest = await Priest.attach("0x21c8c018fac4d79034291c66b2f29f6de4316810");

    nonce = await deployer.getTransactionCount();

    const Dragon = await ethers.getContractFactory("Dragon");
    let dragons_list;
    dragons_list = await lair.allDragons();

    console.log("name, maxHealth, trust, boredom, hunger, sleepiness, uncleanliness, attacktime");

    // functions
    async function getDragonInfo(addr) {
        const dragon = await Dragon.attach(addr);
        let state = {
            address: addr,
            dname: await dragon.name(),
            maxHealth: parseInt(await dragon.maxHealth()),
            trust: parseInt(await dragon.trust(priest.address)),
            boredom: parseInt(await dragon.getBoredom()),
            hunger: parseInt(await dragon.getHunger()),
            sleepiness: parseInt(await dragon.getSleepiness()),
            uncleanliness: parseInt(await dragon.getUncleanliness()),
            health: parseInt(await dragon.health()),
            maxHealth: parseInt(await dragon.maxHealth()),
            canUpgrade: await dragon.canUpgrade()
        }
        return state;
    }

    async function runJobs(state) {
        try {
            // Earn trust
            console.log("Basic job", state.dname);
            txn = await priest.runBasic(state.address);
            receipt = await txn.wait();
            console.log(receipt.events);
            await wait_nonce();

            // Heal
            if (state.health < 0.8 * state.maxHealth && state.trust > 1) {
                console.log("Healing", state.dname);
                txn = await priest.runHeal(state.address);
                receipt = await txn.wait();
                console.log(receipt.events);
                await wait_nonce();
            }

            // Upgrade
            if (state.canUpgrade && state.trust > 5) {
                console.log("Upgrade", state.dname);
                txn = await priest.runUpgrade(state.address, Math.floor(Math.random() * 4));
                receipt = await txn.wait();
                console.log(receipt.events);
                await wait_nonce();
                console.log(parseInt(await priest.dpt_earned(deployer.address)));
            }
        } catch (e) {
            console.log(e);
        }
    }

    let state;
    for (let i = 0; i < dragons_list.length; i++) {
        try {
            state = await getDragonInfo(dragons_list[i]);
            console.log("Before", state);
            await runJobs(state);
            state = await getDragonInfo(dragons_list[i]);
            console.log("After", state);
        } catch (e) {
            if (e.code == 'CALL_EXCEPTION') {
                console.log("Dead dragon", e.code, e.address);
            } else {
                console.log(e);
            }
        }
    }
}


// We recommend this pattern to be able to use async/await everywhere
// and properly handle errors.
main()
    .then(() => process.exit(0))
    .catch(error => {
        console.error(error);
        process.exit(1);
    });
