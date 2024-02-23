// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/token/ERC20/ERC20.sol";
import "@openzeppelin/contracts/token/ERC20/utils/SafeERC20.sol";
import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/token/ERC20/extensions/ERC20Permit.sol";
import {ECDSA} from "@openzeppelin/contracts/utils/cryptography/ECDSA.sol";
import "@openzeppelin/contracts/utils/ReentrancyGuard.sol";
import "@openzeppelin/contracts/token/ERC20/extensions/ERC4626.sol";



abstract contract TokenVault is ERC4626 {

   
    constructor(IERC20 _token) 
        ERC4626(_token)
        ERC20(string.concat("LGP-", ERC20(address(_token)).name()), string.concat("LGP-", ERC20(address(_token)).symbol()))  {

    }

    /**
     * Deposit BNB to the liqudity pool
     * @param receiver // the lp address
     */

    function deposit(address receiver) external payable {
        super.deposit(msg.value, receiver);
    }


    /**
     * Overrides this function to work with native Tokens
     * @param caller msg.sender
     * @param receiver the address to receive shares
     * @param assets msg.value
     * @param shares shares to mint to the receiver
     */

    function _deposit(address caller, address receiver, uint256 assets, uint256 shares) internal override {

        _mint(receiver, shares);

        emit Deposit(caller, receiver, assets, shares);
    }



    /**
     * override this to give the correct decimal offset
     */

    function _decimalsOffset() internal view override returns (uint8) {
        return ERC20(address(asset())).decimals();
    }


}

