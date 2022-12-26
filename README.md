<p align="center">
  <img src="https://assets-global.website-files.com/60118ca1c2eab61d24bcf151/6329c748f1e3f02c29c9a2a8_BP%20-%20NA%2BSM%20-%201R%20-%20Full%20(2).png" width="400" alt="Auction Logo" /></a>
</p>

# Auction Hardhat Project Solidity

This project is an Auction smart contract with full life cycle, NFT Token Mint, Auction and Bid.
It's simple and on going but testable and created mainly for techniques improvements.

- There is a contract running on Goerli already

## Choose the step:

### I am just checking out this contract integrating with nestJS/prisma backend api:

Install dependencies and test. This contract is fully 100% tests covered.

```shell
npm install
npx hardhat test
npx hardhat coverage
```

### If you wanna run it from zero :

- just set up credentials using .env file and run:

```shell
npx hardhat run scripts/deploy.js --network goerli
```

Once it is deployed, you can use the [Auction API project](https://github.com/ronylucca/auction-api) to integrates directly with this contract
`Use the smart contract owner credentials private key on backend project as well to have the owner access of this contract`
