const express = require('express')
const router = express.Router()
const Tx = require('ethereumjs-tx').Transaction
const Web3 = require('web3')
const web3 = new Web3('https://rinkeby.infura.io/v3/6244fc96facd47f5b2cf9bb1c4286723')
require('dotenv').config()



   const account1 ='0x4d8386D66465380a8684Dd522666E448ccE2cc52'
   const account2 = '0x2E99c6B03534C496a500B53C433CbAa9a70fCb9f'

   const privateKey1 = Buffer.from(process.env.PRIVATE_KEY_1,'hex')
   const privateKey2 = Buffer.from(process.env.PRIVATE_KEY_2,'hex')


    const contractAddress ='0x658E4d8dBb3Fb50A15fc9a89D79049543f4868e2'
    const contractABI =[{"anonymous":false,"inputs":[{"indexed":true,"internalType":"address","name":"_owner","type":"address"},{"indexed":true,"internalType":"address","name":"_spender","type":"address"},{"indexed":false,"internalType":"uint256","name":"_value","type":"uint256"}],"name":"Approval","type":"event"},{"anonymous":false,"inputs":[{"indexed":true,"internalType":"address","name":"_from","type":"address"},{"indexed":true,"internalType":"address","name":"_to","type":"address"},{"indexed":false,"internalType":"uint256","name":"_value","type":"uint256"}],"name":"Transfer","type":"event"},{"inputs":[],"name":"MyToken","outputs":[],"stateMutability":"nonpayable","type":"function"},{"inputs":[{"internalType":"address","name":"","type":"address"},{"internalType":"address","name":"","type":"address"}],"name":"allowance","outputs":[{"internalType":"uint256","name":"","type":"uint256"}],"stateMutability":"view","type":"function"},{"inputs":[{"internalType":"address","name":"_spender","type":"address"},{"internalType":"uint256","name":"_value","type":"uint256"}],"name":"approve","outputs":[{"internalType":"bool","name":"success","type":"bool"}],"stateMutability":"nonpayable","type":"function"},{"inputs":[{"internalType":"address","name":"","type":"address"}],"name":"balanceOf","outputs":[{"internalType":"uint256","name":"","type":"uint256"}],"stateMutability":"view","type":"function"},{"inputs":[],"name":"decimals","outputs":[{"internalType":"uint8","name":"","type":"uint8"}],"stateMutability":"view","type":"function"},{"inputs":[],"name":"name","outputs":[{"internalType":"string","name":"","type":"string"}],"stateMutability":"view","type":"function"},{"inputs":[],"name":"standard","outputs":[{"internalType":"string","name":"","type":"string"}],"stateMutability":"view","type":"function"},{"inputs":[],"name":"symbol","outputs":[{"internalType":"string","name":"","type":"string"}],"stateMutability":"view","type":"function"},{"inputs":[],"name":"totalSupply","outputs":[{"internalType":"uint256","name":"","type":"uint256"}],"stateMutability":"view","type":"function"},{"inputs":[{"internalType":"address","name":"_to","type":"address"},{"internalType":"uint256","name":"_value","type":"uint256"}],"name":"transfer","outputs":[{"internalType":"bool","name":"success","type":"bool"}],"stateMutability":"nonpayable","type":"function"},{"inputs":[{"internalType":"address","name":"_from","type":"address"},{"internalType":"address","name":"_to","type":"address"},{"internalType":"uint256","name":"_value","type":"uint256"}],"name":"transferFrom","outputs":[{"internalType":"bool","name":"success","type":"bool"}],"stateMutability":"nonpayable","type":"function"}]


    const contract = new web3.eth.Contract(contractABI, contractAddress)
    
    const data =contract.methods.transfer(account2,10000).encodeABI()
    
    router.get('/tokenTransfer',(req,res)=>{
    web3.eth.getTransactionCount(account1,(err,txCount)=>{

   //create transaction object
    const txObject ={
        nonce: web3.utils.toHex(txCount),
        gasLimit: web3.utils.toHex(800000),
        gasPrice: web3.utils.toHex(web3.utils.toWei('10','gwei')),
        to :contractAddress ,
        value:web3.utils.toHex(web3.utils.toWei('1','ether')),
        data:data
    }



    //sign the transaction
    const tx = new Tx(txObject,{chain:'rinkeby'})
    tx.sign(privateKey1)

    const serializedTx = tx.serialize()
    const raw = '0x'+ serializedTx.toString('hex')



    //Broadcast the transaction
    web3.eth.sendSignedTransaction(raw,(err,txHash)=>{
        res.status(201).json(txHash)
        console.log('err:',err,'txHash:',txHash)
    })

})
})

module.exports = router