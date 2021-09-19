# Dragon Priest Token

This project is designed to leverage Lair of Wisdom to create a token for on-chain collaboration and labor. Taking care of dragons is an important and thankless task as of now. In order to incentivize that, we setup the token as follows

- Setup : balance of each account is 0
- If they call any task with the Dragon Priest contract, they earn corresponding number of tokens
- Token emission drops as the number of dragons increases and vice versa
- To stop spurious calls - the emission is equal to the amount of change made
  - Amount of increase due to an upgrade or heal call
  - Amount of net change of a cleaning call, etc
  - Multiplication factor based on number of active dragons

- This also resolves the problem of low trust

## Contracts
DPT coin - ERC20
Priest - controller from where you can call the tasks on the dragon, and earn DPT



## Actions & rewards (v1)
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
```
