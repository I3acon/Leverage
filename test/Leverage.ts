import console from "console";
import { ethers } from "hardhat";
import cETH_ABI from "../constants/cETH.json";
import ERC20_ABI from "../constants/ERC20.json";
import Leverage_ABI from "../artifacts/contracts/Leverage.sol/Leverage.json";
import Chainlink_ABI from "../constants/AggregatorV3Interface.json";
import config from "../config.json";

//Init Provider
const provider = new ethers.providers.JsonRpcProvider(config.rpc.url);

//Init Account
const wallet = new ethers.Wallet(config.account.privatekey, provider);
const walletAddress = wallet.address;

// Init Contract
const LeverageContract = new ethers.Contract(
  config.contracts.leverage.address,
  Leverage_ABI.abi,
  wallet
);
const cETHContract = new ethers.Contract(
  config.contracts.cETH.address,
  cETH_ABI,
  wallet
);
const ChainlinkContract = new ethers.Contract(
  config.contracts.chainlink.address,
  Chainlink_ABI,
  provider
);
const DAIContract = new ethers.Contract(
  config.contracts.DAI.address,
  ERC20_ABI,
  wallet
);
const WETHContract = new ethers.Contract(
  config.contracts.WETH.address,
  ERC20_ABI,
  wallet
);

const balance = async () => {
  const ETHBalance = +(await provider.getBalance(walletAddress)) / 1e18;
  const DaiBalance =
    await DAIContract.callStatic.balanceOf(
      config.contracts.leverage.address
    ) / 1e18;
  const cEthBalance =
  await cETHContract.callStatic.balanceOf(
      config.contracts.leverage.address
    ) / 1e8;
  const balanceOfUnderlying =
    await cETHContract.callStatic.balanceOfUnderlying(
      config.contracts.leverage.address
    ) / 1e18;
  const WETHBalance =
    await WETHContract.balanceOf(config.contracts.leverage.address) / 1e18;
  const ETHContract =
    +await provider.getBalance(config.contracts.leverage.address) / 1e18;

  console.log("ETH in Contract:", ETHContract);
  console.log("ETH Balance in user wallet :", ETHBalance);
  console.log("DAI Balance :", DaiBalance);
  console.log("cETH balance :", cEthBalance);
  console.log("ETH supplied to the Compound Protocol:", balanceOfUnderlying);
  console.log("Contract WETH Balance:", WETHBalance);
};

describe("Borrow DAI From Compound", function () {
  it("Should Borrow DAI from Compound", async function () {
    const amount = ethers.utils.parseUnits("1", "ether");
    console.log("\nBalance before Borrow");
    await balance();
    const Tx = await LeverageContract.borrowDAIFromCompound(amount, {
      value: ethers.utils.parseUnits("1", "ether"),
    });
    await Tx.wait(1);
    console.log("\nBalance after Borrow");
    await balance();
  });
});

describe("Swap DAI", function () {
  it("Should Swap DAI To ETH from Uniswap", async function () {
    console.log("Balance before Swap");
    await balance();
    const Tx = await LeverageContract.swapDAI();
    await Tx.wait(1);
    console.log("\nBalance after Swap");
    await balance();

    const AfterSwapWETHBalance =
      await WETHContract.callStatic.balanceOf(
        config.contracts.leverage.address
      ) / 1e18;
    const borrow = await LeverageContract.returnBorrowBalance({
      from: walletAddress,
    });
    console.log("\nSwap %s DAI for %s WETH", borrow, AfterSwapWETHBalance);

    //Price Feed from chainlink
    const roundData = await ChainlinkContract.latestRoundData();
    const decimals = await ChainlinkContract.decimals();
    const price = 1 / (roundData.answer.toString() / Math.pow(10, decimals));
    console.log("ETH Price:", price);

    const balanceOfUnderlying =
      (await cETHContract.callStatic.balanceOfUnderlying(
        config.contracts.leverage.address
      )) / 1e18;
    const TotalETH = balanceOfUnderlying + AfterSwapWETHBalance;
    console.log("Total ETH =", TotalETH);

    const TotalBorrow = await LeverageContract.returnBorrowBalance({
      from: walletAddress,
    });
    const pnl = TotalBorrow - AfterSwapWETHBalance * price;
    console.log("PNL: %s DAI", pnl);
  });
});

describe("Swap ETH back", function () {
  it("Should Swap ETH To DAI from Uniswap", async function () {
    console.log("Balance before Swap");
    await balance();
    const Tx = await LeverageContract.swapETH();
    await Tx.wait(1);
    console.log("\nBalance after Swap");
    await balance();
  });
});

describe("Repay DAI To From Compound", function () {
  it("Should Repay DAI from Compound and Repay Borrow", async function () {
    console.log("Balance before Repay");
    await balance();
    const swapbalance =await LeverageContract.returnSwapDAI({ from: walletAddress }) / 1e18;
    console.log("\nSwap balance:", swapbalance);
    const Tx = await LeverageContract.daiRepayBorrow();
    await Tx.wait(1);
    console.log("\nBalance after pay");
    await balance();

  });
});

describe("Repay Debt", function () {
  it("Should repay remaining debt", async function () {
    console.log("\nBalance before pay debt");
    await balance();
    const Tx = await LeverageContract.daiRepayDebt();
    await Tx.wait(1);
    console.log("\nBalance after pay debt");
    await balance();
  });
});

describe("Withdraw ETH to user", function () {
  it("Should withdraw ETH from contract to user", async function () {
    console.log("\nBalance before return ETH");
    await balance();
    const Tx = await LeverageContract.withdrawETH();
    await Tx.wait(1);
    console.log("\nBalance after return ETH");
    await balance();
  });
});

