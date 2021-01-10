module.exports = (app) => {
    
    app.get('/', (req, res, next) => {
        if (req.user !== undefined) {loggedIn = true} else {loggedIn = false};
        res.render('index', {title: 'Recko', loggedIn: loggedIn});
    });
    
};