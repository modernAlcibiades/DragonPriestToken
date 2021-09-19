// SPDX-License-Identifier: UNLICENSED
pragma solidity 0.8.6;

import "./Token.sol";

contract Priest {
    DragonPriestToken token;

    constructor(address _token_addr) {
        token = DragonPriestToken(_token_addr);
        token.approve(_token_addr, token.totalSupply());
    }
}
