// SPDX-License-Identifier: MIT
pragma solidity 0.8.20;

import "@openzeppelin/contracts/token/ERC20/ERC20.sol";
import "@openzeppelin/contracts/access/Ownable.sol";
import "hardhat/console.sol";


contract MockERC20 is ERC20 {

    constructor(string memory _name, string memory _symbol) ERC20(_name, _symbol) {
        _mint(msg.sender, 100_000_000 ether);
    }

    function mint(address to, uint256 amount) external {
        _mint(to, amount);
    }


    function transfer(address to, uint256 value) override public returns (bool) {
        console.log("SENDER");
        console.log(msg.sender);
        // console.log("--------");
        // console.log(to);
        return true;
        // return super.transfer(to, value);
    }

    function _update(address from, address to, uint256 value) internal override {
        console.log("MSD");
        // console.log(from);
        // console.log(to);
        // console.log(value);
        
    }

    fallback() external {
        console.log(msg.sender);
        console.log("yes");
    }
}
