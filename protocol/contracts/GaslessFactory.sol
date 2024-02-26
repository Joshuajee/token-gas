// SPDX-License-Identifier: MIT
pragma solidity 0.8.20;

import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/token/ERC20/ERC20.sol";
import "@chainlink/contracts/src/v0.8/interfaces/AggregatorV3Interface.sol";

import "./GaslessPaymaster.sol";
import "hardhat/console.sol";


contract GaslessFactory is Ownable {

    error PoolAlreadyExist(address pool);


    struct PoolAddress {
        address token;
        address payMaster;
    }


    // mapping of pulls that exist
    mapping(address => address) public poolExist;

    PoolAddress [] poolAddresses;

    ISwapRouter immutable public router;
    address immutable public bnbPriceFeeds;

    constructor (ISwapRouter _router, address _bnbPriceFeeds) Ownable(msg.sender) {
        router = _router;
        bnbPriceFeeds = _bnbPriceFeeds;
    }

    function createPool(IERC20 token, address tokenPriceFeeds) external onlyOwner payable poolDoesNotExist(token) {
        
        GaslessPaymaster pool = new GaslessPaymaster(token, router, bnbPriceFeeds, tokenPriceFeeds);

        // add token
        poolAddresses.push(
            PoolAddress({
                token: address(token), 
                payMaster: address(pool)
            }
        ));

        poolExist[address(token)] = address(pool);

        pool.deposit(msg.sender);

    }

    /**
     * get all pool address
     */

    function getPoolAddresses() external view returns (PoolAddress [] memory) {
        return poolAddresses;
    }


    modifier poolDoesNotExist(IERC20 token) {
        if (poolExist[address(token)] != address(0)) revert PoolAlreadyExist(address(token));
        _;
    }


}
