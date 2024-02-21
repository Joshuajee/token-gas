// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/token/ERC20/ERC20.sol";
import "@openzeppelin/contracts/token/ERC20/utils/SafeERC20.sol";
import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/token/ERC20/extensions/ERC20Permit.sol";
import {ECDSA} from "@openzeppelin/contracts/utils/cryptography/ECDSA.sol";
import "@openzeppelin/contracts/utils/ReentrancyGuard.sol";
import "@openzeppelin/contracts/token/ERC20/extensions/ERC4626.sol";



contract GaslessPaymaster is Ownable, ReentrancyGuard {

    error CallerNotPaidEnoughGas(uint gasRequired);

    event Transaction(address indexed sender, address indexed recipient, uint amount);
    event Fulfilled(address indexed caller, uint gasPrice,  uint feeAmount, uint gasPriceInTokens, uint feeAmountInTokens);

    using SafeERC20 for IERC20;
          
    struct PermitData {
        address owner;
        uint256 value;
        uint256 deadline;
        uint8 v;
        bytes32 r;
        bytes32 s;
    }

    IERC20 immutable public token;

    uint public callerFeeAmountInEther = 10000000 wei; 
    uint public poolFeeAmountInToken = 0.01 ether; 

    constructor(IERC20 _token) Ownable(msg.sender) {
        token = _token;
    }


    function deposit() external payable {

    }

    function transfer(PermitData calldata permitData, address to) external nonReentrant {

        uint amount = permitData.value;

        address from = permitData.owner;

        address caller = msg.sender;

        ERC20Permit(address(token)).permit(
            from, 
            address(this),
            amount,
            permitData.deadline,
            permitData.v,
            permitData.r,
            permitData.s
        );

        token.safeTransferFrom(from, to, amount);

        _payFees(caller);

        emit Transaction(from, to, amount);

    }

    // function swapOnUNISWAP(PermitData calldata permitData, address from, address to) external nonReentrant {

    //     uint amount = permitData.value;

    //     ERC20Permit(address(token)).permit(
    //         from, 
    //         address(this),
    //         amount,
    //         permitData.deadline,
    //         permitData.v,
    //         permitData.r,
    //         permitData.s
    //     );

    //     token.safeTransferFrom(from, address(this), amount);
    //     token.safeTransfer(to, amount);

    //     uint gasUsed = tx.gasprice;
    //     payable(msg.sender).call{value: gasUsed};

    // }


    function _payFees(address caller) internal {

        uint gasPrice = tx.gasprice;

        uint gasPriceInToken = tx.gasprice;

        uint callerFee = callerFeeAmountInEther;

        uint poolFee = poolFeeAmountInToken;

        uint refund = gasPrice +  callerFeeAmountInEther;

        // Refund the caller with the spend ether plus additional fee
        (bool success, ) = payable(caller).call{value: refund}("0x");

        if (!success) revert CallerNotPaidEnoughGas(refund);

        emit Fulfilled(caller, gasPrice, callerFee, gasPriceInToken, poolFee);


    }


}
