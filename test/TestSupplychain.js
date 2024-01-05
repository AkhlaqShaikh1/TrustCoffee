// This script is designed to test the solidity smart contract - SuppyChain.sol -- and the various functions within
// Declare a variable and assign the compiled smart contract artifact
const truffleAssert = require('truffle-assertions');
const web3 = require('web3');
var SupplyChain = artifacts.require('SupplyChain');
var FarmerRole = artifacts.require('FarmerRole');

contract('SupplyChain', function(accounts) {
    var sku = 1
    var upc = 1
    const ownerID = accounts[0]
    const originFarmerID = accounts[1]
    const originFarmName = "Akhlaq Shaikh Farms"
    const originFarmInformation = "PanoAqil Sindh Pakistan"
    const originFarmLatitude = "27.8666632"
    const originFarmLongitude = "69.1166662"
    var productID = sku + upc
    const productNotes = "Export Quality Beans"
    const productPrice = web3.utils.toWei("1.5", "ether")
    var itemState = 0
    const distributorID = accounts[2]
    const retailerID = accounts[3]
    const consumerID = accounts[4]
    const emptyAddress = '0x00000000000000000000000000000000000000'

    console.log("ganache-cli accounts used here...")
    console.log("Contract Owner: accounts[0] ", accounts[0])
    console.log("Farmer: accounts[1] ", accounts[1])
    console.log("Distributor: accounts[2] ", accounts[2])
    console.log("Retailer: accounts[3] ", accounts[3])
    console.log("Consumer: accounts[4] ", accounts[4])

    // Initial Test
    it("Test that roles are correctly added to contract", async () => {
        const supplyChain = await SupplyChain.deployed()

        var contractOwner = await supplyChain.owner();
        assert.equal(contractOwner, ownerID);

        var farmerAdded = await supplyChain.addFarmer(originFarmerID);
        truffleAssert.eventEmitted(farmerAdded, 'FarmerAdded');

        var distributorAdded = await supplyChain.addDistributor(distributorID);
        truffleAssert.eventEmitted(distributorAdded, 'DistributorAdded');

        var retailerAdded = await supplyChain.addRetailer(retailerID);
        truffleAssert.eventEmitted(retailerAdded, 'RetailerAdded');

        var consumerAdded = await supplyChain.addConsumer(consumerID);    
        truffleAssert.eventEmitted(consumerAdded, 'ConsumerAdded');
    })

    // 1st Test
    it("Testing smart contract function harvestItem() that allows a farmer to harvest coffee", async() => {
        const supplyChain = await SupplyChain.deployed()

        var event = await supplyChain.harvestItem(upc, originFarmerID, originFarmName, originFarmInformation, originFarmLatitude, originFarmLongitude, productID, productNotes)

        truffleAssert.eventEmitted(event, 'Harvested');


        const resultBufferOne = await supplyChain.fetchItemBufferOne.call(upc)
        const resultBufferTwo = await supplyChain.fetchItemBufferTwo.call(upc)


        assert.equal(resultBufferOne[1], upc, 'Error: Missing or Invalid upc')
        assert.equal(resultBufferOne[3], originFarmerID, 'Error: Missing or Invalid originFarmerID')
        assert.equal(resultBufferOne[4], originFarmName, 'Error: Missing or Invalid originFarmName')
        assert.equal(resultBufferOne[5], originFarmInformation, 'Error: Missing or Invalid originFarmInformation')
        assert.equal(resultBufferOne[6], originFarmLatitude, 'Error: Missing or Invalid originFarmLatitude')
        assert.equal(resultBufferOne[7], originFarmLongitude, 'Error: Missing or Invalid originFarmLongitude')
        assert.equal(resultBufferTwo[5], 0, 'Error: Invalid item State')
    })    

    // 2nd Test
    it("Testing smart contract function processItem() that allows a farmer to process coffee", async() => {
        const supplyChain = await SupplyChain.deployed();
        

        var event = await supplyChain.processItem(upc, {from: originFarmerID});


        truffleAssert.eventEmitted(event, 'Processed');


        const resultBufferTwo = await supplyChain.fetchItemBufferTwo.call(upc)


        assert.equal(resultBufferTwo[5], 1, 'Error: Invalid item State')
    })    

    // 3rd Test
    it("Testing smart contract function packItem() that allows a farmer to pack coffee", async() => {
        const supplyChain = await SupplyChain.deployed()

     
        var event = await supplyChain.packItem(upc, {from: originFarmerID});

        truffleAssert.eventEmitted(event, 'Packed');

        const resultBufferTwo = await supplyChain.fetchItemBufferTwo.call(upc)

        // Verify the result set
        assert.equal(resultBufferTwo[5], 2, 'Error: Invalid item State');
    })    

    // 4th Test
    it("Testing smart contract function sellItem() that allows a farmer to sell coffee", async() => {
        const supplyChain = await SupplyChain.deployed()
        
      
        var event = await supplyChain.sellItem(upc, productPrice, {from: originFarmerID});

      
        truffleAssert.eventEmitted(event, 'ForSale');


        const resultBufferTwo = await supplyChain.fetchItemBufferTwo.call(upc)

        // Verify the result set
        assert.equal(resultBufferTwo[4], productPrice, "Error: Invalid product price");
        assert.equal(resultBufferTwo[5], 3, 'Error: Invalid item State');
    })    

    // 5th Test
    it("Testing smart contract function buyItem() that allows a distributor to buy coffee", async() => {
        const supplyChain = await SupplyChain.deployed()
        
      
        var event = await supplyChain.buyItem(upc, {from: distributorID, value: productPrice});

        truffleAssert.eventEmitted(event, 'Sold');

        const resultBufferTwo = await supplyChain.fetchItemBufferTwo.call(upc)

        // Verify the result set
        assert.equal(resultBufferTwo[5], 4, 'Error: Invalid item State');
        assert.equal(resultBufferTwo[6], distributorID, 'Error: Invalid distributor id');
    })    

    // 6th Test
    it("Testing smart contract function shipItem() that allows a distributor to ship coffee", async() => {
        const supplyChain = await SupplyChain.deployed()


        var event = await supplyChain.shipItem(upc, {from: distributorID});


        truffleAssert.eventEmitted(event, 'Shipped');


        const resultBufferTwo = await supplyChain.fetchItemBufferTwo.call(upc)


        assert.equal(resultBufferTwo[5], 5, 'Error: Invalid item State');
    })    

    // 7th Test
    it("Testing smart contract function receiveItem() that allows a retailer to mark coffee received", async() => {
        const supplyChain = await SupplyChain.deployed()
        

        var event = await supplyChain.receiveItem(upc, {from: retailerID});


        truffleAssert.eventEmitted(event, 'Received');


        const resultBufferTwo = await supplyChain.fetchItemBufferTwo.call(upc)


        assert.equal(resultBufferTwo[5], 6, 'Error: Invalid item State');
    })

    // 8th Test
    it("Testing smart contract function purchaseItem() that allows a consumer to purchase coffee", async() => {
        const supplyChain = await SupplyChain.deployed()
        
  
        var event = await supplyChain.purchaseItem(upc, {from: consumerID});

        truffleAssert.eventEmitted(event, 'Purchased');

        const resultBufferTwo = await supplyChain.fetchItemBufferTwo.call(upc)


        assert.equal(resultBufferTwo[5], 7, 'Error: Invalid item State');
       
    })    

    // 9th Test
    it("Testing smart contract function fetchItemBufferOne() that allows anyone to fetch item details from blockchain", async() => {
        const supplyChain = await SupplyChain.deployed()


        const resultBufferOne = await supplyChain.fetchItemBufferOne.call(upc, {from: accounts[8]})
        

        assert.equal(resultBufferOne[0], sku, 'Error: Invalid item SKU')
        assert.equal(resultBufferOne[1], upc, 'Error: Invalid item UPC')
        assert.equal(resultBufferOne[2], consumerID, 'Error: Missing or Invalid ownerID')
        assert.equal(resultBufferOne[3], originFarmerID, 'Error: Missing or Invalid originFarmerID')
        assert.equal(resultBufferOne[4], originFarmName, 'Error: Missing or Invalid originFarmName')
        assert.equal(resultBufferOne[5], originFarmInformation, 'Error: Missing or Invalid originFarmInformation')
        assert.equal(resultBufferOne[6], originFarmLatitude, 'Error: Missing or Invalid originFarmLatitude')
        assert.equal(resultBufferOne[7], originFarmLongitude, 'Error: Missing or Invalid originFarmLongitude')
    })

    // 10th Test
    it("Testing smart contract function fetchItemBufferTwo() that allows anyone to fetch item details from blockchain", async() => {
        const supplyChain = await SupplyChain.deployed()

   
        const resultBufferTwo = await supplyChain.fetchItemBufferTwo.call(upc, {from: accounts[7]})

    
        assert.equal(resultBufferTwo[0], sku, 'Error: Invalid item SKU')
        assert.equal(resultBufferTwo[1], upc, 'Error: Invalid item UPC')
        assert.equal(resultBufferTwo[2], productID, 'Error: Missing or Invalid productID')
        assert.equal(resultBufferTwo[3], productNotes, 'Error: Missing or Invalid originFarmerID')
        assert.equal(resultBufferTwo[4], productPrice, 'Error: Missing or Invalid originFarmName')
        assert.equal(resultBufferTwo[5], 7, 'Error: Missing or Invalid originFarmInformation') // Purchased
        assert.equal(resultBufferTwo[6], distributorID, 'Error: Missing or Invalid originFarmLatitude')
        assert.equal(resultBufferTwo[7], retailerID, 'Error: Missing or Invalid originFarmLongitude')
        assert.equal(resultBufferTwo[8], consumerID, 'Error: Invalid item State') // Purchased
    })
});

