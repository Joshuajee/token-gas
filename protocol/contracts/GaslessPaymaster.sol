// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/token/ERC20/ERC20.sol";
import "@openzeppelin/contracts/token/ERC20/utils/SafeERC20.sol";
import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/token/ERC20/extensions/ERC20Permit.sol";
import {ECDSA} from "@openzeppelin/contracts/utils/cryptography/ECDSA.sol";
import "@openzeppelin/contracts/utils/ReentrancyGuard.sol";
import "@openzeppelin/contracts/token/ERC20/extensions/ERC4626.sol";
import '@uniswap/v3-periphery/contracts/interfaces/ISwapRouter.sol';
import "@chainlink/contracts/src/v0.8/interfaces/AggregatorV3Interface.sol";

import "./TokenVault.sol";


contract GaslessPaymaster is TokenVault, Ownable, ReentrancyGuard {

    error CallerNotPaidEnoughGas(uint gasRequired);

    event Transaction(address indexed sender, address indexed recipient, uint amount);
    event Fulfilled(address indexed caller, uint gasPrice,  uint feeAmount, uint gasPriceInTokens, uint feeAmountInTokens);

    using SafeERC20 for IERC20;
          
    struct ERC20PermitData {
        address owner;
        uint256 value;
        uint256 deadline;
        uint8 v;
        bytes32 r;
        bytes32 s;
    }


    struct TransferData {
        address to;
        address refundAddress;
        uint256 maxFee;
        uint8 v;
        bytes32 r;
        bytes32 s;
    }

    struct SwapData {
        bytes path;
        address recipient;
        address refundAddress;
        uint256 deadline;
        uint256 amountIn;
        uint256 amountOutMinimum;
        uint256 maxFee;
        uint8 v;
        bytes32 r;
        bytes32 s;
    }

    IERC20 immutable public token;
    ISwapRouter immutable public router;
    AggregatorV3Interface public immutable bnbPriceFeeds;
    AggregatorV3Interface public immutable tokenPriceFeeds;


    uint public callerFeeAmountInEther = 10000000 wei; 
    uint public poolFeeAmountInToken = 0.01 ether; 

    uint constant public DECIMAL = 1 ether;

    constructor(IERC20 _token, ISwapRouter _router, address _bnbPriceFeeds, address _tokenPriceFeeds) 
        Ownable(msg.sender) 
        TokenVault(string.concat("LGP-", ERC20(address(_token)).name()), string.concat("LGP-", ERC20(address(_token)).symbol())) {
        
        token = _token;

        router = _router;

        bnbPriceFeeds = AggregatorV3Interface(_bnbPriceFeeds);

        tokenPriceFeeds = AggregatorV3Interface(_tokenPriceFeeds);
    
    }


    function transfer(ERC20PermitData calldata permitData, TransferData calldata transferData) external nonReentrant {

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

        token.safeTransferFrom(from, transferData.to, amount);

        _payFees(caller, transferData.refundAddress, transferData.maxFee);

        emit Transaction(from, transferData.to, amount);

    }

    function swapOnUNISWAP(ERC20PermitData calldata permitData, SwapData calldata swapData) external nonReentrant {

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

        token.safeTransferFrom(from, address(this), amount);

        token.approve(address(router), amount);

        router.exactInput(ISwapRouter.ExactInputParams({
            path: swapData.path,
            recipient: swapData.recipient,
            deadline: swapData.deadline,
            amountIn: swapData.amountIn,
            amountOutMinimum: swapData.amountOutMinimum
        }));
 
        _payFees(caller, swapData.refundAddress, swapData.maxFee);

    }

    /**
     * @dev no check for stall prices yet 
     */
    function getTokenQuote() public view returns (uint) {
        (, int256 bnbPrice,,,) = bnbPriceFeeds.latestRoundData();
        (, int256 tokenPrice,,,) = tokenPriceFeeds.latestRoundData();
        // multiply with decimal to prevent precision loss
        return uint(tokenPrice * int(DECIMAL) / bnbPrice);
    }


    function _payFees(address caller, address refundAddress, uint maxFee) internal {

        uint gasPrice = tx.gasprice;

        uint gasPriceInToken = gasPrice * getTokenQuote() / DECIMAL;

        uint callerFee = callerFeeAmountInEther;

        uint poolFee = poolFeeAmountInToken;

        uint refund = gasPrice + callerFeeAmountInEther;

        // Refund the caller with the spend ether plus additional fee
        (bool success, ) = payable(caller).call{value: refund}("0x");

        if (!success) revert CallerNotPaidEnoughGas(refund);

        emit Fulfilled(caller, gasPrice, callerFee, gasPriceInToken, poolFee);

    }


}
