import { task } from 'hardhat/config'
import '@nomiclabs/hardhat-waffle'
import 'hardhat-typechain';

task('accounts', 'Prints the list of accounts', async (args, hre) => {
  const accounts = await hre.ethers.getSigners()
  for (const account of accounts) {
    console.log(await account.address)
  }
})
export default {
  solidity: {
    version: '0.8.6',
    settings: {
      optimizer: { enabled: true, runs: 200 },
      evmVersion: 'istanbul',
    },
  },
  networks: {
    hardhat: {
      forking: {
        url: "https://eth-mainnet.alchemyapi.io/v2/-FxRrLYCjHhIfwFJb0220jIuJyvrqi9Q", // Please input YOUR_ALCHEMY_API_KEY
      }
    }
  }
}
