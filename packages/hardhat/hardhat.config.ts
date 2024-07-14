require("@nomiclabs/hardhat-ethers");
require("@nomicfoundation/hardhat-verify");
require("dotenv").config();
require("@typescript-eslint/no-var-requires");

module.exports = {
  solidity: "0.8.20",
  etherscan: {
    apiKey: {
      neonevm: "test",
      arbitrumSepolia: "QMK9DCXK1TM3BRMJBJBSM9JHNUZVUT8Q2M",
    },
    customChains: [
      {
        network: "neonevm",
        chainId: 245022926,
        urls: {
          apiURL: "https://devnet-api.neonscan.org/hardhat/verify",
          browserURL: "https://devnet.neonscan.org",
        },
      },
      {
        network: "neonevm",
        chainId: 245022934,
        urls: {
          apiURL: "https://api.neonscan.org/hardhat/verify",
          browserURL: "https://neonscan.org",
        },
      },
    ],
  },
  networks: {
    neondevnet: {
      url: "https://devnet.neonevm.org",
      accounts: [process.env.PRIVATE_KEY],
      chainId: 245022926,
      allowUnlimitedContractSize: false,
      gas: "auto",
      gasPrice: "auto",
    },
    sepolia: {
      url: "https://sepolia.infura.io/v3/21d658c695324ea4a9005dfa835ba7fc",
      chainId: 11155111,
      accounts: [process.env.PRIVATE_KEY],
    },
    arbitrumSepolia: {
      url: `https://arbitrum-sepolia.infura.io/v3/21d658c695324ea4a9005dfa835ba7fc`,
      chainId: 421614,
      accounts: [process.env.PRIVATE_KEY],
    },
    rskTestnet: {
      url: "https://rpc.testnet.rootstock.io/sJNoNnADg2VjGzJZ3dYKaHWbLKr4gs-T",
      chainId: 31,
      gasPrice: 60000000,
      accounts: [process.env.PRIVATE_KEY],
    },
  },
};
