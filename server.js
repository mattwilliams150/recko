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
var AccessControl = require('express-ip-access-control');

var app = express();

mongoose.Promise = global.Promise;
mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost/recko', {
   useNewUrlParser: true,
   useUnifiedTopology: true
 });

require('./config/passport');
// require('./secret/secret');

app.use(AccessControl({
    mode: 'deny',
    denys: [],
    //allows: ['92.18.75.229'],
    allows: [],
    forceConnectionAddress: false,
    log: function(clientIp, access) {
        console.log(clientIp + (access ? ' accessed.' : ' denied.'));
    },
    statusCode: 401,
    redirectTo: '',
    message: 'Unauthorized'
}));

app.use(express.static('public'));
app.engine('ejs', engine);
app.set('view engine', 'ejs');
app.use(cookieParser());
app.use(bodyParser.urlencoded({extended: true}));
app.use(bodyParser.json());
app.use(validator());

app.use(session({
    secret: 'qDykeBpm6fc3a',
    resave: false,
    saveUninitialized: false,
    store: new mongostore({mongooseConnection: mongoose.connection})
}));

app.use(flash());

app.use(passport.initialize());
app.use(passport.session());

require('./routes/routes')(app);
require('./routes/listing')(app);
require('./routes/search')(app);
require('./routes/user')(app, passport);

app.listen(process.env.PORT || 8080, function () {
    console.log('App running on port 8080');
});
