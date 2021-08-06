const express = require('express')
const Web3 = require('web3')
const web3 = new Web3('https://rinkeby.infura.io/v3/6244fc96facd47f5b2cf9bb1c4286723')
const ABI = require('../utils/abi')
require('dotenv').config()
const Tx = require('ethereumjs-tx').Transaction
const contractAddress =process.env.contractAddress


/*exports.transfer_token =(req,res)=>{
    //const decimals = 18
    const account1 =req.body.account1
    const account2 = req.body.account2
    const amountInDecimal =1
 
    const private = req.body.private.startsWith('0x') ? req.body.private.substr(2): req.body.private
    const privateKey = new Buffer.from(private, 'hex');
 
     const contract = new web3.eth.Contract(ABI, contractAddress)
     const data=contract.methods.transfer(account2,web3.utils.toHex(web3.utils.toWei(amountInDecimal.toString(),'ether'))).encodeABI()
     //const data =contract.methods.transfer(account2,amount * (10 ** decimals)).encodeABI()
     
    
     web3.eth.getTransactionCount(account1,(err,txCount)=>{
 
    //create transaction object
     const txObject ={
         nonce: web3.utils.toHex(txCount),
         gasLimit: web3.utils.toHex(90000),
         gasPrice: web3.utils.toHex(web3.utils.toWei('10','gwei')),
         to :contractAddress ,
         value:'0x0',
         data:data
     }
 
 
 
     //sign the transaction
     const tx = new Tx(txObject,{chain:'rinkeby'})
     tx.sign(privateKey)
 
     const serializedTx = tx.serialize()
     const raw = '0x'+ serializedTx.toString('hex')
 
 
 
     //Broadcast the transaction
     web3.eth.sendSignedTransaction(raw)
     .then(result=>{
         res.status(201).json({
             message:"transaction successfull",
             result:result.transactionHash
         })
     })
     .catch(err=>{
         res.status(500).json({
         err:err.message
        })
     })
     
 })
 }*/
 
 exports.transferToken = async function(req, res){
    let to = req.body.to;
    let from = req.body.from
    //var web3 = getWeb3()
    var gasPrice = await web3.eth.getGasPrice();
    var gasLimit = 90000;
    //var wallet_type = req.params.coin;
    let private = req.body.private
    var contractAddress = "0x658E4d8dBb3Fb50A15fc9a89D79049543f4868e2"
    var decimals =  18
    var contractInstance = new web3.eth.Contract(ABI, contractAddress)
    contractInstance.methods.balanceOf(from).call()
    .then( async result=>{
        var tokenBal = result / (10 ** decimals)
        if(req.body.amount <= tokenBal){
            var amount = req.body.amount
            var txCount = await web3.eth.getTransactionCount(from,'pending');
            let data = contractInstance.methods.transfer(to, amount * (10 ** decimals)).encodeABI();
            var rawTransaction = {
                nonce: web3.utils.toHex(txCount),
                gasPrice: web3.utils.toHex(gasPrice * 1.05),
                gasLimit: web3.utils.toHex(gasLimit),
                to:contractAddress,
                data: data,
                value: "0x0",
                chainId: 4
            }
            var privateKey = new Buffer.from(private, 'hex');
            var tx = new Tx(rawTransaction);
            tx.sign(privateKey);
            var serializedTx = tx.serialize();
            web3.eth.sendSignedTransaction('0x' + serializedTx.toString('hex'))
            .then(receipt=>{
                return res.status(200).json({status: true, data:receipt.transactionHash, message:'transaction sent successfully'})  
            })
            .catch(e=>{
                return res.status(200).json({status: false, data:e, message:'error while sending transaction, NOTE: Please maintain atlease 0.01 ETH for network fee'})  
            })
        }else{
            return res.status(200).json({status: false, data:tokenBal, message:'insufficient funds in sender wallet'})  
        }
    })
}