// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import "@openzeppelin/contracts/token/ERC20/extensions/ERC20Burnable.sol";
import "@openzeppelin/contracts/token/ERC20/ERC20.sol";
import "@openzeppelin/contracts/access/Ownable.sol";

contract LendingBorrowing is Ownable {
    IERC20 public depositToken;
    IERC20 public borrowToken;
    uint256 public allowance;
    PositionToken public supplyPositionToken;
    PositionToken public borrowPositionToken;

    uint256 public constant COLLATERAL_FACTOR = 75; // 75%
    uint256 public constant INTEREST_RATE = 5; // 5% annual interest rate

    struct BorrowInfo {
        uint256 amount;
        uint256 interestAccrued;
        uint256 borrowTimestamp;
    }

    mapping(address => uint256) public deposits;
    mapping(address => BorrowInfo) public borrows;

    event Deposit(address indexed user, uint256 amount);
    event Borrow(address indexed user, uint256 amount);
    event Repay(address indexed user, uint256 amount);
    event Withdraw(address indexed user, uint256 amount);
    event Approval(address indexed owner, address indexed spender, uint256 value);

    constructor() Ownable(msg.sender) {
        supplyPositionToken = new PositionToken("Supply Position Token", "SPST");
        borrowPositionToken = new PositionToken("Borrow Position Token", "BPST");
    }

    function deposit(uint256 _amount, address _depositTokenAddress) external {
        require(_amount > 0, "Amount must be greater than zero");
        IERC20(_depositTokenAddress).transferFrom(msg.sender, address(this), _amount);
        deposits[msg.sender] = deposits[msg.sender] + _amount;

        // Mint position tokens
        supplyPositionToken.mint(msg.sender, _amount);

        emit Deposit(msg.sender, _amount);
    }

    function borrow(uint256 _amount, address _borrowTokenAddress, uint256 depositedOnOtherChains) external {
        uint256 depositedAmount = deposits[msg.sender] + depositedOnOtherChains;
        BorrowInfo storage borrowInfo = borrows[msg.sender];
        uint256 availableToBorrow = ((depositedAmount * COLLATERAL_FACTOR) /
            100) - borrowInfo.amount;

        require(_amount <= availableToBorrow, "Amount exceeds borrowing limit");
        borrowInfo.amount = borrowInfo.amount + _amount;
        borrowInfo.borrowTimestamp = block.timestamp;
        borrowPositionToken.mint(msg.sender, _amount);
        IERC20(_borrowTokenAddress).transfer(msg.sender, _amount);

        emit Borrow(msg.sender, _amount);
    }

    function repay(uint256 _amount, address _depositTokenAddress, address _borrowTokenAddress) external {
        require(_amount > 0, "Amount must be greater than zero");

        BorrowInfo storage borrowInfo = borrows[msg.sender];
        uint256 interest = calculateInterest(msg.sender);
        uint256 totalDebt = borrowInfo.amount + interest;

        require(_amount <= totalDebt, "Amount exceeds total debt");
        IERC20(_borrowTokenAddress).transferFrom(msg.sender, address(this), _amount);

        if (_amount >= interest) {
            _amount -= interest;
            borrowInfo.interestAccrued = 0;
            borrowInfo.amount -= _amount;
        } else {
            borrowInfo.interestAccrued = interest - _amount;
        }

        // Distribute interest to depositors
        uint256 interestToDistribute = interest;
        IERC20(_depositTokenAddress).transferFrom(address(this), msg.sender, interestToDistribute);

        emit Repay(msg.sender, _amount);
    }

    function withdraw(uint256 _amount, address _depositTokenAddress) external {
        uint256 depositedAmount = deposits[msg.sender];
        BorrowInfo storage borrowInfo = borrows[msg.sender];
        uint256 collateralRequired = ((borrowInfo.amount * 100) / COLLATERAL_FACTOR);
        uint256 availableToWithdraw = depositedAmount - collateralRequired;

        require(
            _amount <= availableToWithdraw,
            "Amount exceeds available withdrawal limit"
        );

        deposits[msg.sender] = deposits[msg.sender] - _amount;
        IERC20(_depositTokenAddress).transfer(msg.sender, _amount);

        // Burn position tokens
        supplyPositionToken.burnFrom(msg.sender, _amount);
        borrowPositionToken.burnFrom(msg.sender, _amount);
        emit Withdraw(msg.sender, _amount);
    }

    function calculateInterest(address _user) public view returns (uint256) {
        BorrowInfo storage borrowInfo = borrows[_user];
        uint256 timeElapsed = block.timestamp - borrowInfo.borrowTimestamp;
        uint256 interest = (borrowInfo.amount * INTEREST_RATE * timeElapsed) / (100 * 365 * 24 * 60 * 60);
        return interest + borrowInfo.interestAccrued;
    }
}

contract PositionToken is ERC20Burnable, Ownable {
    constructor(
        string memory name,
        string memory symbol
    ) ERC20(name, symbol) Ownable(msg.sender) {}

    function mint(address to, uint256 amount) public onlyOwner {
        _mint(to, amount);
    }
}
