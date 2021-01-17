module.exports = (app) => {
    
    app.get('/', (req, res, next) => {

        var ipblocker = require('./ipblocker');
        ipblocker.blockip(req, res);

        if (req.user !== undefined) {loggedIn = true} else {loggedIn = false};
        res.render('index', {title: 'Recko', loggedIn: loggedIn});
    });
    
};
