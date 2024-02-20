// SPDX-License-Identifier: UNLICENSED
pragma solidity ^0.8.9;
import "@openzeppelin/contracts/access/Ownable.sol";
import {IPaymaster} from "@account-abstraction/contracts/interfaces/IPaymaster.sol";
// Uncomment this line to use console.log
import "hardhat/console.sol";

contract AdsPaymaster is Ownable, IPaymaster {

    error ZeroValueError();
    error CallerNotExecutor();
    error GasPriceExceededMaxPayPerView(uint _price, uint _maxPayPerView);

    struct Campaign {
        address sponsor;
        uint maxPayPerView;
        uint balance;
    }

    event AddExecutor(address indexed _executor);
    event RemoveExecutor(address indexed _executor);
    event CreateAdCampaign(address indexed _sponsor, uint indexed _campaignId, uint _balance, uint _maxPayPerView);
    event ExecuteOrder(uint indexed _campaignId, uint _fee, uint _balance);

    uint public campaignId = 1;
    mapping(address => bool) public executor;
    mapping(uint => Campaign) public campaigns;


    uint16 public constant PERCENT = 10000;
    uint16 public feePercent = 1; // 1 / 10000
    
    constructor() Ownable(msg.sender) {}

    function createCampaign(address _sponsor, uint _maxPayPerView) external payable {
        uint _campaignId = campaignId++;
        uint value = msg.value;
        if (value == 0) revert ZeroValueError();
        campaigns[_campaignId] = Campaign({
            sponsor: _sponsor,
            maxPayPerView: _maxPayPerView,
            balance: value
        });
        emit CreateAdCampaign(_sponsor, _campaignId, value, _maxPayPerView);
    }

    function executeOrder(uint _campaignId, address _destination, bytes calldata data) external onlyExecutor {
        
        Campaign storage _campaign = campaigns[_campaignId];

        uint gasPrice = tx.gasprice;

        uint payment = gasPrice * feePercent / PERCENT;

        _campaign.balance -= payment;
        
        if (gasPrice > _campaign.maxPayPerView) revert GasPriceExceededMaxPayPerView(gasPrice, _campaign.maxPayPerView);
        

        (bool success, bytes memory _data) =  _destination.delegatecall(data);

        console.log(success);

        console.logBytes(_data);

        // assembly {
        //     CALLCODE();
        // }

        //console.log(abi.decode(_data, (address)));

        //if (!success) revert("RRRR");

        payable(msg.sender).call{value: payment};

        emit ExecuteOrder(_campaignId, payment, _campaign.balance);

    }


    function encodeWithSignature(
        address to,
        uint amount
    ) external pure returns (bytes memory) {
        // Typo is not checked - "transfer(address, uint)"
        return abi.encodeWithSignature("transfer(address,uint256)", to, amount);
    }


    function addExecutor(address _executor) external onlyOwner {
        executor[_executor] = true;
        emit AddExecutor(_executor);
    }

    function removeExecutor(address _executor) external onlyOwner {
        delete executor[_executor];
        emit RemoveExecutor(_executor);
    }

    modifier onlyExecutor() {
        if (!executor[msg.sender]) revert CallerNotExecutor();
        _;
    }

    fallback() external {
        console.log("NP");
    }

    receive() payable external {}


}
