module.exports = (app) => {
    
    app.get('/', (req, res, next) => {

        console.log(req.ip);
        console.log(req.headers['x-forwarded-for']);
        console.log(req.connection.remoteAddress);
        console.log(req.socket.remoteAddress);

        if (req.user !== undefined) {loggedIn = true} else {loggedIn = false};
        res.render('index', {title: 'Recko', loggedIn: loggedIn});
    });
    
};
