# Dragon Priest Token

This project is designed to leverage Lair of Wisdom to create a token for on-chain collaboration and labor. Taking care of dragons is an important and thankless task as of now. In order to incentivize that, we setup the token as follows

- Setup : balance of each account is 0
- If they call any task with the Dragon Priest contract, they earn corresponding number of tokens
- Token emission drops as the number of dragons increases and vice versa
- To stop spurious calls - the emission is equal to the amount of change made
  - Amount of increase due to an upgrade or heal call
  - Amount of net change of a cleaning call, etc
  - Multiplication factor based on number of active dragons
- This also resolves the problem of low trust value

By choice, we have made the Attack option unavailable to avoid gamification. The Dragon Priest project's goal is to ease the tedious tasks and incentivize the community to perform them through the Dragon Priest contract.

## Contracts
[DPT token](https://ftmscan.com/address/0x21c8c018fac4d79034291c66b2f29f6de4316810) - Incentive token for taking care of dragons
[DragonPriest](https://ftmscan.com/address/0xd0f82f2d9cc60970b4263f828650aba8fe03532d) - controller from where you can call the tasks on the dragon, and earn DPT

DPT has no preallocation. All the tokens are up for grabs. The rewards are described in next section. When there are fewer dragons, the rewards are higher. The rewards also go down as the supply increases.

There are additional rewards that will be airdropped when the final version of the contracts is released. To earn the rewards
- Test the contracts, play around with them 
- Earned DPT in the current version will be passed to the next in some form
- Suggest changes that get accepted into the project
- Help build the community and the DAO for the project

As of now, the total rewards for testing and community building aren't much, only 1% of the total supply. Everything else is up for grabs through taking care of the Dragons. This is the true horde of the Dragons.

## Actions & rewards (v1)
All of your actions to take care of Dragons will be recorded and have corresponding rewards. The rewards can be seed in `dpt_earned` and can be claimed by calling `claim()`.


Base Reward multiplier is set at `1000/(number of dragons alive)`. 
For example, if there are 6 dragons alive, the Base Reward is 161 DPT. Detailed rewards are as follows:-

`runBasic`
- Args : `(address Dragon)`
- Function : Runs all trust earning actions for a dragon (feed, play, sleep, clean)
- Rewards : `Base Reward * (Total reduction in boredom, uncleanliness, hunger, sleepines)/10`
  
`runHeal`
- Args : `(address Dragon)`
- Function : Heals the Dragon
- Rewards : `Base Reward * (Total health gain)/(health regeneration)`

`runUpgrade`
- Args : `(address Dragon, int action)`
- Function : choose action to perform - 
  - 0 : Upgrade attack cooldown
  - 1 : Upgrade damage
  - 2 : Upgrade health regenration
  - 3 : Upgrade max health
- Rewards : `Base Reward`


`runBreed`
- Args : `(string name)`
- Function : Find all possible dragons that can breed and call breed on them pairwise
- Rewards : `2**(1+number of new eggs) * Base Reward`

`runBreedSpecific`
- Args : `(address parent1, address parent2, string name)`
- Function : Breed specific dragons
- Rewards : `Base Reward`

## Deployment
```
*Current Contracts*
Token : 0x599F5D24D5840223FFb514D21fB5bB288F45eD2c
Dragon Priest : 0x08b7D9dafD2e5d299d017A93ddb66d1D283b3271
Initial supply 100000000

Updates
- Fixed claim bug
- Linearly diminishing rewards as the number of tokens  increases ie more DPT claimed => smaller DPT rewards
- Supply limit corrected
- Heal/ Upgrade trust requirements made exact 

Old Contracts
*v0*
Token : 0xd0F82F2d9Cc60970b4263f828650aba8fE03532D
- supply didn't account for 18 decimals

Priest : 0x21c8c018FaC4d79034291C66b2F29f6DE4316810
- could not process claims

```

If you wish to support the project, add issues on Github, or fork the project. If you wish to support me, send some love to `0x252DD902190Be0b9aCac625996fDa7137A4b684c`

Peace!!
