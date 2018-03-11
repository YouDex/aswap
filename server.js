// ==================================================
var express = require('express');
var app = express();

// ==================================================
app.use(express.static(__dirname + '/public'));
//app.use(express.static('/home/ubuntu/ptb/public'));

app.set('view engine', 'ejs');

// ===================================================
app.get('/', function(req, res) {

    res.render('pages/index');

});

// ==================================================
app.listen(1965);

console.log((new Date()).toString() + ': ASWAP server start on http://localhost:1965');