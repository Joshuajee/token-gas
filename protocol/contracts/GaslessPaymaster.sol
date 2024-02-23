// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/token/ERC20/ERC20.sol";
import "@openzeppelin/contracts/token/ERC20/utils/SafeERC20.sol";
import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/token/ERC20/extensions/ERC20Permit.sol";
import {ECDSA} from "@openzeppelin/contracts/utils/cryptography/ECDSA.sol";
import {EIP712} from "@openzeppelin/contracts/utils/cryptography/EIP712.sol";
import {Nonces} from "@openzeppelin/contracts/utils/Nonces.sol";
import "@openzeppelin/contracts/utils/ReentrancyGuard.sol";
import "@openzeppelin/contracts/token/ERC20/extensions/ERC4626.sol";
import '@uniswap/v3-periphery/contracts/interfaces/ISwapRouter.sol';
import "@chainlink/contracts/src/v0.8/interfaces/AggregatorV3Interface.sol";
import "./TokenVault.sol";
import "hardhat/console.sol";


contract GaslessPaymaster is TokenVault, Ownable, ReentrancyGuard, EIP712, Nonces {

    bytes32 private constant TRANSFER_PERMIT_TYPEHASH =
        keccak256("Permit(address to,address refundAddress,uint256 amount,uint256 maxFee,uint256 nonce)");


    bytes32 private constant SWAP_PERMIT_TYPEHASH =
        keccak256("Permit(address to,address refundAddress,uint256 amount,uint256 maxFee,uint256 nonce)");

    /**
     * @dev Mismatched signature.
     */
    error ERC2612InvalidSigner(address signer, address owner);


    error CallerNotPaidEnoughGas(uint gasRequired);
    error TransactionUnderPriced(uint gasCostInToken, uint maxFee);
    error BnbTransferFailed();
    error TransferFailed();


    event Transaction(address indexed sender, address indexed recipient, uint amount);
    event Fulfilled(address indexed caller, address indexed from, address indexed refundAddress, uint gasPrice,  uint feeAmount, uint gasCostInTokens, uint feeAmountInTokens);

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
        uint256 amount;
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


    // do constant offset for gas
    uint32 constant public GAS_USED_OFFSET = 110000;
    // fee for transaction caller
    uint32 public callerFeeAmountInEther = 1000; 
    uint public poolFeeAmountInToken = 0.01 ether; 

    uint constant public DECIMAL = 1 ether;


    constructor(IERC20 _token, ISwapRouter _router, address _bnbPriceFeeds, address _tokenPriceFeeds) Ownable(msg.sender) TokenVault(_token) EIP712(string.concat("LGP-", ERC20(address(_token)).name()), "1") {
        
        token = _token;

        router = _router;

        bnbPriceFeeds = AggregatorV3Interface(_bnbPriceFeeds);

        tokenPriceFeeds = AggregatorV3Interface(_tokenPriceFeeds);
    
    }


    function transfer(ERC20PermitData calldata permitData, TransferData calldata transferData) external nonReentrant {

        uint256 startingGas = gasleft();

        uint amount = transferData.amount;

        address from = permitData.owner;

        address caller = msg.sender;

        //ERC20 Permit
        ERC20Permit(address(token)).permit(
            from, 
            address(this),
            permitData.value,
            permitData.deadline,
            permitData.v,
            permitData.r,
            permitData.s
        );

        bytes32 structHash = keccak256(abi.encode(TRANSFER_PERMIT_TYPEHASH, transferData.to, transferData.refundAddress, transferData.amount, transferData.maxFee, _useNonce(from)));

        _verifySignature(from, structHash, transferData.v, transferData.r, transferData.s);

        token.safeTransferFrom(from, transferData.to, amount);

        _payFees(caller, from, transferData.refundAddress, transferData.maxFee, startingGas);

        emit Transaction(from, transferData.to, amount);

    }

    function swapOnUNISWAP(ERC20PermitData calldata permitData, SwapData calldata swapData) external nonReentrant {

        uint256 startingGas = gasleft();

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
 
        _payFees(caller, from, swapData.refundAddress, swapData.maxFee, startingGas);

    }

    /**
     * Get token price quote e.g USDC/BNB or DAI/BNB
     * @dev no check for stall prices yet 
     */
    function getTokenQuote() public view returns (uint) {
        (, int256 bnbPrice,,,) = bnbPriceFeeds.latestRoundData();
        (, int256 tokenPrice,,,) = tokenPriceFeeds.latestRoundData();
        // multiply with decimal to prevent precision loss
        return uint(tokenPrice * int(DECIMAL) / bnbPrice);
    }

    /**
     * Get token price quote e.g BNB/USDC or BNB/DAI
     * @dev no check for stall prices yet 
     */
    function getBnbQuote() public view returns (uint) {
        (, int256 bnbPrice,,,) = bnbPriceFeeds.latestRoundData();
        (, int256 tokenPrice,,,) = tokenPriceFeeds.latestRoundData();
        // multiply with decimal to prevent precision loss
        return uint(bnbPrice * int(DECIMAL) / tokenPrice);
    }


    function _payFees(address caller, address from, address refundAddress, uint maxFee, uint startingGas) internal {

        uint gasPrice = tx.gasprice;

        uint transactionCost = tx.gasprice * (GAS_USED_OFFSET + startingGas - gasleft());

        uint gasCostInToken = transactionCost * getTokenQuote() / DECIMAL;

        uint callerFee = callerFeeAmountInEther;

        uint poolFee = poolFeeAmountInToken;

        uint refund = transactionCost + callerFeeAmountInEther;

        // Refund the caller with the spend ether plus additional fee
        (bool success, ) = payable(caller).call{value: refund}("");

        if (!success) revert CallerNotPaidEnoughGas(refund);


        if (gasCostInToken > maxFee) revert TransactionUnderPriced(gasCostInToken, maxFee);

        ///@dev Transfer Everything to protocol
        token.safeTransferFrom(from, address(this), maxFee);

        emit Fulfilled(caller, from, refundAddress, gasPrice, callerFee, gasCostInToken, poolFee);

    }


    function _verifySignature(address _owner, bytes32 structHash, uint8 v, bytes32 r, bytes32 s) internal view {
        
        bytes32 hash = _hashTypedDataV4(structHash);

        address signer = ECDSA.recover(hash, v, r, s);

        if (signer != _owner) {
            revert ERC2612InvalidSigner(signer, _owner);
        }

    }

    function getFundShare(uint assets) view public returns (uint amountInTokens, uint amountInBnb) {

        // withdraw tokens first before bnb
        uint tokenBalance = token.balanceOf(address(this));

        uint tokenBalanceInBnb = tokenBalance * getBnbQuote() / DECIMAL;

        if (tokenBalanceInBnb > 0) {
            if (tokenBalanceInBnb >= assets) {
                amountInTokens = assets * getTokenQuote() / DECIMAL;
            } else {
                amountInTokens = tokenBalanceInBnb * getTokenQuote() / DECIMAL;
                amountInBnb = assets - tokenBalanceInBnb;
            }
        } else {
            amountInBnb = assets;
        }
    
    }

    /**
     * Overrides display asset in the Underlying token
     * @dev
     */

    function totalAssets() public view override returns (uint256) {
        uint tokenBalance = token.balanceOf(address(this));
        uint bnbBalance = address(this).balance;
        return (tokenBalance * getBnbQuote() / DECIMAL) + bnbBalance;
    }


    /**
     * Overrides this function to work with native Tokens
     * @param caller msg.sender
     * @param receiver receipient
     * @param owner owner of the LP token
     * @param assets amount of assets to withdraw
     * @param shares amount of shares to burn
     */
    
    function _withdraw(address caller, address receiver, address owner, uint256 assets, uint256 shares) internal override {
        
        if (caller != owner) {
            _spendAllowance(owner, caller, shares);
        }

        _burn(owner, shares);

        (uint amountInTokens, uint amountInBnb) = getFundShare(assets);

        if (amountInTokens > 0) {
            token.safeTransfer(receiver, amountInTokens);
        }

        if (amountInBnb > 0) {
            (bool success,) = payable(receiver).call{value: amountInTokens}("");
            if (!success) revert TransferFailed();
        }

        emit Withdraw(caller, receiver, owner, assets, shares);
    }


}
