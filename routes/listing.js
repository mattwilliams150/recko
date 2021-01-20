var Review = require('../models/review');

module.exports = (app) => {
    app.get('/listing', (req, res) => {
        var placeid = req.query.placeid;
        var title = "Recko"
        if (req.user !== undefined) {loggedIn = true} else {loggedIn = false};
        //var reviews = Review.findOne({'placeid':placeid});
        //console.log(reviews);

        Review.find({'placeid':placeid}, (err, review) => {
            //console.log(review);
            getGooglePlace(placeid)
            .then((place) => res.render('listing', {
                title: title,
                placeid: placeid,
                place: place,
                loggedIn: loggedIn,
                reviews: review
            }))
            .catch(err => res.status(500).send('An error occured'));
        });
    });

    app.post('/listingreview', (req, res) => {
        var newReview = new Review();
        newReview.placeid = req.query.placeid
        newReview.name = req.body.review_name;
        newReview.email = req.body.review_email
        newReview.rating = req.body.review_rating
        newReview.review = req.body.review_review
        newReview.date = Date.now()

        newReview.save((err) => {
            console.log(err);
        });

        res.redirect('/listing?placeid='+req.query.placeid);
    });
}

function getGooglePlace(placeid){
    return new Promise((resolve, reject) => {    
        var gp = require('googleplaces');
        var config = require("../config.js");
        var apikey = process.env.GOOGLE_PLACES_API_KEY || config.apiKey;
        console.log(apikey);
        var googlePlaces = new gp(apikey, config.outputFormat);
        var parameters = {
            reference: placeid
        };
        var place = googlePlaces.placeDetailsRequest(parameters, function (error, response) {
            if (error) {   
                reject(error);
            }
            resolve(response);
        });
    });
};
