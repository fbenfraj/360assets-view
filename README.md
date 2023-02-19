# Multis coding challenge

<p align="center">
  <a href="https://multis.com/" target="blank"><img src="https://img.api.cryptorank.io/coins/150x150.multis1668674551900.png" width="120" alt="Nest Logo" /></a>
  <a href="http://nestjs.com/" target="blank"><img src="https://nestjs.com/img/logo-small.svg" width="120" alt="Nest Logo" /></a>
</p>

## Context

We want to allow users to have a 360 view of their assets on several blockchains and financial institutions.

## Tech stack

- NestJS (backend framework)
- NodeJS (Typescript)
- Jest (testing)
- Web3js (blockchain interactions)
- Coingecko API (USD Pricing)

## Problem

As a user, I want a list of all ERC-20 tokens and their balances with their equivalent in USD of a given address in Ethereum mainnet, Polygon, or Arbitrum.

## Requirements

**Endpoint:** `GET http://localhost:8080/balances/{network}/{address}`

**Response:**

```ts
[
  {
    "address": "0x6b175474e89094c44da98b954eedeac495271d0f",
    "name": "DAI Stablecoin",
    "symbol": "DAI",
    "decimals": 18,
    "balance": "1234990000000000000000",
    "balanceUsd": 1234.99
  },
  ...
]
```

## Solutions

To solve the problem of retrieving a list of all ERC-20 tokens and their balances with their equivalent in USD of a given address in Ethereum mainnet, Polygon, or Arbitrum, I have developed a NodeJS (TypeScript) application using the web3 stack and third-party APIs.

The main technical choices I have made for this application are:

I used the NestJS framework to develop this application as it allowed me to create a scalable and maintainable API.
I used the web3.js library to interact with the Ethereum, Polygon, and Arbitrum blockchains to retrieve the balances of ERC-20 tokens.
I used the Coingecko API to fetch the USD price of tokens and calculate their balance in USD.

I implemented caching using the CacheManager library to avoid exceeding the rate limits of the Coingecko API and blockchain network calls through Infura to improve the performance of the application.
To optimize the process and avoid having to check if every token of the blockchain is in the wallet, I chose a "Metamask-like" approach where the user can add his networks and the tokens he wants to check in the target wallet. This means that we only need to check for the specified tokens in the provided networks.
I added validation and error handling to ensure that the application is robust and can handle errors gracefully.

I believe that the technical choices I have made for this application strike a good balance between simplicity, efficiency, and maintainability. I hope this application meets the requirements and expectations of Multis and showcases my skills and knowledge of the web3 stack.

## Configuration

- Create a `.env` at the root of the folder and enter the following variables:

```bash
ETH_RPC_ENDPOINT=
POLY_RPC_ENDPOINT=
ARB_RPC_ENDPOINT=
```

- Enter the addresses of the tokens you want to add in the `addedTokens` field of the corresponding network in the `WEB3_CONFIG` variable (`/config/web3.config.ts`).
  The supported networks are Ethereum Mainnet, Polygon and Arbitrum.
- If you want to add a new network and new token addresses, you can also add it in the same `WEB3_CONFIG` variable in this form:

```ts
const WEB3_CONFIG: Web3Config = {
  ...
  network_name: {
    rpcEndpoint: 'https://rpc_url',
    tokenListSource: 'https://token_list_url',
    addedTokens: ['0x000', '0x001', ...],
  },
};
```

## Installation

```bash
$ npm install
```

## Running the app

```bash
# development
$ npm run start

# watch mode
$ npm run start:dev

# production mode
$ npm run start:prod
```

## Test

```bash
# e2e tests
$ npm run test:e2e

# unit tests
$ npm run test
```

## Stay in touch

- Author - [Ben Fraj Farouk](https://www.linkedin.com/in/farouk-benfraj/)
- Twitter - [@f_benfraj](https://twitter.com/f_benfraj)
