const express = require('express')
const Web3 = require('web3')
const web3 = new Web3('https://rinkeby.infura.io/v3/6244fc96facd47f5b2cf9bb1c4286723')
const ABI = require('../utils/abi')
require('dotenv').config()
const Tx = require('ethereumjs-tx').Transaction
const contractAddress =process.env.contractAddress


exports.transfer_token =(req,res)=>{
    const account1 =req.body.account1
    const account2 = req.body.account2
 
    const private = req.body.private.startsWith('0x') ? req.body.private.substr(2): req.body.private
    const privateKey = new Buffer.from(private, 'hex');
 
     const contract = new web3.eth.Contract(ABI, contractAddress)
     
     const data =contract.methods.transfer(account2,10000).encodeABI()
     
    
     web3.eth.getTransactionCount(account1,(err,txCount)=>{
 
    //create transaction object
     const txObject ={
         nonce: web3.utils.toHex(txCount),
         gasLimit: web3.utils.toHex(800000),
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
     web3.eth.sendSignedTransaction(raw,(err,txHash)=>{
         res.status(201).json({
          message:"success",
          result: txHash
         })
         console.log('err:',err,'txHash:',txHash)
     })
 
 })
 }