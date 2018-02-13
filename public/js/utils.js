/*!
 * @title utils JavaScript functions library for Atomic swap demo
 * @author Oleg Tomin - <2tominop@gmail.com>
 * @dev Basic implementaion of JavaScript functions  
 * MIT Licensed Copyright(c) 2018-2019
 */

var isEthApi = isBtcApi = isYODAApi = false,
    btcFee = 0


//  Init APIs function
function initApi() {
    $.get(hostEthApi + 'api/')
        .then(function(d) {
            if (!d.error) {
                isEthApi = true
                gasPrice = d.gasPrice
                console.log('ETH API enabled on host: ' + d.host + ', gasPrice=' + gasPrice / 10 ** 9 + ' Gwei')
            } else {
                isEthApi = false
                gasPrice = 0
                console.log('!!!ETH API NOT enabled. Microservice says: Infura.io not response')
            }
        })
        .fail(function(err) {
            isEthApi = false
            if (err.status == 0) console.log('!!!ETH API Microservice not runs')
            else console.log('!!!ETH API NOT enabled!!! Microservice says: ' + err.responseText)
        })
    $.get(hostBtcApi + 'api/')
        .then(function(d) {
            if (!d.error) {
                isBtcApi = true
                btcFee = d.btcFee / 2 //  let TX size 500 byte 
                console.log('BTC API enabled on host: ' + d.host + ', btcFee=' + btcFee + 'Sat')
            } else {
                isBtcApi = false
                console.log('!!!BTC API NOT enabled. Microservice says: Blockcypher.com not response')
            }
        })
        .fail(function(err) {
            isBtcApi = false
            if (err.status == 0) console.log('!!!BTC API Microservice not runs')
            else console.log('!!!BTC API NOT enabled!!! Microservice says: ' + err.responseText)
        })
    $.get(hostYODAApi + 'api/')
        .then(function(d) {
            if (!d.error) {
                isYODAApi = true
                gasPrice = d.gasPrice
                console.log('YODA API enabled on host: ' + d.host + ', gasPrice=' + gasPrice / 10 ** 9 + ' Gwei')
            } else {
                isYODAApi = false
                gasPrice = 0
                console.log('!!!YODA API NOT enabled. Microservice says: YODAx node not response')
            }
        })
        .fail(function(err) {
            isYODAApi = false
            if (err.status == 0) console.log('!!!YODA API Microservice not runs')
            else console.log('!!!YODA API NOT enabled!!! Microservice says: ' + err.responseText)
        })
}

//  ShowBalanses function
function showBalances() {
    var timeOut = timeOut1 = timeOut2 = ""
    if (!isEthApi) {
        timeOut = setTimeout(function() {
            if (isEthApi) {
                balanceEth('alice')
                balanceEth('bob')
            } else showMess('Init ETH API error!')
        }, 3000)
    } else {
        balanceEth('alice')
        balanceEth('bob')
    }
    if (!isBtcApi) {
        timeOut1 = setTimeout(function() {
            if (isBtcApi) {
                balanceBtc('alice')
                balanceBtc('bob')
            } else showMess('Init BTC API error!')
        }, 3000)
    } else {
        balanceBtc('alice')
        balanceBtc('bob')
    }
    if (!isYODAApi) {
        timeOut2 = setTimeout(function() {
            if (isYODAApi) {
                balanceYODA('alice')
                balanceYODA('bob')
                balanceYODA('plasmoid')
            } else showMess('Init YODA API error!')
        }, 3000)
    } else {
        balanceYODA('alice')
        balanceYODA('bob')
        balanceYODA('plasmoid')
    }
}

function balanceEth(user) {
    $.get(hostEthApi + 'balance/' + user)
        .then(function(d) {
            var summETH = d.balance,
                addrsETH = d.address;
            document.getElementById(user + 'Eth').innerText = ' ' + addrsETH + ' ';
            document.getElementById(user + 'EthBalance').innerText = summETH.toFixed(3);
            if (user == "bob") summETHB = summETH
            console.log(user + '  ' + addrsETH + '  ' + summETH)
        })
        .fail(function(err) {
            document.getElementById(user + 'EthBalance').innerText = ' NaN ';
            console.log(err.status + err.responseText)
        })
}

function balanceBtc(user) {
    $.get(hostBtcApi + 'balance/' + user)
        .then(function(d) {
            const summBTC = d.balance,
                addrsBTC = d.address;
            document.getElementById(user + 'Btc').innerText = ' ' + addrsBTC + ' ';
            document.getElementById(user + 'BtcBalance').innerText = summBTC.toFixed(6);
            if (user == "alice") showOrder(summBTC);
            console.log(user + '  ' + addrsBTC + '  ' + summBTC)
        })
        .fail(function(err) {
            document.getElementById(user + 'BtcBalance').innerText = ' NaN ';
            console.log(err.status + err.responseText)
        })
}

function balanceYODA(user) {
    $.get(hostYODAApi + 'balance/' + user)
        .then(function(d) {
            var summETH = d.balance,
                addrsETH = d.address;
            document.getElementById(user + 'YODA').innerText = ' ' + addrsETH + ' ';
            document.getElementById(user + 'YODABalance').innerText = summETH.toFixed(3);
            if (user == "alice") summYODAA = summETH;
            else if (user == "bob") summYODAB = summETH;
            else if (user == "plasmoid") summYODAP = summETH;
            console.log(user + '  ' + addrsETH + '  ' + summETH)
        })
        .fail(function(err) {
            document.getElementById(user + 'YODABalance').innerText = ' NaN ';
            console.log(err.status + err.responseText)
        })
}

function showPrices() {
    $.get(hostPrice + '/ethereum/')
        .then(function(d) {
            var ethPriceBTC_s = d[0].price_btc;
            var ethPriceUSD_s = d[0].price_usd;
            ethPriceBTC = parseFloat(ethPriceBTC_s);
            ethPriceUSD = parseFloat(ethPriceUSD_s);
            YODAPrice = (1.0 / 1000.0).toFixed(6);
            YODAPrice_s = YODAPrice.toString();
            document.getElementById('plasmoidPrices').innerText = 'ETH/BTC= ' + ethPriceBTC_s + '; ETH/USD= ' + ethPriceUSD_s + '; YODA/ETH= ' + YODAPrice_s + ';';
        });
}

function showOrder(paramBTC) {
    valueBTC = paramBTC - btcFee / 10 ** 8;
    summBTCA = paramBTC;
    document.getElementById('summBTCA').value = valueBTC.toFixed(6);
    valueETH = valueBTC / ethPriceBTC;
    valueYODA = valueETH / YODAPrice;
    document.getElementById('summETHA').value = valueETH.toFixed(3);
    document.getElementById('summYODAA').value = valueYODA.toFixed(3);
}

function showMess(s) {
    nStr = nStr + 1;
    document.getElementById('progressStatus').innerText = s;
    console.log(timeNow + ': ' + s);
}

//  Order's functions

function calcEth() {
    valueBTC = document.getElementById('summBTCA').value;
    valueETH = valueBTC / ethPriceBTC;
    valueYODA = valueETH / YODAPrice;
    document.getElementById('summETHA').value = valueETH.toFixed(3);
    document.getElementById('summYODAA').value = valueYODA.toFixed(3);
}

function calcBtc() {
    valueETH = document.getElementById('summETHA').value;
    valueBTC = valueETH * ethPriceBTC;
    valueYODA = valueETH / YODAPrice;
    document.getElementById('summBTCA').value = valueBTC.toFixed(6);
    document.getElementById('summYODAA').value = valueYODA.toFixed(3);
}

function placeOrder() {
    var err = false,
        errStr = '';
    nStr = 0; //  Init log string number 
    valueBTC = parseFloat(document.getElementById('summBTCA').value);
    valueETH = parseFloat(document.getElementById('summETHA').value);
    valueYODA = parseFloat(document.getElementById('summYODAA').value);
    var err = false,
        errStr = '';
    showMess("Alice places order: " + valueBTC.toFixed(6) + "BTC to  " + valueETH.toFixed(3) + "ETH with pledge:" + valueYODA.toFixed(3) + "YODA");
    if (valueBTC > summBTCA) {
        errStr = 'Alice has not enough BTC! ';
        err = true;
    };
    if (valueETH > summETHB) {
        errStr = errStr + 'Bob has not enough ETH! ';
        err = true;
    };
    if (valueYODA > summYODAA) {
        errStr = errStr + 'Alice has not enough YODA! ';
        err = true;
    };
    if (valueYODA > summYODAB) {
        errStr = errStr + 'Bob has not enough YODA! ';
        err = true;
    };
    if (err) {
        document.getElementById('aliceStatus').innerText = errStr + 'Please, correct this!';
        return
    };
    document.getElementById('summBTCB').value = valueBTC.toFixed(6);
    document.getElementById('summETHB').value = valueETH.toFixed(3);
    document.getElementById('summYODAB').value = valueYODA.toFixed(3);
    document.getElementById('aliceStatus').innerText = 'Order sent, waiting for order accept';
    document.getElementById('bobStatus').innerText = 'Order received, waiting for order accept';
    semafor(0, 1, 0);
}

function fillOrder() {
    showMess("Bob accepts order: " + valueBTC.toFixed(3) + "BTC to  " + valueETH.toFixed(3) + "ETH with pledge:" + valueYODA.toFixed(3) + "YODA");
    stepN = 0;
    orderID = 0;
    nextStep();
    semafor(0, 0, 1);
}

function semafor(a, b, c) {
    if (a == 1) document.getElementById('aliceLed').style = redLed;
    else if (a == 0) document.getElementById('aliceLed').style = greenLed;
    if (b == 1) document.getElementById('bobLed').style = redLed;
    else if (b == 0) document.getElementById('bobLed').style = greenLed;
    if (c == 1) document.getElementById('plasmoidLed').style = redLed;
    else if (c == 0) document.getElementById('plasmoidLed').style = greenLed;
    var start = new Date().getTime();
    for (var i = 0; i < 1e7; i++) {
        if ((new Date().getTime() - start) > 2 * 1000) {
            break;
        }
    }
    return false;
}

function sendEth1() {
    var Tx = makeEthTX(addrsETHB, ethPrivateKeyB, addrsETHA, valueETH);
    Eth3.eth.sendRawTransaction(Tx, function(err, hash) {
        if (!err)
            console.log('Success, TXhash: ' + hash);
        else
            console.log('Error: ' + err);
    });
}

function sendCoin(value) {
    valueYODA = value;
    stepN = 6;
    nextStep();
}

function digitalWatch() {
    var s = " a.m.";
    var date = new Date();
    var hours = date.getUTCHours();
    var hours1 = date.getHours();

    var minutes = date.getMinutes();
    var seconds = date.getSeconds();

    if (hours > 12) {
        hours = hours - 12;
        s = " p.m.";
    }
    if (hours < 10) hours = "0" + hours.toString();
    if (minutes < 10) minutes = "0" + minutes;
    if (seconds < 10) seconds = "0" + seconds;
    timeNow = hours + ":" + minutes + ":" + seconds;
    document.getElementById("digital_watch").innerText = hours + ":" + minutes + ":" + seconds + s;
}

function nSleep(n, seconds) {
    var start = new Date().getTime();
    for (var i = 0; i < 1e7; i++) {
        if ((new Date().getTime() - start) > seconds * 1000) {
            break;
        }
    }
    return n + 1;
}

function showDate() {
    var date = new Date();
    document.getElementById("dateNow").innerText = date.toDateString()
}