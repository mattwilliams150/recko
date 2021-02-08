/* jshint node: true */

require('dotenv').config();
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

mongoose.Promise = global.Promise;
mongoose.connect(process.env.MONGODB_URI, {
   useNewUrlParser: true,
   useUnifiedTopology: true
 });

require('./config/passport');

// only allow localhost or testing IPs.
app.use(function (req, res, next) {
    let host = req.get('host');
    let testip = req.headers['x-forwarded-for'];
    let ipregex = new RegExp(process.env.TESTINGIP);

    if (host != 'localhost:8080' && !/^www\./i.test(host) && !/.*(\/vendor\/|\/img\/|\/js\/|\/css\/).*/i.test(req.url)) {
        href = "https://www.recko.co.uk" + req.url;
        res.redirect(href);
    }

    if (host == 'localhost:8080' || ipregex.test(testip) || process.env.ENVIRONMENT == 'production') {
        next();
    } else {
        res.end();
        console.log('IP Denied: ' + testip);
    };
});
// require('./secret/secret');

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
require('./routes/blog')(app);
require('./routes/user')(app, passport);

app.listen(process.env.PORT, function () {
    console.log('App running on port 8080');
});
