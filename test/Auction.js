const { expect } = require("chai")

let auctionContract;

async function initializeContract(){
   const Auction = await ethers.getContractFactory('Auction')
   auctionContract = await Auction.deploy()
   await auctionContract.deployed()
}

describe('Auction', function () {
  it("Should create a Auction contract and return it's listPrice", async function () {
    await initializeContract()
    expect(await auctionContract.getListPrice()).to.equal(ethers.utils.parseEther('0.0001'))
  })

  it('Should verify creator token amount and auction struct', async function () {
    
    const [owner, addr1] = await ethers.getSigners()

    //ADD NEW COFFEE
    const createProductTx = await auctionContract
      .createProductToken('This is a new Product Token', owner.address)
    await createProductTx.wait()

    expect(await auctionContract.balanceOf(owner.address)).to.equal(1);

    //check if there is an auction struct
    expect(await auctionContract.getCurrentTokenId()).to.equal('1')

  })
})