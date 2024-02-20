// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/token/ERC20/ERC20.sol";
import "@openzeppelin/contracts/token/ERC20/utils/SafeERC20.sol";
import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/token/ERC20/extensions/ERC20Permit.sol";
import {ECDSA} from "@openzeppelin/contracts/utils/cryptography/ECDSA.sol";



contract GaslessPaymaster is Ownable   {

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

    constructor(IERC20 _token) Ownable(msg.sender) {
        token = _token;
    }

    function transfer(PermitData calldata permitData, address from, address to) external {

        uint amount = permitData.value;

        ERC20Permit(address(token)).permit(
            from, 
            address(this),
            amount,
            permitData.deadline,
            permitData.v,
            permitData.r,
            permitData.s
        );

        token.safeTransferFrom(from, address(this), amount);
        token.safeTransfer(to, amount);

        uint gasUsed = tx.gasprice;
        payable(msg.sender).call{value: gasUsed};

    }


}
