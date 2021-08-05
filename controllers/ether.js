const express = require('express')
const Web3 = require('web3')
const web3 = new Web3('https://rinkeby.infura.io/v3/6244fc96facd47f5b2cf9bb1c4286723')
const utils =  require('ethereumjs-util')
var Wallet = require('ethereumjs-wallet');
const ethereum_address = require('ethereum-address')
const ABI = require('../utils/abi')
require('dotenv').config()
const Tx = require('ethereumjs-tx').Transaction

exports.getEthBalance=(req,res)=>{
    var address = req.params.address;
    if(!web3.utils.isAddress(address)){
        return res.status(200).json({status: false, data:0, message: 'invalid address, please provide valid ether address'})
  
    }
    web3.eth.getBalance(address)
    .then((bal)=>{
        var balance = web3.utils.fromWei(bal, 'ether')
        
                res.status(200).json({status: true, data:{ETH: balance}, message: 'success'})
        })
        
        .catch(err=>{
            console.log(err)
            res.status(500).json({
                err:error.message
            })
        })
  
}


exports.get_USDT_Balance=(req,res)=>{
    var address = req.params.address
  if(web3.utils.isAddress(address)){
    const contract =new web3.eth.Contract(ABI,contractAddress)
      contract.methods.balanceOf(address).call()
      .then(result=>{
          res.status(200).json({status: true, data:{USDT: (result/1e6).toFixed(8)}, message: 'success'})
      })
      .catch(err=>{
        console.log(err)
          res.status(500).json({
         err:error.message
          })
      })
  }else{
      res.status(200).json({status: false, data:{USDT: 0}, message: 'invalid address'})
  }

}


exports.transfer_ETH=(req,res)=>{
    
    const account1 =req.body.account1
    const account2 =req.body.account2
    var private = req.body.private.startsWith('0x') ? req.body.private.substr(2): req.body.private
    const privateKey = new Buffer.from(private, 'hex');

web3.eth.getTransactionCount(account1,(err,txCount)=>{
    const txObject={
        nonce: web3.utils.toHex(txCount),
        to:account2,
        value: web3.utils.toHex(web3.utils.toWei('1','ether')),
        gasLimit:web3.utils.toHex(21000),
        gasPrice:web3.utils.toHex(web3.utils.toWei('10','gwei'))
    }
   
//sign the transaction
const tx = new Tx(txObject,{chain:'rinkeby'})
tx.sign(privateKey)
const serializedTransaction = tx.serialize()
const raw = '0x' + serializedTransaction.toString('hex')

//broadcast the transaction
web3.eth.sendSignedTransaction(raw,(err,txHash)=>{
    if(err){
        console.log(err)
    }
    res.status(201).json({
        message:"success",
        txHash:txHash
    })
    console.log('txHash',txHash)
})
})

}


exports.get_block=(req,res)=>{
    web3.eth.getBlock('latest')
    .then((block)=>{
       
        res.status(201).json({
            blockHash :block.hash,
            blockNumber :block.number
        })
        
        })
        .catch(err=>{
            res.status(500).json({
                err:err.message
            })
        })
    }




exports.get_Current_gasPrice =(req,res)=>{
    web3.eth.getGasPrice()
    .then(result=>{
        res.status(201).json({
            gasprice:web3.utils.fromWei(result,'ether')})
    })
    .catch(err=>{
        res.status(500).json({
            err:err.message
        })
    })
}


exports.create_wallet =(req,res)=>{


    const EthWallet = Wallet.default.generate()
    
    res.status(201).json({
        address:  EthWallet.getAddressString(),
        privatekey:EthWallet.getPrivateKeyString()
    })
    
    }

exports.valid_address=(req,res)=>{
    const address =req.body.address
    if(ethereum_address.isAddress(address)){
        console.log('valid ethereum address')
        res.status(201).json('valid ethereum address')
    }
    else{
        res.status(500).json('invalid address')
    }
    }