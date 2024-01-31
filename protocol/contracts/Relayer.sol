// SPDX-License-Identifier: UNLICENSED
pragma solidity ^0.8.9;
import "@openzeppelin/contracts/access/Ownable.sol";


// Uncomment this line to use console.log
// import "hardhat/console.sol";

contract Relayer is Ownable {

    event AddExecutor(address indexed _executor);
    event RemoveExecutor(address indexed _executor);
    event CreateAdCampaign(address indexed _sponsor, uint indexed _campaignId, uint indexed funds);

    mapping(address => bool) executor;
    
    constructor() Ownable(msg.sender) {}



    function addExecutor(address _executor) external onlyOwner {
        executor[_executor] = true;
        emit AddExecutor(_executor);
    }

    function removeExecutor(address _executor) external onlyOwner {
        delete executor[_executor];
        emit RemoveExecutor(_executor);
    }


}
