var Review = require('../models/review');
var Places = require('../models/places');
var gdata = require('../models/googledata');

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

            res.render('listing', {
                    title: title,
                    placeid: placeid,
                    mongoplace: mongoplace[0].data.result,
                    place: place,
                    loggedIn: loggedIn,
                    reviews: review,
                    clientPlacesApiKey: clientPlacesApiKey
            })


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
