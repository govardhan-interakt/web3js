const express = require('express')
const router = express.Router()
const Web3 = require('web3')
const web3 = new Web3('https://rinkeby.infura.io/v3/6244fc96facd47f5b2cf9bb1c4286723')

const utils =  require('ethereumjs-util')
var Wallet = require('ethereumjs-wallet');
const ethereum_address = require('ethereum-address')
const Tx = require('ethereumjs-tx').Transaction

const abi =[{"anonymous":false,"inputs":[{"indexed":true,"internalType":"address","name":"_owner","type":"address"},{"indexed":true,"internalType":"address","name":"_spender","type":"address"},{"indexed":false,"internalType":"uint256","name":"_value","type":"uint256"}],"name":"Approval","type":"event"},{"anonymous":false,"inputs":[{"indexed":true,"internalType":"address","name":"_from","type":"address"},{"indexed":true,"internalType":"address","name":"_to","type":"address"},{"indexed":false,"internalType":"uint256","name":"_value","type":"uint256"}],"name":"Transfer","type":"event"},{"inputs":[],"name":"MyToken","outputs":[],"stateMutability":"nonpayable","type":"function"},{"inputs":[{"internalType":"address","name":"","type":"address"},{"internalType":"address","name":"","type":"address"}],"name":"allowance","outputs":[{"internalType":"uint256","name":"","type":"uint256"}],"stateMutability":"view","type":"function"},{"inputs":[{"internalType":"address","name":"_spender","type":"address"},{"internalType":"uint256","name":"_value","type":"uint256"}],"name":"approve","outputs":[{"internalType":"bool","name":"success","type":"bool"}],"stateMutability":"nonpayable","type":"function"},{"inputs":[{"internalType":"address","name":"","type":"address"}],"name":"balanceOf","outputs":[{"internalType":"uint256","name":"","type":"uint256"}],"stateMutability":"view","type":"function"},{"inputs":[],"name":"decimals","outputs":[{"internalType":"uint8","name":"","type":"uint8"}],"stateMutability":"view","type":"function"},{"inputs":[],"name":"name","outputs":[{"internalType":"string","name":"","type":"string"}],"stateMutability":"view","type":"function"},{"inputs":[],"name":"standard","outputs":[{"internalType":"string","name":"","type":"string"}],"stateMutability":"view","type":"function"},{"inputs":[],"name":"symbol","outputs":[{"internalType":"string","name":"","type":"string"}],"stateMutability":"view","type":"function"},{"inputs":[],"name":"totalSupply","outputs":[{"internalType":"uint256","name":"","type":"uint256"}],"stateMutability":"view","type":"function"},{"inputs":[{"internalType":"address","name":"_to","type":"address"},{"internalType":"uint256","name":"_value","type":"uint256"}],"name":"transfer","outputs":[{"internalType":"bool","name":"success","type":"bool"}],"stateMutability":"nonpayable","type":"function"},{"inputs":[{"internalType":"address","name":"_from","type":"address"},{"internalType":"address","name":"_to","type":"address"},{"internalType":"uint256","name":"_value","type":"uint256"}],"name":"transferFrom","outputs":[{"internalType":"bool","name":"success","type":"bool"}],"stateMutability":"nonpayable","type":"function"}]
const contractAddress='0x746D9a7d56A91C85d144b834A0246EeF43b21974'



//get eth balance
router.get('/ether/:address',(req,res)=>{
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
  
})
//get usdt token balance
router.get('/usdt/:address',(req,res)=>{
    var address = req.params.address
  if(web3.utils.isAddress(address)){
    const contract =new web3.eth.Contract(abi,contractAddress)
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

})



router.get('/transfer',(req,res)=>{
    const account2 ='0x2E99c6B03534C496a500B53C433CbAa9a70fCb9f'
    const account1 ='0x4d8386D66465380a8684Dd522666E448ccE2cc52'
    const privatekey2 =Buffer.from(process.env.PRIVATE_KEY_2,'hex')
    const privatekey1 =Buffer.from(process.env.PRIVATE_KEY_1,'hex')

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
tx.sign(privatekey1)
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

})
//get block number
router.get('/block',(req,res)=>{
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
})
//get current gas price
router.get('/gasprice',(req,res)=>{
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
})

//generate eth wallet
router.get('/wallet',(req,res)=>{


const EthWallet = Wallet.default.generate();

res.status(201).json({
    address:  EthWallet.getAddressString(),
    privatekey:EthWallet.getPrivateKeyString()
})

})

//validate address

router.get('/valid',(req,res)=>{
const address =req.body.address
if(ethereum_address.isAddress(address)){
    console.log('valid ethereum address')
    res.status(201).json('valid ethereum address')
}
else{
    res.status(500).json('invalid address')
}
})



module.exports = router