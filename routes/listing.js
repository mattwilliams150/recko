var Review = require('../models/review');

module.exports = (app) => {
    app.get('/listing', (req, res) => {
        var placeid = req.query.placeid;
        var title = "Recko"
        var clientPlacesApiKey = process.env.CLIENT_GOOGLE_PLACES_API_KEY;
        if (req.user !== undefined) {loggedIn = true} else {loggedIn = false};

        Review.find({'placeid':placeid}, (err, review) => {
            //console.log(review);
            getGooglePlace(placeid)
            .then((place) => res.render('listing', {
                title: title,
                placeid: placeid,
                place: place,
                loggedIn: loggedIn,
                reviews: review,
                clientPlacesApiKey: clientPlacesApiKey
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
        var apikey = process.env.SERVER_GOOGLE_PLACES_API_KEY;
        var googlePlaces = new gp(apikey, "json");
        var parameters = {
            reference: placeid
        };
        var place = googlePlaces.placeDetailsRequest(parameters, function (error, response) {
            if (error) {   
                reject(error);
                console.log('Google Places Error: ' + error)
            }
            resolve(response);
        });
    });
};
