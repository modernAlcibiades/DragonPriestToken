// SPDX-License-Identifier: UNLICENSED
pragma solidity 0.8.6;

import "./Token.sol";
import "./Dragon.sol";

import "hardhat/console.sol";

contract DragonPriest {
    DragonPriestToken token;
    Lair lair = Lair(0x83633dca596E741c80f4FA032C75518CC251B09b);

    mapping(address => uint256) public dpt_earned;
    mapping(address => bool) public is_living;
    uint256 public num_living_dragons;
    uint256 public BASE_MULTIPLIER = 1000;
    uint256 public TRUST_EARN_DIVISOR = 10;

    event Claim(address indexed user, uint256 amount);
    event Earned(address indexed user, uint256 amount);
    event Breeding(
        address indexed parent1,
        address indexed parent2,
        string name
    );

    constructor(address _token_addr) {
        token = DragonPriestToken(_token_addr);
        token.approve(_token_addr, token.totalSupply());
    }

    // Check that dragon contract has not been destroyed
    function isDragonAlive(address addr) public view returns (bool) {
        uint256 size;
        assembly {
            size := extcodesize(addr)
        }
        return size > 0;
    }

    // make sure the number of dragons is correct
    modifier countDragons() {
        Dragon[] memory dragons = lair.allDragons();
        uint256 current_dragons = num_living_dragons;
        for (uint256 i = 0; i < dragons.length; i++) {
            if (
                // If dragon was earlier alive, now dead
                is_living[address(dragons[i])] &&
                !isDragonAlive(address(dragons[i]))
            ) {
                current_dragons--;
                delete is_living[address(dragons[i])];
            } else if (
                // If new dragon added
                !is_living[address(dragons[i])] &&
                isDragonAlive(address(dragons[i]))
            ) {
                current_dragons++;
                is_living[address(dragons[i])] = true;
            }
        }
        num_living_dragons = current_dragons;
        _;
    }

    function claim() public {
        uint256 balance = dpt_earned[msg.sender];
        if (balance > 0 && token.balanceOf(address(this)) > balance) {
            dpt_earned[msg.sender] = 0;
            token.transferFrom(address(this), msg.sender, balance);
            emit Claim(msg.sender, balance);
        }
    }

    function award(
        uint256 high,
        uint256 low,
        uint256 divisor
    ) internal {
        if (high > low) {
            uint256 change = ((high - low) * BASE_MULTIPLIER) /
                (num_living_dragons * divisor);
            console.log(high, low, num_living_dragons, BASE_MULTIPLIER);
            dpt_earned[msg.sender] += change;
            emit Earned(msg.sender, change);
        }
    }

    function runBasic(Dragon dragon) public countDragons {
        require(is_living[address(dragon)], "Dragon is dead");
        //console.log("Basic for", dragon.name());
        uint256 boredom = dragon.getBoredom();
        uint256 hunger = dragon.getHunger();
        uint256 sleepiness = dragon.getSleepiness();
        uint256 uncleanliness = dragon.getUncleanliness();
        uint256 initial_value = boredom + hunger + sleepiness + uncleanliness;

        // This ordering of events is optimal at reducing all values
        // check boredom
        if (
            boredom > 5 && hunger < 80 && sleepiness < 80 && uncleanliness < 80
        ) {
            dragon.play();

            boredom = 0;
            hunger += 10;
            sleepiness += 10;
            uncleanliness += 5;
            //console.log("Play");
        }

        // check hunger
        if (hunger > 5 && boredom < 80 && uncleanliness < 80) {
            dragon.feed();

            hunger = 0;
            boredom += 10;
            uncleanliness += 3;
            //console.log("Feed");
        }

        // check sleepy
        if (sleepiness > 5 && uncleanliness < 80) {
            dragon.sleep();

            sleepiness = 0;
            uncleanliness += 5;
            //console.log("sleep");
        }

        // execute script
        if (uncleanliness > 5) {
            dragon.clean();

            uncleanliness = 0;
            //console.log("clean");
        }
        // At the end, boredom = 10, everything else = 0 (given boredom and hunger < 80)
        award(
            initial_value,
            boredom + hunger + uncleanliness + sleepiness,
            TRUST_EARN_DIVISOR
        );
    }

    function runHeal(Dragon dragon) public countDragons {
        require(is_living[address(dragon)], "Dragon is dead");

        uint256 initial_value = dragon.health();
        dragon.heal();
        console.log(initial_value, dragon.health());
        award(dragon.health(), initial_value, dragon.healthRegeneration());
    }

    function runUpgrade(Dragon dragon, uint256 index) public countDragons {
        require(is_living[address(dragon)], "Dragon is dead");

        if (dragon.canUpgrade()) {
            if (index % 4 == 0) {
                dragon.upgradeAttackCooldown();
            } else if (index % 4 == 1) {
                dragon.upgradeDamage();
            } else if (index % 4 == 2) {
                dragon.upgradeHealing();
            } else if (index % 4 == 3) {
                dragon.upgradeMaxHealth();
            }
            award(0, 1, 1); //
        }
    }

    function runBreedSpecific(
        Dragon parent1,
        Dragon parent2,
        string memory name
    ) public countDragons returns (bool) {
        require(
            is_living[address(parent1)] && is_living[address(parent2)],
            "Dragon is dead"
        );
        if (parent1.canBreed() && parent2.canBreed()) {
            parent1.breed(parent2, name);
            emit Breeding(address(parent1), address(parent2), name);
            award(0, 1, 1);
        }
    }

    function runBreed(string memory name)
        public
        payable
        countDragons
        returns (bool success)
    {
        bool parent_ready;
        Dragon parent;
        uint256 birth_count = 0;
        Dragon[] memory dragons = lair.allDragons();
        for (uint256 i = 0; i < dragons.length; i++) {
            if (is_living[address(dragons[i])]) {
                if (dragons[i].canBreed()) {
                    if (parent_ready) {
                        dragons[i].breed(parent, name);
                        birth_count += 1;
                        emit Breeding(
                            address(parent),
                            address(dragons[i]),
                            name
                        );
                        success = true;
                        parent_ready = false;
                    } else {
                        parent = dragons[i];
                        parent_ready = true;
                    }
                }
            }
        }
        award(0, 2**(birth_count + 1), 1);
    }
}
