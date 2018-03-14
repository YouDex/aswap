/*!
 * @title btc3_svc BTC API microservice for tesnet3
 * @author Oleg Tomin - <2tominop@gmail.com>
 * @dev Basic implementaion of BTC3 API functions  
 * MIT Licensed Copyright(c) 2018-2019
 */

const express = require("express"),
    app = express(),
    axios = require("axios"), //  AXIOS - compact lib for HttpRequest
    alice = require("../../private/keystore/alice"), //  address and private key in Ethereum (Youdex) and Bitcoin;
    bob = require("../../private/keystore/bob"), //  address and private key in Ethereum (Youdex) and Bitcoin;
    btc = require("../../private/keystore/btc"), //  Blochcypher API provider for Bitcoin mainnet
    bitcoin = require("bitcoinjs-lib"),
    testnet = bitcoin.networks.testnet,
    bigi = require("bigi"),
    buffer = require("buffer"),
    WebSocket = require("ws");
Tx = require("../../private/twist/models/transactions");

unconfirmedTxHash = "Nan, try get btc/ws/addr";
isConfirmed = false;
wsIsLive = false;
wsIsNeed = undefined;
ws = null;

//  Configure mongoDB
const dbConfig = require("../../private/twist/db"),
    mongoose = require("mongoose");
// Connect to DB
mongoose.connect(dbConfig.url, {
    useMongoClient: true
});

mongoose.Promise = require("bluebird");

Date.prototype.toYMDTString = function() {
    return isNaN(this) ?
        "NaN" : [
            this.getFullYear(),
            this.getMonth() > 8 ? this.getMonth() + 1 : "0" + (this.getMonth() + 1),
            this.getDate() > 9 ? this.getDate() : "0" + this.getDate()
        ].join("/") +
        " " + [
            this.getUTCHours() < 10 ?
            "0" + this.getUTCHours() :
            this.getUTCHours(),
            this.getMinutes() < 10 ? "0" + this.getMinutes() : this.getMinutes(),
            this.getSeconds() < 10 ? "0" + this.getSeconds() : this.getSeconds()
        ].join(":");
};

myErrorHandler = function(message, res) {
    if (res) res.json({ error: true, response: "Error: " + message });
    console.log((new Date()).toYMDTString() + "Error: " + message);
};

//  CORS
app.use(function(req, res, next) {
    // Website you wish to allow to connect
    res.setHeader("Access-Control-Allow-Origin", "*");
    // Request methods you wish to allow
    res.setHeader(
        "Access-Control-Allow-Methods",
        "GET, POST, OPTIONS, PUT, PATCH, DELETE"
    );
    // Request headers you wish to allow
    res.setHeader(
        "Access-Control-Allow-Headers",
        "X-Requested-With,content-type"
    );
    // Set to true if you need the website to include cookies in the requests sent
    // to the API (e.g. in case you use sessions)
    res.setHeader("Access-Control-Allow-Credentials", true);
    // Pass to next layer of middleware
    next();
});

//  Route - userActive function
app.get("/btc3/user/:data", (req, res) => {
    res.json({ busy: false });
});

//  Route - userActive function
app.get("/btc3/txhash/", (req, res) => {
    res.json({ hash: unconfirmedTxHash, confirmation: isConfirmed });
    //    unconfirmedTxHash = 'Nan, try get btc/ws/addr';
});

//  Route - check connect to API provider
app.get("/btc3/api/", (req, res) => {
    axios
        .get(btc.url)
        .then(response => {
            res.json({
                error: false,
                host: btc.url,
                btcFee: response.data.medium_fee_per_kb
            });
        })
        .catch(error => {
            res.json({ error: true });
            console.log("Error! p: " + btc.url + " not connected!!!");
        });
});

//  Route - balance of address
app.get("/btc3/balance/:name", (req, res) => {
    //  Standart format API
    const addrsBTC = eval(req.params.name).btcAddrs;
    axios
        .get(btc.url + "/addrs/" + addrsBTC + "/balance")
        .then(response => {
            res.json({
                balance: response.data.final_balance / 10 ** 8,
                address: addrsBTC
            });
        })
        .catch(error => {
            console.log(error);
            var err = new Error("BTC API service not aviable");
            err.status = 501;

            res.send(err);
        });
});

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
    axios
        .post(btc.url + "/txs/new?token=" + btc.token, JSON.stringify(newtx))
        .then(response => {
            var tmptx = response.data;
            tmptx.pubkeys = [];
            //            console.log(tmptx);
            tmptx.signatures = tmptx.tosign.map(function(tosign, n) {
                tmptx.pubkeys.push(keys.getPublicKeyBuffer().toString("hex"));
                return keys
                    .sign(new buffer.Buffer(tosign, "hex"))
                    .toDER()
                    .toString("hex");
            });
            // sending back the transaction with all the signatures to broadcast
            axios
                .post(btc.url + "/txs/send?token=" + btc.token, JSON.stringify(tmptx))
                .then(response => {
                    console.log("Tx hash " + response.data.tx.hash);

                    res.json({
                        error: false,
                        hash: response.data.tx.hash,
                        time: response.data.tx.received
                    });
                })
                .catch(error => {
                    console.log(error);
                    err = new Error("BTC API service dropped Tx");
                    err.status = 504;

                    res.json({ error: true });
                });
        })
        .catch(error => {
            console.log(error);

            res.json({ error: true });
        });
});

app.get("/btc3/ws/:addrs", (req, res) => {
    if (!wsIsLive)
        startWS("wss://socket.blockcypher.com/v1/btc/test3", req.params.addrs, res);
    else res.json({ error: false });
});

function startWS(url, addrs, res) {
    wsIsNeed = addrs;
    // Get latest unconfirmed transactions live
    ws = new WebSocket(url);
    var count = 0;
    ws.on("message", function incoming(event) {
        wsIsLive = true;
        if (event.length < 20) return;
        var tx = JSON.parse(event);
        TxHash = tx.hash;
        Tx.findOne({ hashTx: TxHash }).exec(function(err, incomingTx) {
            if (err) return myErrorHandler("incoming Tx: " + err.message);
            // returns stories that have Bob's id as their author.
            if (incomingTx != null) incomingTx.confirmTx = tx.confirmations;
            else {
                addrFrom = tx.inputs[0].addresses[0];
                addrTo = tx.outputs[0].addresses[0];
                value = tx.outputs[0].value;
                incomingTx = new Tx({
                    hashTx: tx.hash,
                    createDateUTC: tx.received,
                    confirmTx: tx.confirmations,
                    addrFrom: addrFrom,
                    value: value,
                    To: addrTo
                });
            }
            incomingTx.save(function(err) {
                if (err) myErrorHandler(err.message);
            });
        });
        confirmations = tx.confirmations;
        if (confirmations > 0) isConfirmed = true;
        console.log("tx hash " + TxHash + "; confirmations " + confirmations);
    });
    ws.on("open", function open() {
        ws.send(
            JSON.stringify({ event: "unconfirmed-tx", address: addrs }),
            function ask(error) {
                if (error) myErrorHandler("error.message", res);
                else {
                    if (res) res.send("ws1 connected on " + url);
                    console.log("ws1 connected on " + url);
                    wsIsLive = true;
                }
            }
        );
        ws.send(
            JSON.stringify({
                event: "confirmed-tx",
                address: addrs,
                confirmations: 1
            }),
            function ask1(error) {
                if (error) myErrorHandler("error.message");
                else {
                    console.log("ws2 connected on " + url);
                }
            }
        );
    });
    ws.on("close", function close() {
        console.log("ws disconnected, try restart");
        wsIsLive = false;
    });
}

//  Route - waitTx function
app.get("/btc3/waitTx/:data", (req, res) => {
    hash = req.params.data;
    var interval;
    var timeOut = setTimeout(function() {
        clearInterval(interval);
        var err = new Error("Error while mining BTC Tx in next 30 min.");
        err.status = 504;
        console.log(err);

        res.send(err);
    }, 1800000);
    interval = setInterval(function() {
        axios
            .get(btc.url + "/txs/" + hash)
            .then(response => {
                console.log("tx " + response.data.hash);
                if (response.data.confirmations > 0) {
                    console.log("BTC Tx block " + response.data.block_height);

                    res.json({ block: response.data.block_height });
                    clearTimeout(timeOut);
                    clearInterval(interval);
                }
            })
            .catch(error => {
                console.log(error);
                err = new Error("BTC API service not aviable");
                err.status = 501;

                res.send(err);
            });
    }, 30000);
});

//  Route - balance of address
app.post("/btc3/txconfirm", (req, res) => {
    console.log(req);
    isConfirmed = true;
});

setInterval(() => {
    if (wsIsLive) ws.send(JSON.stringify({ event: "ping" }));
    else if (wsIsNeed)
        startWS("wss://socket.blockcypher.com/v1/btc/test3", wsIsNeed);
}, 20000);

const port = process.env.PORT_BTC3 || 8103;

app.listen(port, () => {
    console.log(
        new Date().toString() + `: Microservice btc_svc listening on ${port}`
    );
});