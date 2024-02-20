// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/token/ERC20/ERC20.sol";
import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/token/ERC20/extensions/ERC20Permit.sol";


contract GaslessPaymaster   {
          
    struct PermitData {
        address owner;
        uint256 value;
        uint256 deadline;
        uint8 v;
        bytes32 r;
        bytes32 s;
    }

    function transfer(PermitData calldata permitData, address token, address from, address to) external {

        uint amount = permitData.value;

        ERC20Permit(token).permit(
            from, 
            address(this),
            amount,
            permitData.deadline,
            permitData.v,
            permitData.r,
            permitData.s
        );

        IERC20(token).transferFrom(from, address(this), amount);
        IERC20(token).transfer(to, amount);

        uint gasUsed = tx.gas;
        payable(msg.sender).call{value: gasUsed};

    }


}
