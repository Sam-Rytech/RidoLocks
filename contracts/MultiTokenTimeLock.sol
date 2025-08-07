// SPDX-License-Identifier: MIT
pragma solidity ^0.8.19;

interface IERC20 {
    function transferFrom(address from, address to, uint amount) external returns (bool);
    function transfer(address to, uint amount) external returns (bool);
    function balanceOf(address account) external view returns (uint256);
}

contract MultiTokenTimeLock {
    struct Lock {
        address token;
        uint256 amount;
        uint256 unlockTime;
        bool withdrawn;
    }

    mapping(address => Lock[]) public userLocks;

    event Locked(address indexed user, address indexed token, uint256 amount, uint256 unlockTime, uint256 lockId);
    event Withdrawn(address indexed user, uint256 lockId);

    function lock(address _token, uint256 _amount, uint256 _unlockTime) external {
        require(_unlockTime > block.timestamp, "Unlock time must be in the future");

        IERC20(_token).transferFrom(msg.sender, address(this), _amount);

        userLocks[msg.sender].push(Lock({
            token: _token,
            amount: _amount,
            unlockTime: _unlockTime,
            withdrawn: false
        }));

        emit Locked(msg.sender, _token, _amount, _unlockTime, userLocks[msg.sender].length - 1);
    }

    function withdraw(uint256 _lockId) external {
        require(_lockId < userLocks[msg.sender].length, "Invalid lock ID");
        Lock storage userLock = userLocks[msg.sender][_lockId];

        require(!userLock.withdrawn, "Already withdrawn");
        require(block.timestamp >= userLock.unlockTime, "Still locked");

        userLock.withdrawn = true;

        IERC20(userLock.token).transfer(msg.sender, userLock.amount);

        emit Withdrawn(msg.sender, _lockId);
    }

    function getLocks(address _user) external view returns (Lock[] memory) {
        return userLocks[_user];
    }

    function totalLocks(address _user) external view returns (uint256) {
        return userLocks[_user].length;
    }
}
