pragma solidity ^0.5.0;

import "./Token.sol";
import "./ODToken.sol";

contract EthSwap {
    string public name = "EthSwap Instant Exchange";
    Token public token; //variable that represents token smart contract
    uint public rate = 100;

    event TokensPurchased(
        address account,
        address token,
        uint amount,
        uint rate
    );

     event TokensSold(
        address account,
        address token,
        uint amount,
        uint rate
    );

    constructor(Token _token) public {
        token = _token;
    }

    function buyTokens() public payable {
        //Calculate number of tokens
        uint tokenAmount = msg.value * rate; // how much ether was sent by sender

        //make sure exchange has tokens
        require(token.balanceOf(address(this)) >= tokenAmount);

        //Transfers tokens to users
        token.transfer(msg.sender, tokenAmount);

        //Emit event
        emit TokensPurchased(msg.sender, address(token), tokenAmount, rate);
    }

    function sellTokens(uint _amount) public {
        //User cant sell more than they have
        require(token.balanceOf(msg.sender) >= _amount);

        uint etherAmount = _amount / rate;

        //Require that ethswap has enough Ether
        require(address(this).balance >= etherAmount);

        //Perform sale, smart contract is spending tokens
        token.transferFrom(msg.sender, address(this), _amount);
        msg.sender.transfer(etherAmount);

        //Emit event
        emit TokensSold(msg.sender, address(token), _amount, rate);
    }
}