# Auction Hardhat Project

This project demonstrates an Auction full life cycle with Product Token Mint, Auction and Bid. It's simple and on going but testable and created mainly for techniques improvements.

\*There is a contract running on Goerli already

## Choose the step:

- I am just checking out this contract integrating with nestJS/prisma backend api:

* Install dependencies and test. This contract is fully 100% tests covered.

```shell
npm install
npx hardhat test
npx hardhat coverage
```

## If you wanna run it from zero :

- just set up credentials using .env file and run:

```shell
npx hardhat run scripts/deploy.js
```

Once it is deployed, you can use the [Auction API project](https://github.com/ronylucca/auction-api) to integrates directly with this contract
