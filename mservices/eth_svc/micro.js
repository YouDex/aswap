/*!
 * @title eth_svc Ethereum API microservice
 * @author Oleg Tomin - <2tominop@gmail.com>
 * @dev Basic implementaion of Ethereum API functions  
 * MIT Licensed Copyright(c) 2018-2019
 */

const express = require("express"),
    app = express(),
    axios = require("axios"),
    urlEth = "http://10.20.40.5:8080/",
    token = "",
    //     urlEth = 'https://rinkeby.infura.io/',
    //     token = 'Yqt5FtYMQRGrpp6GSnVe'
    Web3 = require("web3"),
    EthJS = require("ethereumjs-tx"),
    gasLimit = 4700000,
    alice = require("../../private/keystore/alice"), //  address and private key in Ethereum (Youdex) and Bitcoin;
    bob = require("../../private/keystore/bob"); //  address and private key in Ethereum (Youdex) and Bitcoin;

var gasPrice = 0;
Eth3 = "";

//  Route - userActive function 
app.get("/eth/user/:data", (req, res) => {
    res.header("Access-Control-Allow-Origin", "*");
    res.json({ busy: false });    
})


app.get("/eth/api/", (req, res) => {
    Eth3 = new Web3(new Web3.providers.HttpProvider(urlEth + token));
    Eth3.eth.getGasPrice(function(error, result) {
        if (!error) {
            gasPrice = result;
            res.header("Access-Control-Allow-Origin", "*");
            res.json({ error: false, host: urlEth, gasPrice: result });
        } else {
            res.header("Access-Control-Allow-Origin", "*");
            res.json({ error: true });
            console.log("Error! p: " + provider.host + " not connected!!!");
        }
    });
});

app.get("/eth/balance/:name", (req, res) => {
    //    const Eth3 = new Web3(new Web3.providers.HttpProvider(urlEth + token));
    const addrs = eval(req.params.name).ethAddrs;
    Eth3.eth.getBalance(addrs, function(error, result) {
        if (!error) {
            balance = result / 10 ** 18;
            res.header("Access-Control-Allow-Origin", "*");
            res.json({ error: false, balance: balance, address: addrs });
        } else {
            res.header("Access-Control-Allow-Origin", "*");
            res.json({ error: true });
            console.log("Error! p: " + provider.host + " not connected!!!");
        }
    })
});

//  Route - makeTX function
app.get("/eth/makeTX/:data", (req, res) => {
        const data = JSON.parse(req.params.data),
            from = eval(data.from).ethAddrs,
            to = eval(data.to).ethAddrs,
            valueE = data.valueE;
        Eth3.eth.getTransactionCount(from, function(error, result) {
            if (!error) {
                countTx = result;
                const txParams = {
                    nonce: Eth3.toHex(countTx),
                    gasPrice: Eth3.toHex(gasPrice),
                    gasLimit: Eth3.toHex(gasLimit),
                    to: to,
                    value: Eth3.toHex(valueE),
                    data: "0x0"
                        // EIP 155 chainId - mainnet: 1, ropsten: 3, 1337 - private
                        // chainId: YODA3.toHex(1337)
                };
                console.log(txParams.nonce + " " + txParams.gasPrice + " " +
                    txParams.gasLimit + " " + txParams.to + " " + txParams.value +
                    " " + txParams.data);
                var tx = new EthJS(txParams);
                console.log("tx success key " + eval(data.from).ethKey);
                const privateKey = new Buffer(eval(data.from).ethKey, "hex");
                tx.sign(privateKey);
                var serializedTx = tx.serialize();
                Eth3.eth.sendRawTransaction("0x" + serializedTx.toString("hex"), function(
                    err, hash) {
                    if (!err) {
                        console.log(data.from + " ETH Tx hash " + hash);
                        res.header("Access-Control-Allow-Origin", "*");
                        res.json({ hash: hash });
                    } else {
                        console.log(err);
                        //            var err = new Error(err)
                        err.status = 501;
                        res.header("Access-Control-Allow-Origin", "*");
                        res.send(err);
                    }
                });
            } else {
                res.header("Access-Control-Allow-Origin", "*");
                res.json({ error: true });
                console.log("Error! p: " + provider.host + " not connected!!!");
            }
        });
    })
    //  Route - waitTx function
app.get("/eth/waitTx/:data", (req, res) => {
    hash = req.params.data;
    console.log("wait ETH confirmation tx " + hash)
    var interval;
    var timeOut = setTimeout(function() {
        clearInterval(interval);
        var err = new Error("Error while mining ETH Tx in next 1 min.");
        err.status = 504;
        console.log(err);
        res.header("Access-Control-Allow-Origin", "*");
        res.send(err);
    }, 60000);
    interval = setInterval(function() {
        var block;
        Eth3.eth.getTransaction(hash, function(error, result) {
            if (!error) {
                block = result;
                if (block != null) {
                    if (block.blockNumber > 0) {
                        console.log("Tx is confirmed in block " + block.blockNumber);
                        res.header("Access-Control-Allow-Origin", "*");
                        res.json({ block: block.blockNumber });
                        clearTimeout(timeOut);
                        clearInterval(interval);
                    }
                }
            } else {
                res.header("Access-Control-Allow-Origin", "*");
                res.json({ error: true });
                console.log("Error! p: " + provider.host + " not connected!!!");
            }
        });
    }, 2000);
});

const port = process.env.PORT_ETH || 8200;

app.listen(port, () => {
    console.log(`Microservice eth_svc listening on ${port}`);
});