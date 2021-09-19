// SPDX-License-Identifier: UNLICENSED
pragma solidity 0.8.6;
import "@openzeppelin/contracts/token/ERC20/ERC20.sol";
import "@openzeppelin/contracts/access/Ownable.sol";

import "hardhat/console.sol";

contract DragonPriestToken is ERC20, Ownable {
    address public priest;

    event SetPriest(address Priest);
    event RemovedPriest();

    constructor(uint256 initialSupply) ERC20("Dragon Priest Token", "DPT") {
        priest = address(0);
        _mint(address(this), initialSupply);
    }

    function isValidContract(address addr) public view returns (bool) {
        uint256 size;
        assembly {
            size := extcodesize(addr)
        }
        return size > 0;
    }

    // Manage the controller contract that will allow people to perform tasks and earn LOWT
    function setPriest(address _priest_addr) external onlyOwner {
        // Set priest and transfer all available tokens to the priest contract
        require(priest == address(0), "Priest already set");
        require(
            allowance(_priest_addr, address(this)) >= totalSupply(),
            "New priest should allow ERC20 transfers"
        );
        if (isValidContract(_priest_addr)) {
            priest = _priest_addr;

            _transfer(address(this), priest, balanceOf(address(this)));
        }
        emit SetPriest(priest);
    }

    function removePriest() external onlyOwner {
        // Remove priest and transfer all available tokens back to this contract
        // The owner should later be made a DAO
        require(priest != address(0), "No priest set"); // not null address
        // transferFrom(
        //     address(priest),
        //     payable(address(this)),
        //     balanceOf(priest)
        // );
        _transfer(priest, address(this), balanceOf(priest));
        priest = address(0);
        emit RemovedPriest();
    }
}
