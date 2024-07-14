# 🔗 Moria (Eth Global Brussels 2024)

![Capture d'écran 2024-07-13 211900](https://github.com/user-attachments/assets/56acd210-5ac3-49bc-bd05-9e741c8b7a20)

<h4 align="center">
  <a href="https://youtu.be/BQGGcMoV13M">Video Walkthrough</a>
</h4>

🧪A lending multi-chain platform which enables cross-chain interactions between Bitcoin, Ethereum, and Solana.

## The project

Moria is a multi-chain lending platform that enables seamless cross-chain interactions between Bitcoin (and its Layer 2 solutions), Ethereum (and EVM-compatible chains), and Solana. In an ecosystem where major blockchain projects often operate in isolation, Moria bridges these gaps by facilitating cross-chain lending and borrowing, providing users with increased flexibility and efficiency in managing their digital assets.

<a href="https://drive.google.com/file/d/1D_kV9JcdYQSKK245OdNLdXY7EX6UJ642/view?usp=sharing">Read the Lite Paper</a>

<a href="https://drive.google.com/file/d/1E4pFetLxwOFD_BSvlF-YNW9ErFtd9eWl/view?usp=sharing">See Slide Deck</a>

We created a Next.js application for the hackathon to easily create a frontend and call the different smart contracts through it. This allows us to connect to Neon EVM, Rootstock, or EVM smart contracts with ethers.

**Rootstock**: We integrated Rootstock to facilitate native exchanges between Bitcoin and Ethereum, allowing users to lend Bitcoin and obtain Ether seamlessly. Building on Rootstock was a smooth experience due to its robust documentation and active developer community, which provided valuable support and resources throughout the integration process. We created two ERC20 tokens: USDC and USDT, on Rootstock to facilitate our lending/borrowing platform.

**Neon EVM**: By leveraging Neon EVM, users can lend Solana tokens and lock them to then borrow on Ethereum or Bitcoin, thereby gaining exposure to Solana. We also created two ERC20 tokens on this chain: USDC and USDT. This allows us to interact with the smart contracts and use the different functions such as approve, deposit, borrow, withdraw, or repay.

**Blockscout**: By integrating Blockscout and its API, we can track the balance of the wallet through different chains in one time: EVM chains, Rootstock, and Neon EVM, as well as transactions and addresses in real-time. Blockscout is a full-featured, open-source block explorer that supports multiple chains. Applications can use Blockscout similarly to other explorers to track transactions, verify and interact with smart contracts, and connect with APIs to enable application functionality. Blockscout offers several APIs, including RPC endpoints, ETH RPC endpoints, and REST API endpoints. We also added a link to see the transactions on Blockscout when you approve, supply, or borrow, for example.

**Dynamic Wallet**: To provide users with a unified interface for managing wallets on Bitcoin, Ethereum, and Solana, enhancing the cross-chain experience. Dynamic allows us to connect all our wallets easily, so we can connect Metamask, Coinbase Wallet, or Phantom in one click.

## Instruction

_clear instructions for testing the integration._

## Team

**Maksym Andrushkiv**: Business Manager. Over 3 years of experience in crypto. Participated in over 10 hackathons. Contributed to marketing production for several startups, creating strategies for their projects.

**Charles-André Goichot**: Over 3 years of experience in development. Software Developer. Full Stack Developer. Participated in over 10 hackathons worldwide.

**Ewan Hamon**: Over 4 years of experience in development. Blockchain Developer. Junior Software Engineer. Specializes in Rust & Smart Contract development. Web3 & Blockchain development. Full Stack Web3 Developer. Participated in over 10 hackathons worldwide.

## Feedback and Support

We value your feedback and are committed to continuously improving our platform. If you encounter any issues or have suggestions for new features, please contact us on social media.

[Maksym](https://linktr.ee/maksym_andrushkiv)
[Charles-André](https://www.linkedin.com/in/charles-andr%C3%A9-goichot/)
[Ewan](https://www.linkedin.com/in/ewan-hamon/)
