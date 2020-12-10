/* jshint node: true */

var express = require('express');
var cookieParser = require('cookie-parser');
var bodyParser = require('body-parser');
var validator = require('express-validator');
var ejs = require('ejs');
var engine = require('ejs-mate');
var session = require('express-session');
var mongoose = require('mongoose');
var mongostore = require('connect-mongo')(session);
var passport = require('passport');
var flash = require('connect-flash');

var app = express();

app.use(express.static('public'));
app.engine('ejs', engine);
app.set('view engine', 'ejs');
app.use(cookieParser());
app.use(bodyParser.urlencoded({extended: true}));
app.use(bodyParser.json());
app.use(validator());
app.use(flash());

require('./routes/routes')(app);
require('./routes/listing')(app);
require('./routes/search')(app);


app.listen(3000, function () {
    console.log('App running on port 3000');
});

