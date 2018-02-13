 /*!
  * @title yoda_svc Youdex API microservice
  * @author Oleg Tomin - <2tominop@gmail.com>
  * @dev Basic implementaion of YouDEX API functions  
  * MIT Licensed Copyright(c) 2018-2019
  */

 const express = require("express"),
     app = express(),
     axios = require('axios'), //  AXIOS - compact lib for HttpRequest
     urlYoudex = 'http://10.20.40.5:8080/'; //  JSON-RPC server Youdex node

 var Web3 = require("web3"),
     EthJS = require("ethereumjs-tx"),
     YODA3 = tokenContract = dexContract = '', //  init variables
     gasPrice = 0,
     gasLimit = 4700000,
     YODA = require("./token"), // address and ABI of YODA smart contract in Youdex
     dex = require("./contract"), // address and ABI of DEX smart contract in Youdex
     alice = require("../../private/keystore/alice"), //  address and private key in Ethereum (Youdex) and Bitcoin;
     bob = require("../../private/keystore/bob"), //  address and private key in Ethereum (Youdex) and Bitcoin;
     plasmoid = require("../../private/keystore/plasmoid"); //  address and private key in Ethereum (Youdex);


 //  Route - check connect to API provider
 app.get("/YODA/api/", (req, res) => {
     YODA3 = new Web3(new Web3.providers.HttpProvider(urlYoudex))
     tokenContract = YODA3.eth.contract(YODA.abi).at(YODA.address) // YODA token smart contract in YODAx
     DExContract = YODA3.eth.contract(dex.abi).at(dex.address) //  Dex smart contract in Youdex
     YODA3.eth.getGasPrice(function(error, result) { //  calculate gas price
         if (!error) {
             gasPrice = result
             res.header("Access-Control-Allow-Origin", "*")
             res.json({ error: false, host: urlYoudex, gasPrice: result })
         } else {
             res.header("Access-Control-Allow-Origin", "*")
             res.json({ error: true })
             console.log('Error! p: ' + provider.host + ' not connected!!!')
         }
     })
 })

 //  Route - check balance of YODA tokens
 app.get("/YODA/balance/:name", (req, res) => {
     const addrs = eval(req.params.name).ethAddrs,
         balance = tokenContract.balanceOf(addrs) / 10 ** 9;
     res.header("Access-Control-Allow-Origin", "*")
     res.json({ balance: balance, address: addrs })
 })

 //  Route - startDex function 
 app.get("/YODA/startDEX/:data", (req, res) => {
     const data = JSON.parse(req.params.data),
         valueA = data.valueA, //  value of Alice's coins
         valueB = data.valueB, //  value of Bob's coins
         valueY = data.valueY;//  value of YODA tokens for pledge
     orderID = 0;
     var filter = DExContract.StartDEx({
         maker: alice.ethAddrs
     });
     console.log('set filter for contract event');
     filter.watch(function(err, event) {
         if (!err) {
             filter.stopWatching();
             res.header("Access-Control-Allow-Origin", "*");
             res.json({
                 id: event.args._order,
                 maker: event.args.maker,
                 taker: event.args.taker,
                 plasmoid: event.args.plasmoid,
                 ethAmount: event.args.ethAmount,
                 btcAmount: event.args.btcAmount,
                 pledgeYODAAmount: event.args.pledgeYODAamount
             })
         } else {
             console.log("Error " + err)
             var err = new Error(err)
             err.status = 501
             res.header("Access-Control-Allow-Origin", "*");
             res.send(err)
         };
     });
     var myCallData = DExContract.openDEx.getData(alice.ethAddrs, plasmoid.ethAddrs, valueB * 10 ** 18, valueA * 10 ** 8, valueY * 10 ** 9);
     var countTx = YODA3.eth.getTransactionCount(bob.ethAddrs);
     var txParams = {
             nonce: YODA3.toHex(countTx),
             gasPrice: YODA3.toHex(gasPrice),
             gasLimit: YODA3.toHex(gasLimit),
             to: dex.address,
             value: '0x0',
             data: myCallData
             // EIP 155 chainId - mainnet: 1, ropsten: 3, 1337 - private
            // chainId: YODA3.toHex(1337)
         };
     console.log(txParams.nonce + ' ' + txParams.gasPrice + ' ' + txParams.gasLimit + ' ' + txParams.to + ' ' + txParams.value + ' ' + txParams.data);
     var tx = new EthJS(txParams);
     console.log('tx success bob_key ' + bob.ethKey);
     const privateKey = new Buffer(bob.ethKey, 'hex');
     tx.sign(privateKey);
     var serializedTx = tx.serialize();
     YODA3.eth.sendRawTransaction('0x' + serializedTx.toString('hex'), function(err, hash) {
        if (!err) console.log("Tx hash " + hash); 
        else {
            console.log(err)
//            var err = new Error(err)
            err.status = 501
            res.header("Access-Control-Allow-Origin", "*");
            res.send(err)
        };         
     });
 })

 //  Route - makeTX function 
 app.get("/YODA/makeTX/:data", (req, res) => {
    const data = JSON.parse(req.params.data),
        from = eval(data.from).ethAddrs,
        to = eval(data.to).ethAddrs,
        valueY = data.valueY;
    var filter = tokenContract.Transfer({
        from: from,
        to: to
    }),
    hashTx = "";
    filter.watch(function(err, event) {
        if (!err) {
            filter.stopWatching();
            res.header("Access-Control-Allow-Origin", "*");
            res.json({hash: hashTx})
        } else {
            console.log("Error " + err)
            var err = new Error(err)
            err.status = 501
            res.header("Access-Control-Allow-Origin", "*");
            res.send(err)
        };
    });
    var myCallData = tokenContract.transfer.getData(to, valueY * 10 ** 9);
    var countTx = YODA3.eth.getTransactionCount(from);
    var txParams = {
            nonce: YODA3.toHex(countTx),
            gasPrice: YODA3.toHex(gasPrice),
            gasLimit: YODA3.toHex(gasLimit),
            to: YODA.address,
            value: '0x0',
            data: myCallData
            // EIP 155 chainId - mainnet: 1, ropsten: 3, 1337 - private
           // chainId: YODA3.toHex(1337)
        };
    console.log(txParams.nonce + ' ' + txParams.gasPrice + ' ' + txParams.gasLimit + ' ' + txParams.to + ' ' + txParams.value + ' ' + txParams.data);
    var tx = new EthJS(txParams);
    console.log('tx success key ' + eval(data.from).ethKey);
    const privateKey = new Buffer(eval(data.from).ethKey, 'hex');
    tx.sign(privateKey);
    var serializedTx = tx.serialize();
    YODA3.eth.sendRawTransaction('0x' + serializedTx.toString('hex'), function(err, hash) {
       if (!err) {
            hashTx = hash;
            console.log("Tx hash " + hash); 
       }
       else {
           console.log(err)
//            var err = new Error(err)
           err.status = 501
           res.header("Access-Control-Allow-Origin", "*");
           res.send(err)
       };         
    });
})


 const port = process.env.PORT_YODA || 8201

 app.listen(port, () => {
     console.log(`microservice YODA_svc listening on ${port}`)
 })

 function a() {

 }