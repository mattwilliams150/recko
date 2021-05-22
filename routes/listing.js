var Review = require('../models/review');
var Places = require('../models/places');
var gdata = require('../models/googledata');
var categories = require("../config/categories.json");


module.exports = (app) => {
    app.get('/listing', (req, res) => {
        var placeid = req.query.placeid;
        var title = "Recko"
        var clientPlacesApiKey = process.env.CLIENT_GOOGLE_PLACES_API_KEY;
        if (req.user !== undefined) {loggedIn = true} else {loggedIn = false};

        Review.find({'placeid':placeid}, async (err, review) => {
            //console.log(review);
            //--- use google data---//
            /*
            getGooglePlace(placeid)
            .then(async(place) => {
                await saveplace(placeid, place);
                var mongoplace = await gdata.find({placeid: placeid});
                console.log(mongoplace)
                res.render('listing', {
                    title: title,
                    placeid: placeid,
                    place: place,
                    mongoplace: mongoplace[0].data.result,
                    loggedIn: loggedIn,
                    reviews: review,
                    clientPlacesApiKey: clientPlacesApiKey
                })
            })
            .catch(err => res.status(500).send('An error occured'));

            */

            var place = await Places.find({placeId: placeid});
            var mongoplace = await gdata.find({placeid: placeid});

            // work out relevance score
            var reviewnum = parseFloat(place[0].review);
            console.log(reviewnum)
            if (reviewnum > 0) { // return zero if review is undefined / null / negative
                var relevance = 15.0 * (reviewnum - 1.0)
                for (pref in req.user.preferences) {
                    if (place[0][pref] == 1) {relevance += (reviewnum + 5.0)};
                    if (pref == place[0].subcategory) {relevance += (reviewnum + 5.0)};
                };
                relevance = relevance.toFixed(1)
            } else {
                var relevance = 0;
            }

            // render
            res.render('listing', {
                    title: title,
                    placeid: placeid,
                    mongoplace: mongoplace[0].data.result,
                    place: place,
                    categories: categories,
                    loggedIn: loggedIn,
                    reviews: review,
                    clientPlacesApiKey: clientPlacesApiKey,
                    relevance: relevance
            })


        });
    });

    app.post('/listingreview', (req, res) => {
        var newReview = new Review();
        newReview.placeid = req.query.placeid
        newReview.name = req.body.review_name
        newReview.email = req.body.review_email
        newReview.rating = req.body.review_rating
        newReview.review = req.body.review_review
        newReview.date = Date.now()
        newReview.arty = req.body.arty
        newReview.design = req.body.design
        newReview.authentic = req.body.authentic
        newReview.brunch = req.body.brunch
        newReview.cocktails = req.body.cocktails
        newReview.food = req.body.food
        newReview.dogs = req.body.dogs
        newReview.elegant = req.body.elegant
        newReview.entertaining = req.body.entertaining
        newReview.beer = req.body.beer
        newReview.family = req.body.family
        newReview.service = req.body.service
        newReview.wines = req.body.wines
        newReview.portions = req.body.portions
        newReview.glamorous = req.body.glamorous
        newReview.groups = req.body.groups
        newReview.atmosphere = req.body.atmosphere
        newReview.meetings = req.body.meetings
        newReview.music = req.body.music
        newReview.healthy = req.body.healthy
        newReview.intimate = req.body.intimate
        newReview.lgbtq = req.body.lgbtq
        newReview.modern = req.body.modern
        newReview.party = req.body.party
        newReview.popup = req.body.popup
        newReview.quirky = req.body.quirky
        newReview.relaxed = req.body.relaxed
        newReview.romantic = req.body.romantic
        newReview.rustic = req.body.rustic
        newReview.vegan = req.body.vegan
        newReview.vegetarian = req.body.vegetarian

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

async function saveplace(placeid, place) {
    gdata.findOne({'placeid':placeid}, (err, dbplace) => {
       if(!dbplace){
           var newPlace = new gdata();
           newPlace.placeid = placeid;
           newPlace.data = place;
           newPlace.save((err) => {
               console.log(err);
           });
       }
    })
}
