pragma solidity ^0.6.0;

import "../access/AccessControl.sol";

contract AccessControlMock is AccessControl {
    constructor() public {
        _setupRole(DEFAULT_ADMIN_ROLE, _msgSender());
    }

    function setRoleAdmin(bytes32 roleId, bytes32 adminRoleId) public {
        _setRoleAdmin(roleId, adminRoleId);
    }

    function setupRole(bytes32 roleId, address account) public {
        _setupRole(roleId, account);
    }
}
