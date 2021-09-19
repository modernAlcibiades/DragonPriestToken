import "@openzeppelin/contracts/token/ERC20/ERC20.sol";
import "./Priest.sol";

contract Token is ERC20("Dragon Priest Token", "DPT") {
    Priest priest;

    constructor(add) {}
}
