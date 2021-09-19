// SPDX-License-Identifier: UNLICENSED
pragma solidity 0.8.6;
import "@openzeppelin/contracts/token/ERC20/ERC20.sol";
import "./Priest.sol";

contract Token is ERC20("Dragon Priest Token", "DPT") {
    Priest priest;

    constructor() {}
}
