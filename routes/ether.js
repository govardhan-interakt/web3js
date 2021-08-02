const express = require('express')
const router = express.Router()
const Web3 = require('web3')
const web3 = new Web3('https://rinkeby.infura.io/v3/6244fc96facd47f5b2cf9bb1c4286723')

const utils =  require('ethereumjs-util')
const Tx = require('ethereumjs-tx')

const abi =[{"anonymous":false,"inputs":[{"indexed":true,"internalType":"address","name":"_owner","type":"address"},{"indexed":true,"internalType":"address","name":"_spender","type":"address"},{"indexed":false,"internalType":"uint256","name":"_value","type":"uint256"}],"name":"Approval","type":"event"},{"anonymous":false,"inputs":[{"indexed":true,"internalType":"address","name":"_from","type":"address"},{"indexed":true,"internalType":"address","name":"_to","type":"address"},{"indexed":false,"internalType":"uint256","name":"_value","type":"uint256"}],"name":"Transfer","type":"event"},{"inputs":[],"name":"MyToken","outputs":[],"stateMutability":"nonpayable","type":"function"},{"inputs":[{"internalType":"address","name":"","type":"address"},{"internalType":"address","name":"","type":"address"}],"name":"allowance","outputs":[{"internalType":"uint256","name":"","type":"uint256"}],"stateMutability":"view","type":"function"},{"inputs":[{"internalType":"address","name":"_spender","type":"address"},{"internalType":"uint256","name":"_value","type":"uint256"}],"name":"approve","outputs":[{"internalType":"bool","name":"success","type":"bool"}],"stateMutability":"nonpayable","type":"function"},{"inputs":[{"internalType":"address","name":"","type":"address"}],"name":"balanceOf","outputs":[{"internalType":"uint256","name":"","type":"uint256"}],"stateMutability":"view","type":"function"},{"inputs":[],"name":"decimals","outputs":[{"internalType":"uint8","name":"","type":"uint8"}],"stateMutability":"view","type":"function"},{"inputs":[],"name":"name","outputs":[{"internalType":"string","name":"","type":"string"}],"stateMutability":"view","type":"function"},{"inputs":[],"name":"standard","outputs":[{"internalType":"string","name":"","type":"string"}],"stateMutability":"view","type":"function"},{"inputs":[],"name":"symbol","outputs":[{"internalType":"string","name":"","type":"string"}],"stateMutability":"view","type":"function"},{"inputs":[],"name":"totalSupply","outputs":[{"internalType":"uint256","name":"","type":"uint256"}],"stateMutability":"view","type":"function"},{"inputs":[{"internalType":"address","name":"_to","type":"address"},{"internalType":"uint256","name":"_value","type":"uint256"}],"name":"transfer","outputs":[{"internalType":"bool","name":"success","type":"bool"}],"stateMutability":"nonpayable","type":"function"},{"inputs":[{"internalType":"address","name":"_from","type":"address"},{"internalType":"address","name":"_to","type":"address"},{"internalType":"uint256","name":"_value","type":"uint256"}],"name":"transferFrom","outputs":[{"internalType":"bool","name":"success","type":"bool"}],"stateMutability":"nonpayable","type":"function"}]
const contractAddress='0x746D9a7d56A91C85d144b834A0246EeF43b21974'

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

router.post('/transfer/:coin',(req,res)=>{
    if(typeof req.body.from == 'undefined')
        return res.status(200).json({status: false, data:null, message:'Invalid sender wallet address, please provide sender wallet address'})
    if(typeof req.body.to == 'undefined')
        return res.status(200).json({status: false, data:null, message:'Invalid receiver wallet address, please provide receiver wallet address'})
    if(typeof req.body.amount == 'undefined')
        return res.status(200).json({status: false, data:null, message:'Invalid amount, please provide valid amount'})
    if(typeof req.body.private == 'undefined')
        return res.status(200).json({status: false, data:null, message:'Invalid key, please provide valid key'})
    if(req.body.amount < 0.001)
        return res.status(200).json({status: false, data:null, message:'Transfer amount should > 0.001'})
    else{
        var private = req.body.private.startsWith('0x') ? req.body.private.substr(2): req.body.private
        var privateKey = new Buffer.from(private, 'hex');
        if(!utils.isValidPrivate(privateKey)){
            return res.status(200).json({status: false, data:null, message:'Invalid private key, please provide valid private key associated with wallet'})
        }
        if(!(req.body.from.toLowerCase() == ('0x' + utils.privateToAddress(privateKey).toString('hex')).toLowerCase())){
            return res.status(200).json({status: false, data:null, message:'Provided private key is not associated with sender wallet'})
        }
        
        //validate receiver address
        if(web3.utils.isAddress(req.body.to)){
            web3.eth.getBalance(req.body.from)
            .then(async (bal)=>{
                var balanceInEth = parseFloat(web3.utils.fromWei(bal, 'ether'))
                var gasPrice = await web3.eth.getGasPrice();
                var gasLimit = 23000;
                var tx_fees= parseFloat(web3.utils.fromWei((gasLimit * gasPrice * 1.3).toString(),'ether'))
                if(balanceInEth >= req.body.amount + tx_fees){
                    var from = req.body.from
                    var to = req.body.to
                    var amount = (req.body.amount).toString()
                    var txCount = await web3.eth.getTransactionCount(from,'pending');
                    var rawTransaction = {
                        nonce: web3.utils.toHex(txCount),
                        gasPrice: web3.utils.toHex(parseInt(gasPrice * 1.1)),
                        gasLimit: web3.utils.toHex(gasLimit),
                        to:to,
                        value: web3.utils.toHex(web3.utils.toWei(amount)),
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
                        return res.status(200).json({status: false, data:e, message:'error while sending transaction'})  
                    })
                }else{
                    return res.status(200).json({status: false, data:balanceInEth, message:'insufficient ether balance in your wallet!'})
                }
            })
            .catch(r=>{
                return res.status(200).json({status: false, data:r, message:'error while initiating transaction'})  
            })
        }else{
            return res.status(200).json({status: false, data:null, message:'invalid receiver address, please provide valid address '})
        }
    }
})

    

module.exports = router