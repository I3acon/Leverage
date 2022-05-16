//SPDX-License-Identifier: Unlicense
pragma solidity ^0.8.6;
import "./Swap.sol";

import "hardhat/console.sol";

interface CEth {
    function mint() external payable;

    function exchangeRateCurrent() external returns (uint256);

    function supplyRatePerBlock() external returns (uint256);

    function redeem(uint256) external returns (uint256);

    function redeemUnderlying(uint256) external returns (uint256);
}

interface Comptroller {
    function markets(address) external returns (bool, uint256);

    function enterMarkets(address[] calldata)
        external
        returns (uint256[] memory);

    function getAccountLiquidity(address)
        external
        view
        returns (
            uint256,
            uint256,
            uint256
        );
}

interface PriceFeed {
    function getUnderlyingPrice(address cToken) external view returns (uint256);
}

interface Erc20 {
    function approve(address, uint256) external returns (bool);

    function transfer(address, uint256) external returns (bool);
}

interface CErc20 {
    function mint(uint256) external returns (uint256);

    function borrow(uint256) external returns (uint256);

    function borrowRatePerBlock() external view returns (uint256);

    function borrowBalanceCurrent(address) external returns (uint256);

    function repayBorrow(uint256) external returns (uint256);
}

interface WEth {
    function deposit() external payable;

    function withdraw(uint256) external;

    function approve(address, uint256) external returns (bool);
}

contract Leverage {
    address public swapAddress;
    address public cETHAddress;
    address public daiAddress;
    address public cDAIAddress;

    CEth public cETH;
    Comptroller public comptroller;
    PriceFeed public priceFeed;
    CErc20 public cDAI;
    Erc20 public dai;
    WEth public WETH;
    Swap public swapContract;

    mapping(address => uint256) public borrowBalance;
    mapping(address => uint256) public swapBalance;
    mapping(address => uint256) public mintBalance;
    mapping(address => uint256) public daiSwapBalance;
    mapping(address => uint256) public remainDebt;
    mapping(address => uint256) public remainETH;

    event Log(string, uint256);

    constructor(
        address _swap,
        address payable _cEtherAddress,
        address _comptrollerAddress,
        address _priceFeedAddress,
        address _cDAIAddress,
        address _dai,
        address _weth
    ) {
        swapContract = Swap(_swap);
        cETH = CEth(_cEtherAddress);
        comptroller = Comptroller(_comptrollerAddress);
        cDAI = CErc20(_cDAIAddress);
        priceFeed = PriceFeed(_priceFeedAddress);
        dai = Erc20(_dai);
        WETH = WEth(_weth);

        swapAddress = _swap;
        cETHAddress = _cEtherAddress;
        cDAIAddress = _cDAIAddress;
    }

    function borrowDAIFromCompound(uint256 _amount)
        public
        payable
        returns (uint256)
    {
        require(_amount == msg.value);
        require(
            mintBalance[msg.sender] == 0,
            "Must close position to make Leverage"
        );
        mintBalance[msg.sender] = _amount;

        // mint cETH
        cETH.mint{value: msg.value, gas: 250000}();

        //Enter market
        address[] memory cTokens = new address[](1);
        cTokens[0] = cETHAddress;
        uint256[] memory errors = comptroller.enterMarkets(cTokens);
        if (errors[0] != 0) {
            revert("Comptroller.enterMarkets failed.");
        }

        // Get my account's total liquidity value in Compound
        (uint256 error, uint256 liquidity, uint256 shortfall) = comptroller
            .getAccountLiquidity(address(this));
        if (error != 0) {
            revert("getAccountLiquidity failed.");
        }
        require(shortfall == 0, "account underwater");
        require(liquidity > 0, "account has excess collateral");

        uint256 underlyingPrice = priceFeed.getUnderlyingPrice(cDAIAddress);
        uint256 maxBorrowUnderlying = liquidity / underlyingPrice;

        // Borrow underlying (Borrow 30%)
        uint256 numUnderlyingToBorrow = (maxBorrowUnderlying * 375) / 1000;
        borrowBalance[msg.sender] = numUnderlyingToBorrow;

        // Borrow, check the underlying balance for this contract's address
        cDAI.borrow(numUnderlyingToBorrow * 10**18);

        // Get the borrow balance
        uint256 borrows = cDAI.borrowBalanceCurrent(address(this));

        return borrows;
    }

    function swapDAI() public payable {
        uint256 balance = borrowBalance[msg.sender] * 1e18;
        dai.approve(swapAddress, balance);
        uint256 ethBalance = swapContract.swapDAIToETH(balance);
        swapBalance[msg.sender] = ethBalance;
    }

    function deposit(uint256 _amount) public payable {
        borrowDAIFromCompound(_amount);
        swapDAI();
    }

    function swapETH() public payable {
        uint256 balance = swapBalance[msg.sender];
        WETH.approve(swapAddress, balance);
        uint256 daiBalance = swapContract.swapETHToDAI(balance);
        console.log(daiBalance);
        daiSwapBalance[msg.sender] = daiBalance;
    }

    function daiRepayBorrow() public returns (bool) {
        uint256 borrow = borrowBalance[msg.sender] * 1e18;
        uint256 repay = daiSwapBalance[msg.sender];
        uint256 error;

        if (repay < borrow) {
            dai.approve(cDAIAddress, repay); //cDAI
            error = cDAI.repayBorrow(repay);
            uint256 redeem = mintBalance[msg.sender] / 2;
            uint256 debt = borrow - repay;
            redeemCEth(redeem);
            WETH.deposit{value: redeem}();
            WETH.approve(swapAddress, redeem);
            uint256 amount = swapContract.swapExactOutputSingle(debt, redeem);
            remainDebt[msg.sender] = debt;
            WETH.withdraw(amount);
            remainETH[msg.sender] = amount;
        } else {
            dai.approve(cDAIAddress, borrow); //cDAI
            error = cDAI.repayBorrow(borrow);
            uint256 redeem = (mintBalance[msg.sender] * 999) / 1000;
            redeemCEth(redeem);
            remainETH[msg.sender] = redeem;
        }
        require(error == 0, "CErc20.repayBorrow Error");
        return true;
    }

    function daiRepayDebt() public returns (bool) {
        uint256 repay = remainDebt[msg.sender];
        uint256 redeem = (mintBalance[msg.sender] * 499) / 1000;
        //approve dai spending
        dai.approve(cDAIAddress, repay); //cDAI

        uint256 error = cDAI.repayBorrow(repay);
        redeemCEth(redeem);
        remainETH[msg.sender] += redeem;
        require(error == 0, "CErc20.repayBorrow Error");
        return true;
    }

    function withdrawETH() public payable {
        payable(msg.sender).transfer(remainETH[msg.sender]);
        mintBalance[msg.sender] = 0;
        borrowBalance[msg.sender] = 0;
        swapBalance[msg.sender] = 0;
        daiSwapBalance[msg.sender] = 0;
        remainDebt[msg.sender] = 0;
        remainETH[msg.sender] = 0;
    }

    function redeemCEth(uint256 amount) public returns (uint256) {
        uint256 redeemResult;

        redeemResult = cETH.redeemUnderlying(amount);

        emit Log("If this is not 0, there was an error", redeemResult);

        return redeemResult;
    }

    function closePosition() public payable {
        swapETH();
        returnBorrowBalance();
        daiRepayBorrow();
        if (borrowBalance[msg.sender] * 1e18 < daiSwapBalance[msg.sender]) {
            daiRepayDebt();
        }
        withdrawETH();
    }

    function returnBorrowBalance() public view returns (uint256) {
        return borrowBalance[msg.sender];
    }

    function returnMintBalance() public view returns (uint256) {
        return mintBalance[msg.sender];
    }

    function returnSwapBalance() public view returns (uint256) {
        return swapBalance[msg.sender];
    }

    function returnBorrow() public returns (uint256) {
        return cDAI.borrowBalanceCurrent(address(this));
    }

    function returnSwapDAI() public view returns (uint256) {
        return daiSwapBalance[msg.sender];
    }

    receive() external payable {}
}
