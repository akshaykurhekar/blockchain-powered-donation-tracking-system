# blockchain-powered-donation-tracking-system
Blockchain Powered Charity Donation Tracking System using Hyperledger Fabric 

## steps to setup network

    1. run install docker images and fabric-samples repo.  - if you already have the docker images of hyperledger fabric and fabric-sample repo setup you can skip this step you can reuse your setup.

    
    $ chmod +x install-fabric.sh
    $ ./install-fabric.sh

    output >> ===> List out hyperledger images
    hyperledger/fabric-peer              2.5       63a9820373a4   7 months ago   151MB
    hyperledger/fabric-peer              2.5.12    63a9820373a4   7 months ago   151MB
    hyperledger/fabric-peer              latest    63a9820373a4   7 months ago   151MB
    ghcr.io/hyperledger/fabric-peer      2.5.12    63a9820373a4   7 months ago   151MB
    hyperledger/fabric-orderer           2.5       d69cac8bbe84   7 months ago   118MB
    hyperledger/fabric-orderer           2.5.12    d69cac8bbe84   7 months ago   118MB
    hyperledger/fabric-orderer           latest    d69cac8bbe84   7 months ago   118MB
    ghcr.io/hyperledger/fabric-orderer   2.5.12    d69cac8bbe84   7 months ago   118MB
    hyperledger/fabric-ccenv             2.5       a39804456867   7 months ago   676MB
    hyperledger/fabric-ccenv             2.5.12    a39804456867   7 months ago   676MB
    hyperledger/fabric-ccenv             latest    a39804456867   7 months ago   676MB
    ghcr.io/hyperledger/fabric-ccenv     2.5.12    a39804456867   7 months ago   676MB
    hyperledger/fabric-baseos            2.5       32d16a66e457   7 months ago   142MB
    hyperledger/fabric-baseos            2.5.12    32d16a66e457   7 months ago   142MB
    hyperledger/fabric-baseos            latest    32d16a66e457   7 months ago   142MB
    ghcr.io/hyperledger/fabric-baseos    2.5.12    32d16a66e457   7 months ago   142MB
    hyperledger/fabric-ca                1.5       03492c5437b1   8 months ago   225MB
    hyperledger/fabric-ca                1.5.15    03492c5437b1   8 months ago   225MB
    hyperledger/fabric-ca                latest    03492c5437b1   8 months ago   225MB
    ghcr.io/hyperledger/fabric-ca        1.5.15    03492c5437b1   8 months ago   225MB


## to up network 

    $ sudo ./network.sh up

## to create and join mychannel

    $ sudo ./network.sh createChannel -c mychannel -ca -s couchdb

## to UP Network and Create, Join Channel - in one command

    $ sudo ./network.sh up createChannel -c mychannel -ca -s couchdb

## Add new org03 with peer0 in already running network

You can use the `addOrg3.sh` script to add another organization to the Fabric test network. The `addOrg3.sh` script generates the Org3 crypto material, creates an Org3 organization definition, and adds Org3 to a channel on the test network.

You first need to run `./network.sh up createChannel` in the `test-network` directory before you can run the `addOrg3.sh` script.

    $ cd addOrg3
    $ sudo ./addOrg3.sh up -ca -s couchdb

## to deploy chaincode on each org peer

    $ sudo ./network.sh deployCC -ccn testchaincode -ccp ../asset-transfer-basic/chaincode-javascript/ -ccl javascript

OR 

## deploy chaincode
    
    $ ./network.sh deployCC -ccn ccc01 -ccv 1.0 -ccs 1 -ccp ../asset-transfer-basic/chaincode-javascript/ -ccl javascript 

## upgrade chaincode 

    $ ./network.sh deployCC -ccn ccc01 -ccv 2.0 -ccs 2 -ccp ../asset-transfer-basic/chaincode-javascript/ -ccl javascript

## test chaincode using node script


## to stop and down network

    $ sudo ./network.sh down

## Smart contract functions 

## ORGS 
    
- Org1 = PlatformMSP  -> Add new Org 
- Org2 = GovMSP  -> register GovAdmin Cert -> onboard Banks & goverment user
- Org3 = NGOMSP  -> registerNGOAdmin -> registerNGO's 

## User Types - user roles

- admin - org1
- govAdmin - org2
- govUser
- bankUser
- donor 
- ngoAdmin - org3
- ngoUser

## Operation by org types

###  Org1 - platfromMSP - patfrom user
    - add new org to the network ex: Org3, Org4..
    

###  Org2 - GovMSP - goverment user 
    - RegisterDonor
    - GetDonor
    - RegisterBank
    - GetBank
    - GetAllBanks
    - GetAllNGOs
    - GetAllDonors 
    - GetAllDonationsByDonor

#### Org2MSP - Bank Users
    - IssueToken   
    - TransferToken 

#### Org2MSP - Donner users
    - Donate 
    - GetAllFunds

###  Org3 - NGOMSP - ngo user

    NGO user with adminUser role
    - RegisterNGO 
    - GetNGO

    NGO user with ngoUser role   
    -  CreateFund
    - GetFund
    - CloseFund
    - AddExpense
    - GetAllFundsByNGO
    - RedeemToken



## Smart Contract

 - UserContract 
    - RegisterNGO by only by NGOMSP  -  RegisterNGO(ctx, ngoId, name, regNo, address, contact, description) 
    - GetNGO()ctx,  ngoId - anyone can call 

    - RegisterDonor | can called by anyone - RegisterDonor(ctx, donorId, name, email, alias)
    - GetDonor - donorId - GetDonor(ctx, donorId)

    - RegisterBank(ctx, bankId, name, branch, ifscCode) - only GovMSP can call
    - GetBank(ctx, bankId) - anyone can call based on bankId

    - GetAllBanks(ctx) - call by GovMSP
    - GetAllNGos(ctx) - call by GovMSP
    - GetAllDonors(ctx) - call by GovMSP


- FundContract 
    - CreateFund(ctx, fundId, ngoId, title, purpose) - by NGOMSP
    - Donate(ctx, fundId, donorId, tokenId, amount) - call by anyone
    - AddExpense(ctx, fundId, description, amount, spenderId) - call by (only NGO org) - (spenderId == vendorId)

    - GetFund(ctx, fundId) by id - anyone can call
    - CloseFund(ctx, fundId) - NGOMSP and GovMSP can call.
    - GetAllFundsByNGO(ctx, ngoId) - anyone can call.
    - GetAllFunds(ctx) - anyone can call.
    - GetAllDonationsByDonor(ctx, donorId) - anyome can call - used in donoar ui

- TokenContract 
    - IssueToken(ctx, bankId, fundManagerId, amount) - only bank can call
    - TransferToken(ctx, tokenId, toId) -  bank can call.
    - RedeemToken(ctx, tokenId, ngoId) - NGOMSP can call
