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
```
