var locations = require("../config/locations.json");
var helpers = require('./helpers');
var Newsletter = require('../models/newsletter');

module.exports = (app) => {

    app.get('/', (req, res, next) => {
        helpers.articlesThumbnails(function(articles) {
            if (req.user !== undefined) {loggedIn = true} else {loggedIn = false};
            var emailMessage = req.flash('emailMessage');
            res.render('index', {title: 'Recko', loggedIn: loggedIn, locations: locations, articles: articles, emailMessage: emailMessage});
        });
    });

    app.post('/newsletter', (req, res) => {
        var newNewsletter = new Newsletter();
        newNewsletter.email = req.body.email;
        console.log("here" + req.body.email);
        newNewsletter.save((err) => {
            console.log(err);
        });

        req.flash('emailMessage', 'Woohoo you’ve joined the relevance revolution! We will be in touch once Recko is live!')
        res.redirect('/');
    });
};
