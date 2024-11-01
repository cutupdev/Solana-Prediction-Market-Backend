# JackpotSol 🎲 - Decentralized Lottery on Solana

JackpotSol is a decentralized lottery system built on the Solana blockchain. With a fully transparent and verifiable smart contract, JackpotSol allows users to participate in a fair and secure lottery. It’s optimized for minimal fees, fast transactions, and robust security, utilizing the high throughput and low latency of the Solana network.

---

## Table of Contents

- [Features](#features)
- [How It Works](#how-it-works)
- [Installation & Testing](#installation--testing)
- [Contributing](#contributing)

---

---

## Features

- **Decentralized Lottery**: Fully decentralized, fair lottery system on Solana.
- **Automatic Prize Distribution**: Smart contracts handle all prize distributions securely and efficiently.
- **Transparency & Security**: Every ticket purchase(NFT) and prize draw is recorded on the blockchain, ensuring fairness.
- **Configurable Draws**: The lottery administrator can set up lottery parameters, including draw intervals and ticket costs.

---

## How It Works

JackpotSol operates as a decentralized lottery pool where users purchase tickets, and a random winner is selected from the participants. Here’s how it all works:

1. **Ticket Purchase**: Users buy tickets for a chance to win the jackpot. The cost of each ticket is predefined by the lottery parameters.
2. **Prize Pool Accumulation**: Ticket sales automatically contribute to the prize pool.
3. **Random Winner Selection**: At the end of the lottery period, the smart contract randomly selects a winner.
4. **Prize Distribution**: The prize is transferred automatically to the winner's wallet.

---

### Prerequisites

- **Solana CLI**: Install the Solana CLI to interact with the network.
- **Anchor**: A framework for building and deploying Solana smart contracts.

### Steps

1. **Clone the repository**

   ```bash
   git clone https://github.com/yourusername/jackpotsol.git
   cd jackpotsol
   ```

2. \*\*Install dependencies

   ```bash
   anchor build
   ```

3. \*\*Run tests

   ```bash
   anchor test
   ```

4. \*\*Deploying
   ```bash
   solana config set --url devnet
   anchor deploy
   ```

## Contributing

We welcome contributions to improve JackpotSol. To contribute:

1. Fork the repository
2. Clone the forked repository
3. Create a new branch for your feature or bugfix
4. Commit and push your changes
5. Create a pull request to the main repository
