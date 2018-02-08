pragma solidity ^0.4.18;

import "../validation/TimedCrowdsale.sol";
import "../../token/ERC20/ERC20.sol";

contract PostDeliveryCrowdsale is TimedCrowdsale {

  mapping(address => uint256) promises;

  function processPurchase(address _beneficiary, uint256 _tokenAmount) internal {
    promises[_beneficiary] = promises[_beneficiary].add(_tokenAmount);
  }

  function withdrawTokens() public {
    require(hasExpired());
    uint256 amount = promises[msg.sender];
    require(amount > 0);
    promises[msg.sender] = 0;
    _emitTokens(msg.sender, amount);
  }
}
