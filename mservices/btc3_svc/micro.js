/*!
 * @title btc3_svc BTC API microservice for tesnet3
 * @author Oleg Tomin - <2tominop@gmail.com>
 * @dev Basic implementaion of BTC3 API functions  
 * MIT Licensed Copyright(c) 2018-2019
 */

const express = require("express"),
    app = express(),
    axios = require('axios'), //  AXIOS - compact lib for HttpRequest
    token = 'c97f6432c2ba4d3b8d3ced1407e9ec0a', // for main net
    alice = require("../../private/keystore/alice"), //  address and private key in Ethereum (Youdex) and Bitcoin;
    bob = require("../../private/keystore/bob"), //  address and private key in Ethereum (Youdex) and Bitcoin;
    btcUrl = 'https://api.blockcypher.com/v1/btc/test3', //  Blochcypher API provider for Bitcoin testnet3
    bitcoin = require("bitcoinjs-lib"),
    testnet = bitcoin.networks.testnet,
    bigi = require("bigi"),
    buffer = require('buffer');


//  Route - userActive function 
app.get("/btc3/user/:data", (req, res) => {
    res.header("Access-Control-Allow-Origin", "*");
    res.json({ busy: false });    
})

    //  Route - check connect to API provider
app.get("/btc3/api/", (req, res) => {
    axios.get(btcUrl)
        .then(response => {
            res.header("Access-Control-Allow-Origin", "*")
            res.json({ error: false, host: btcUrl, btcFee: response.data.medium_fee_per_kb })
        })
        .catch(error => {
            res.header("Access-Control-Allow-Origin", "*")
            res.json({ error: true })
            console.log('Error! p: ' + btcUrl + ' not connected!!!')
        })
})

//  Route - balance of address
app.get("/btc3/balance/:name", (req, res) => {
    //  Standart format API 
    const addrsBTC = eval(req.params.name).btcAddrs;
    axios.get(btcUrl + '/addrs/' + addrsBTC + '/balance')
        .then(response => {
            res.header("Access-Control-Allow-Origin", "*")
            res.json({ balance: response.data.final_balance / 10 ** 8, address: addrsBTC })
        })
        .catch(error => {
            console.log(error)
            var err = new Error('BTC API service not aviable')
            err.status = 501
            res.header("Access-Control-Allow-Origin", "*")
            res.send(err)
        })
})

//  Route - make, sign, send transfer Tx 
app.get("/btc3/makeTx/:data", (req, res) => {
    const data = JSON.parse(req.params.data),
        from = [eval(data.from).btcAddrs],
        to = [eval(data.to).btcAddrs],
        valueB = Number.parseInt(data.valueB),
        privateKey = eval(data.from).btcKey;
    var keys = bitcoin.ECPair.fromWIF(privateKey, testnet);
    //     var keys = bitcoin.ECPair.fromWIF(my_wif_private_key);   //  for main net
    var newtx = {
        inputs: [{ addresses: from }],
        outputs: [{ addresses: to, value: valueB }]
    };
    axios.post(btcUrl + '/txs/new', JSON.stringify(newtx))
        .then(response => {
            var tmptx = response.data;
            tmptx.pubkeys = [];
            //            console.log(tmptx);
            tmptx.signatures = tmptx.tosign.map(function(tosign, n) {
                    tmptx.pubkeys.push(keys.getPublicKeyBuffer().toString("hex"));
                    return keys.sign(new buffer.Buffer(tosign, "hex")).toDER().toString("hex");
                })
                // sending back the transaction with all the signatures to broadcast
            axios.post(btcUrl + '/txs/send', JSON.stringify(tmptx))
                .then(response => {
                    //                  console.log('Tx hash ' + response.data.tx.hash);
                    res.header("Access-Control-Allow-Origin", "*");
                    res.json({ hash: response.data.tx.hash, time: response.data.tx.received });
                })
                .catch(error => {
                    console.log(error);
                    err = new Error('BTC API service dropped Tx');
                    err.status = 504;
                    res.header("Access-Control-Allow-Origin", "*");
                    res.send(err);
                })
        })
        .catch(error => {
            console.log(error);
            err = new Error('BTC API service not aviable');
            err.status = 501;
            res.header("Access-Control-Allow-Origin", "*");
            res.send(err);
        })
})

//  Route - waitTx function 
app.get("/btc3/waitTx/:data", (req, res) => {
    hash = req.params.data;
    var interval;
    var timeOut = setTimeout(function() {
        clearInterval(interval);
        var err = new Error("Error while mining BTC Tx in next 30 min.");
        err.status = 504;
        console.log(err)
        res.header("Access-Control-Allow-Origin", "*");
        res.send(err);
    }, 1800000);
    interval = setInterval(function() {
        axios.get(btcUrl + '/txs/' + hash)
            .then(response => {
                console.log('tx ' + response.data.hash)
                if (response.data.confirmations > 0) {
                    console.log("BTC Tx block " + response.data.block_height);
                    res.header("Access-Control-Allow-Origin", "*");
                    res.json({ block: response.data.block_height });
                    clearTimeout(timeOut);
                    clearInterval(interval);
                }
            })
            .catch(error => {
                console.log(error);
                err = new Error('BTC API service not aviable');
                err.status = 501;
                res.header("Access-Control-Allow-Origin", "*");
                res.send(err);
            })
    }, 30000);
})

const port = process.env.PORT_BTC3 || 8103

app.listen(port, () => {
    console.log(`Microservice btc_svc listening on ${port}`)
})