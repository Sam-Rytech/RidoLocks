# 🔒 TokenTimeLock dApp

A dApp to lock ERC20 tokens until a future date.

## Features
- Approve & Lock tokens until a specific time
- Support multiple locks per user
- Countdown timers and individual withdraw buttons
- Built with Next.js, Tailwind CSS, Ethers.js, Solidity

## Tech Stack
- Remix (Solidity deployment)
- Next.js 14 App Router
- Tailwind CSS
- Ethers.js

## Deploy Smart Contract
- Compile & deploy `MultiTokenTimeLock.sol` using [Remix](https://remix.ethereum.org)
- Copy deployed contract address and ABI into `utils/contract.ts`

## Run Frontend
```bash
npm install
npm run dev
