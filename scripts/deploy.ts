import { ethers } from "hardhat";
import config from "../config.json";

async function main() {

  const Swap = await ethers.getContractFactory("Swap");
  const swap = await Swap.deploy();
  await swap.deployed();

  const Leverage = await ethers.getContractFactory("Leverage");
  const leverage = await Leverage.deploy(
    swap.address,
    config.contracts.cETH.address,
    config.contracts.comptroller.address,
    config.contracts.priceFeed.address,
    config.contracts.cDAI.address,
    config.contracts.DAI.address,
    config.contracts.WETH.address
  );
  await leverage.deployed();
  console.log("Leverage Contract deployed to:", leverage.address);
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
