// SPDX-License-Identifier: UNLICENSED
pragma solidity 0.8.6;

import "./Token.sol";
import "./Dragon.sol";

contract DragonPriest {
    DragonPriestToken token;
    Lair lair = Lair(0x83633dca596E741c80f4FA032C75518CC251B09b);

    mapping(address => uint256) dpt_earned;
    mapping(address => bool) is_living;
    uint256 num_living_dragons;
    uint256 BASE_MULTIPLIER = 1000;
    uint256 TRUST_EARN_DIVISOR = 10;

    event Claim(address indexed user, uint256 amount);
    event Earned(address indexed user, uint256 amount);
    event Breeding(address indexed parent1, address indexed parent 2, string name);

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
            // If dragon was earlier alive, now dead
            if (is_living[dragons[i]] && !isDragonAlive(address(dragons[i])){
                    current_dragons--;
                    delete is_living[dragons[i]];
            }
        }
        num_living_dragons = current_dragons;
        _
    }

    function claim() public {
        uint256 balance = dpt_earned[msg.sender];
        if (balance > 0 && token.balanceOf(address(this) > balance)) {
            dpt_earned[msg.sender] = 0;
            token.transferFrom(address(this), msg.sender, balance);
            emit Claim(msg.sender, balance);
        }
    }

    function award(uint256 initial, uint256 final, uint256 divisor) internal {
        if(initial_value > final){
            uint256 change = ((final - initial)*BASE_MULTIPLIER)/(num_living_dragons*divisor);
            dpt_earned[msg.sender] += change
            emit Earned(msg.sender, change);
        } else {
            emit Earned(msg.sender, 0);
        }
    }

    function runBasic(address _addr)
        public
        countDragons
    {
        require(is_living[_addr]);
        Dragon dragon = Dragon(dragon_address);
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
            trust_earned++;
            //console.log("Feed");
        }

        // check sleepy
        if (sleepiness > 5 && uncleanliness < 80) {
            dragon.sleep();

            sleepiness = 0;
            uncleanliness += 5;
            trust_earned++;
            //console.log("sleep");
        }

        // execute script
        if (uncleanliness > 5) {
            dragon.clean();

            uncleanliness = 0;
            trust_earned++;
            //console.log("clean");
        }
        // At the end, boredom = 10, everything else = 0 (given boredom and hunger < 80)
        award(initial, boredom+hunger+uncleanliness+sleepiness, TRUST_EARNED_DIVISOR);
    }

    function runHeal(
        Dragon dragon
    ) public countDragons {
        if (is_living[address(dragon)]) {
            uint256 initial_value = dragon.health();
            dragon.heal();
            award(initial_value, dragon.health(), dragon.healthRegeneration());
        }
    }

    function runUpgrade(
        Dragon dragon,
        uint index
    ) public countDragons returns (bool) {
        if (is_living[address(dragon)]) {
            if(dragon.canUpgrade()){
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
    }


    function breedSpecific(
        Dragon parent1, 
        Dragon parent2, 
        string memory name
    ) public countDragons returns (bool) {
        if (is_living[address(parent1)] && is_living[address(parent2)]) {
            if(parent1.canBreed() && parent2.canBreed()){
                dragons[i].breed(parent, name);
                birth_count+=1;
                emit Breeding(address(parent), address(dragons[i]), name);
                award(0, 1, 1);
            }
        }
    }

    function runBreed(
        string memory name
    ) public countDragons payable returns (bool success) {
        bool parent_ready;
        Dragon parent;
        uint256 birth_count = 0;
        for (uint256 i = 0; i < dragons.length; i++) {
            if (is_living[dragons[i]]) {
                if (dragons[i].canBreed() && dragons[i]) {
                    if (parent_ready) {
                        dragons[i].breed(parent, name);
                        birth_count+=1;
                        emit Breeding(address(parent), address(dragons[i]), name);
                        success = true;
                        parent_ready = false;
                    } else {
                        parent = dragons[i];
                        parent_ready = true;
                    }
                }
            }
        }
        award(0, 2**(birth_count+1), 1);
    }
}
