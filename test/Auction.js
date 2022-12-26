const { expect } = require("chai");
const { ethers } = require("hardhat");

let auctionContract;
let listPrice;

async function initializeContract() {
  const Auction = await ethers.getContractFactory("Auction");
  auctionContract = await Auction.deploy();
  await auctionContract.deployed();
}

describe('Auction', function () {
    
  it("Should create a Auction contract and return it's listPrice", async function () {
    await initializeContract()
    listPrice = await auctionContract.getListPrice();
    expect(listPrice).to.equal(ethers.utils.parseEther('0.0001'))
  }),

    it('Should create and Mint ProductToken and verify creator NFT token amount and auction struct', async function () {
      const [owner, addr1] = await ethers.getSigners()

      //Mint ProductToken
      const createProductTx = await auctionContract
        .createProductToken('This is a new Product Token', owner.address)
      await createProductTx.wait()
      expect(await auctionContract.balanceOf(owner.address)).to.equal(1);

      //check if there is an auction struct
      expect(await auctionContract.getCurrentTokenId()).to.equal('1')

    })

  it('Should revert when try to create ProductToken', async function () { 
    const [owner, addr1] = await ethers.getSigners()

    //Mint ProductToken
    await expect(auctionContract.connect(addr1).createProductToken('This is a new Product Token', owner.address)).
      to.be.revertedWith('Only owner can create token');

  })

  it('Should revert while trying to initialize Auction without Owner', async function () {
    const [owner, addr1] = await ethers.getSigners()
    const initialPrice = ethers.utils.parseEther('0.0001');
    await expect(auctionContract.connect(addr1).initializeAuction(1, initialPrice,
      {
        value: ethers.utils.parseEther('0.0001'),
      }))
      .to.be.revertedWith('Only owner can initialize auction');

  })

  it('Should revert while trying to initialize Auction with invalid initialPrice', async function () {

    await expect(auctionContract.initializeAuction(1, 0,
      {
        value: ethers.utils.parseEther('0.0001'),
      }))
      .to.be.revertedWith('the price is invalid');

  })

  it('Should initialize Auction and emit event AuctionInitialized', async function () {
    
    const [owner] = await ethers.getSigners()

    //check if there is an auction struct
    let tokenId = await auctionContract.getCurrentTokenId();
    const initialPrice = ethers.utils.parseEther('0.0001');

    expect(tokenId).to.equal('1')

    await expect(await auctionContract.initializeAuction(tokenId, initialPrice,
      {
        value: listPrice,
      }))
      .to.emit(auctionContract, 'AuctionInitialized')
      .withArgs(tokenId,
        initialPrice,
        owner.address,
        true);

  })

  it('Should revert while trying to initialize Auction with a different listPrice', async function () {

    const initialPrice = ethers.utils.parseEther('0.0001');

    await expect(auctionContract.initializeAuction(1, initialPrice,
      {
        value: ethers.utils.parseEther('0.001'),
      }))
      .to.be.revertedWith('Amount for listing price is different');

  })

  it('Should revert while trying to initialize Auction already initialized', async function () {

    const initialPrice = ethers.utils.parseEther('0.0001');

    await expect(auctionContract.initializeAuction(1, initialPrice,
      {
        value: ethers.utils.parseEther('0.0001'),
      }))
      .to.be.revertedWith('This auction has already been started');
  })

}),
  describe('Bid', function () {
    it('Should revert while trying to create a Bid without valid access', async function () {
      
      const [owner, addr1] = await ethers.getSigners()
      const bidPrice = ethers.utils.parseEther('0.0002');

      await expect(auctionContract.connect(addr1).bid(1, bidPrice, addr1.address))
        .to.be.revertedWith('Only owner can access this method');

    })

    it('Should revert while trying to create a Bid with a lower bidPrice', async function () {
      
      const [owner, addr1] = await ethers.getSigners()
      const bidPrice = ethers.utils.parseEther('0.0001');

      await expect(auctionContract.bid(1, bidPrice, addr1.address))
        .to.be.revertedWith('the price must be higher than the last Bid');

    })

    it('Should revert while trying to create a Bid for a inexistent product', async function () {
      
      const [owner, addr1] = await ethers.getSigners()
      const bidPrice = ethers.utils.parseEther('0.0002');

      await expect(auctionContract.bid(2, bidPrice, addr1.address))
        .to.be.revertedWith('No Listed Product found');

    })

    it('Should create a Bid for a product successfully', async function () {
      
      const [addr1] = await ethers.getSigners()
      const bidPrice = ethers.utils.parseEther('0.0002');
      await expect(auctionContract.bid(1, bidPrice, addr1.address))
      const auctionObject = await auctionContract.getAuction(1);
      expect(auctionObject.bidPosition).to.equal(1)
    })

    it('Should create Bid up to maximum. Evoking sale execution for a product', async function () {
      
      const [owner, addr1, addr2] = await ethers.getSigners()
      let bidPrice;

      //updating maximumBid size down to 3 
      await auctionContract.updateMaxBidNumber(3)

      //create Bids up to maximum 3
      bidPrice = ethers.utils.parseEther(`0.00021`);
      await auctionContract.bid(1, bidPrice, addr1.address)
    
      bestBidPrice = ethers.utils.parseEther(`0.00022`);
      await expect(await auctionContract.bid(1, bestBidPrice, addr2.address))
        .to.emit(auctionContract, 'AuctionFinished')
        .withArgs(
          1,
          owner.address,
          addr2.address,
          bestBidPrice);
        
      expect(await auctionContract.balanceOf(owner.address)).to.equal(0);
      expect(await auctionContract.balanceOf(addr2.address)).to.equal(1);
    })
    
  }),
  describe('Config', function () {
    it('Should update MaxBidNumber successfully', async function () { 
      await expect(auctionContract.updateMaxBidNumber(3))
    })

    it('Should update MaxBidNumber successfully', async function () {
      await expect(await auctionContract.getMaxBidAuction()).to.equal(3)
    })

    it('Should revert trying to update MaxBidNumber without permission', async function () {
      const [owner, addr1] = await ethers.getSigners();
      await expect(auctionContract.connect(addr1).updateMaxBidNumber(3)).
        to.be.revertedWith('Only owner can update maxBidNumber')
    })

    it('Should update ListPrice successfully', async function () {
      const newListPrice = ethers.utils.parseEther('0.0001')
      await auctionContract.updateListPrice(newListPrice);
      const listPrice = await auctionContract.getListPrice();
      expect(listPrice).to.equal(newListPrice)
    })

    it('Should revert updating ListPrice as ordinary', async function () {
      const[owner, addr1] = await ethers.getSigners()
      const newListPrice = ethers.utils.parseEther('0.0001')
      await expect(auctionContract.connect(addr1).updateListPrice(newListPrice))
        .to.be.revertedWith('Only owner can update listing price');
    })
    
  })
   