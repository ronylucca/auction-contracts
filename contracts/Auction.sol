// SPDX-License-Identifier: UNLICENSED
pragma solidity ^0.8.9;

contract Auction is ERC721URIStorage {

  using Counters for Counters.Counter;

  Counters.Counter private _tokenIds;

  address payable owner;

  uint private _maxBidsAuction;

  mapping(uint256 => Auction) productAuctions;
  
  uint256 listPrice = 0.001 ether;

  struct Auction {
      uint256 productTokenId;
      address payable seller;
      address payable lastBidder; 
      uint256 bestPrice;
      uint bidPosition;
      bool currentlyListed;

  }

  event AuctionInitialized (
        uint256 indexed tokenId,
        uuint256 minPrice,
        address seller,
        bool currentlyListed,
  
  );

    event AuctionFinished (
        uint256 indexed tokenId,
        address seller,
        address buyer,
        uint256 price,
    );

    constructor() ERC721("Auction", "AUCT") {
        owner = payable(msg.sender);
        _maxBidsAuction = 10;
    }

    //Product Creation
    function createProductToken(string memory tokenURI, address seller) public returns (uint) {
        require(owner == msg.sender, "Only owner can create token");
        //Increment the tokenId counter, which is keeping track of the number of minted NFTs
        _tokenIds.increment();
        uint256 newTokenId = _tokenIds.current();

        //Mint the NFT with tokenId newTokenId to the administration address
        _safeMint(msg.sender, newTokenId);

        //Map the tokenId to the tokenURI (which is an IPFS URL with the NFT metadata)
        _setTokenURI(newTokenId, tokenURI);

        //Helper function to update Global variables and emit an event
        createProductAuction(newTokenId, seller);

        return newTokenId;
    }

    function createProductAuction(uint256 tokenId, address seller) private {
        //Update the mapping of tokenId's to Token details, useful for retrieval functions
        productAuctions[tokenId] = Auction(
            tokenId,
            payable(seller),
            payable(seller),
            0,
            0,
            false
        );
    }

    function initializeAuction(string tokenId, uint256 initialPrice) public payable returns(Auction memory) {
        require(owner == msg.sender, "Only owner can create token");
        require(msg.value == listPrice, "Amount for listing price is different");
        
        //Just sanity check
        require(initialPrice > 0, "the price is negative");

        productAuctions[tokenId].bestPrice = initialPrice;
        productAuctions[tokenId].currentlyListed = true;

        emit AuctionInitialized(
            tokenId,
            productAuctions[tokenId].seller,
            productAuctions[tokenId].lastBidder,
            initialPrice,
            true
        );

        return productAuctions[tokenId];
    }

    function bid(string tokenId, uint256 bidPrice, address bidder) public payable returns(Auction memory) {
        require(owner == msg.sender, "Only owner can create token");
        //validates if The tokenId does exists and if it's listed
        require(productAuctions[tokenId].currentlyListed, "No Listed Auction found");
        //Check if the new Bid price is higher than the last one
        require(bidPrice > productAuctions[tokenId].bestPrice, "the price must be higher than the last Bid");

        productAuctions[tokenId].bestPrice = bidPrice;
        productAuctions[tokenId].lastBidder = payable(bidder);
        productAuctions[tokenId].bidPosition += 1;

        if(productAuctions[tokenId].bidPosition == _maxBidsAuction){
            executeSale(tokenId);
        }

        return productAuctions[tokenId];
    }

    function executeSale(uint256 tokenId) private payable {
        uint price = idToListedToken[tokenId].price;
        address seller = idToListedToken[tokenId].seller;

        //Actually transfer the token to the new owner
        _transfer(owner,productAuctions[tokenId].lastBidder, tokenId);
        //approve the marketplace to sell NFTs on your behalf
        approve(owner, tokenId);

        //Transfer the listing fee to the marketplace creator
        payable(owner).transfer(listPrice);

        //Transfer the proceeds from the sale to the seller of the NFT
        payable(productAuctions[tokenId].seller).transfer(productAuctions[tokenId].bestPrice);
    }
}