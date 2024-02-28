// SPDX-License-Identifier: MIT
pragma solidity 0.8.20;

import "@openzeppelin/contracts/token/ERC20/ERC20.sol";
import "@openzeppelin/contracts/token/ERC20/utils/SafeERC20.sol";
import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/token/ERC20/extensions/ERC20Permit.sol";
import {ECDSA} from "@openzeppelin/contracts/utils/cryptography/ECDSA.sol";
import {EIP712} from "@openzeppelin/contracts/utils/cryptography/EIP712.sol";
import "@openzeppelin/contracts/utils/ReentrancyGuard.sol";
import "@openzeppelin/contracts/token/ERC20/extensions/ERC4626.sol";
import '@uniswap/v3-periphery/contracts/interfaces/ISwapRouter.sol';
import "@chainlink/contracts/src/v0.8/interfaces/AggregatorV3Interface.sol";
import "./TokenVault.sol";
import "hardhat/console.sol";


contract GaslessPaymaster is TokenVault, Ownable, ReentrancyGuard, EIP712 {

    bytes32 private constant TRANSFER_PERMIT_TYPEHASH =
        keccak256("Permit(address to,uint256 amount,uint256 maxFee)");


    bytes32 private constant SWAP_PERMIT_TYPEHASH =
        keccak256("Permit(address to,uint256 amount,uint256 maxFee)");

    /**
     * @dev Mismatched signature.
     */
    error ERC2612InvalidSigner(address signer, address owner);


    error CallerNotPaidEnoughGas(uint gasRequired);
    error TransactionUnderPriced(uint gasCostInToken, uint maxFee);
    error BnbTransferFailed();
    error TransferFailed();


    event Transaction(address indexed sender, address indexed recipient, uint amount);
    event Fulfilled(address indexed caller, address indexed from, uint gasPrice, uint feeAmount, uint gasCostInTokens, uint feeAmountInTokens);

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
        uint256 amount;
        uint256 maxFee;
        uint8 v;
        bytes32 r;
        bytes32 s;
    }

    struct SwapData {
        bytes path;
        address recipient;
        uint256 deadline;
        uint256 amountIn;
        uint256 amountOutMinimum;
        uint256 maxFee;
        uint8 v;
        bytes32 r;
        bytes32 s;
    }

    enum TxType {
        TRANSFER,
        SWAP
    }

    IERC20 immutable public token;
    ISwapRouter immutable public router;
    AggregatorV3Interface public immutable bnbPriceFeeds;
    AggregatorV3Interface public immutable tokenPriceFeeds;


    // do constant offset for gas
    uint32 constant public GAS_USED_OFFSET = 900000;
    // fee for transaction caller
    uint public callerFeeAmountInEther = 1 gwei; 
    uint public poolFeeAmountInToken = 1000 gwei; 

    uint constant public DECIMAL = 1 ether;


    constructor(IERC20 _token, ISwapRouter _router, address _bnbPriceFeeds, address _tokenPriceFeeds) Ownable(msg.sender) TokenVault(_token) EIP712(string.concat("LGP-", ERC20(address(_token)).name()), "1") {
        
        token = _token;

        router = _router;

        bnbPriceFeeds = AggregatorV3Interface(_bnbPriceFeeds);

        tokenPriceFeeds = AggregatorV3Interface(_tokenPriceFeeds);
    
    }


    function transferGasless(ERC20PermitData calldata permitData, TransferData calldata transferData) external nonReentrant {

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

        bytes32 structHash = keccak256(abi.encode(TRANSFER_PERMIT_TYPEHASH, transferData.to, transferData.amount, transferData.maxFee));

        _verifySignature(from, structHash, transferData.v, transferData.r, transferData.s);

        token.safeTransferFrom(from, transferData.to, amount);

        _payFees(caller, from, transferData.maxFee, startingGas);

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
 
        _payFees(caller, from, swapData.maxFee, startingGas);

    }

    /**
     * Get token price quote e.g USDC/BNB or DAI/BNB
     * @dev no check for stall prices yet 
     */
    function getTokenQuote() public view returns (uint) {
        (, int256 bnbPrice,,,) = bnbPriceFeeds.latestRoundData();
        (, int256 tokenPrice,,,) = tokenPriceFeeds.latestRoundData();
        // multiply with decimal to prevent precision loss
        // return uint((tokenPrice * int(DECIMAL)) / bnbPrice);

        return uint((bnbPrice * int(DECIMAL)) / tokenPrice);
    }

    /**
     * Get token price quote e.g BNB/USDC or BNB/DAI
     * @dev no check for stall prices yet 
     */
    function getBnbQuote() public view returns (uint) {
        (, int256 bnbPrice,,,) = bnbPriceFeeds.latestRoundData();
        (, int256 tokenPrice,,,) = tokenPriceFeeds.latestRoundData();
        // multiply with decimal to prevent precision loss
        return uint((tokenPrice * int(DECIMAL)) / bnbPrice);
    }


    /**
     * 
     * @param txType type of transaction is it Transfer or Swap
     */
    function estimateFees(TxType txType, uint64 gasPrice) external view returns(uint) {


        if (txType == TxType.TRANSFER) {

            uint transactionCost = gasPrice * (GAS_USED_OFFSET * 2);

            return transactionCost * getTokenQuote() / DECIMAL;

        } else if (txType == TxType.SWAP) {

            uint transactionCost = gasPrice * (GAS_USED_OFFSET * 3);

            return transactionCost * getTokenQuote() / DECIMAL;
        }

        return type(uint).max;
       
    }


    function getFundShare(uint assets) view public returns (uint amountInTokens, uint amountInBnb) {

        // withdraw tokens first before bnb
        uint tokenBalance = token.balanceOf(address(this));

        uint tokenBalanceInBnb = (tokenBalance * getBnbQuote()) / DECIMAL;

        if (tokenBalanceInBnb > 0) {
            if (tokenBalanceInBnb >= assets) {
                amountInTokens = (assets * getTokenQuote()) / DECIMAL;
            } else {
                amountInTokens = (tokenBalanceInBnb * getTokenQuote()) / DECIMAL;
                amountInBnb = assets - tokenBalanceInBnb;
            }
        } else {
            amountInBnb = assets;
        }
    
    }


    function _payFees(address caller, address from, uint maxFee, uint startingGas) internal {

        uint gasPrice = tx.gasprice;

        console.log("Gas Price", tx.gasprice);

        uint transactionCost = gasPrice * (GAS_USED_OFFSET + startingGas - gasleft());

        console.log("Tx Cost", transactionCost);

        uint poolFee = poolFeeAmountInToken;

        uint callerFee = callerFeeAmountInEther;

        uint gasCostInToken = ((transactionCost + callerFee) * getTokenQuote()) / DECIMAL + poolFee;

        console.log("Gas Cost In Token", gasCostInToken);
        console.log("Max Fee  In Token", maxFee);


        uint refund = transactionCost + callerFee;

        // Refund the caller with the spend ether plus additional fee
        (bool success, ) = payable(caller).call{value: refund}("");

        if (!success) revert CallerNotPaidEnoughGas(refund);

        if (gasCostInToken > maxFee) revert TransactionUnderPriced(gasCostInToken, maxFee);

        ///@dev Transfer Everything to protocol
        token.safeTransferFrom(from, address(this), gasCostInToken);

        emit Fulfilled(caller, from, gasPrice, callerFee, gasCostInToken, poolFee);

    }


    function _verifySignature(address _owner, bytes32 structHash, uint8 v, bytes32 r, bytes32 s) internal view {
        
        bytes32 hash = _hashTypedDataV4(structHash);

        address signer = ECDSA.recover(hash, v, r, s);

        if (signer != _owner) {
            revert ERC2612InvalidSigner(signer, _owner);
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
            (bool success,) = payable(receiver).call{value: amountInBnb}("");
            if (!success) revert TransferFailed();
        }

        emit Withdraw(caller, receiver, owner, assets, shares);
    }


}
