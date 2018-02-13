 /*!
  * @title eth_svc Ethereum API microservice
  * @author Oleg Tomin - <2tominop@gmail.com>
  * @dev Basic implementaion of Ethereum API functions  
  * MIT Licensed Copyright(c) 2018-2019
  */

 const express = require("express"),
     app = express(),
     axios = require('axios'),
     urlEth = 'http://10.20.40.5:8080/',
     token = ''
//     urlEth = 'https://rinkeby.infura.io/',
//     token = 'Yqt5FtYMQRGrpp6GSnVe'
 var Web3 = require("web3"),
     Eth3 = '',
     alice = require("../../private/keystore/alice"), //  address and private key in Ethereum (Youdex) and Bitcoin;
     bob = require("../../private/keystore/bob") //  address and private key in Ethereum (Youdex) and Bitcoin;

 app.get("/eth/api/", (req, res) => {
     Eth3 = new Web3(new Web3.providers.HttpProvider(urlEth + token))
     Eth3.eth.getGasPrice(function(error, result) {
         if (!error) {
             res.header("Access-Control-Allow-Origin", "*")
             res.json({ error: false, host: urlEth, gasPrice: result })
         } else {
             res.header("Access-Control-Allow-Origin", "*")
             res.json({ error: true })
             console.log('Error! p: ' + provider.host + ' not connected!!!')
         }
     })
 })

 app.get("/eth/balance/:name", (req, res) => {
     const addrs = eval(req.params.name).ethAddrs,
         balance = Eth3.eth.getBalance(addrs) / 10 ** 18;
     res.header("Access-Control-Allow-Origin", "*")
     res.json({ balance: balance, address: addrs })
 })

 const port = process.env.PORT_ETH || 8200

 app.listen(port, () => {
     console.log(`Microservice eth_svc listening on ${port}`)
 })