var Review = require('../models/review');
var Places = require('../models/places');
var Users = require('../models/user');
var gdata = require('../models/googledata');
var algorithm = require('./algorithm');
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
            var relv = algorithm.relevance(req.user, place[0]);            
            var relevance = relv.relevance;
            var relevanceAvailable = relv.relevanceAvailable;


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
                    relevance: relevance,
                    relevanceAvailable: relevanceAvailable
            });
        });
    });

    app.post('/listingreview', async (req, res) => {
        
        // add record to review database
        var newReview = new Review();
        var reviewTags = {};
        newReview.placeid = req.query.placeid
        newReview.username = req.user.username
        newReview.userId = req.user.id
        newReview.rating = req.body.review_rating
        newReview.title = req.body.review_title
        newReview.review = req.body.review_review
        newReview.date = Date.now()
        
        for (tag in categories.tagObj) {
            if (req.body[tag] == 'on'){
                reviewTags[tag] = 'on'
            }
        };
        newReview.tags = reviewTags;

        newReview.save((err) => {
            console.log(err);
        });
        
        // update value of tag on place record when review is left.
        var place = await Places.find({placeId: req.query.placeid});
        
        for (tag in categories.tagObj) {
            if (req.body[tag] == 'on') {
                if (req.user['tags'] === undefined) {req.user['tags'] = {}}
                if (req.user['posTags'] === undefined) {req.user['posTags'] = {}}
                
                let newTagValue = (place[0]['tags'][tag] || 0) + 1;
                let setquery = {['tags.'+tag]: newTagValue}
                let newUserTagValue = (req.user['tags'][tag] || 0) + 1;
                let setUserquery = {['tags.'+tag]: newUserTagValue}
                
                // if positive review also increment postags object on place record.
                if (Number(req.body.review_rating) > 2) {
                    if (place[0]['posTags'] !== undefined) {
                        setquery['posTags.'+tag] = (place[0]['posTags'][tag] || 0) + 1;
                    } else {
                        setquery['posTags.'+tag] = 1;
                    }
                    if (req.user['posTags'] !== undefined) {
                        setUserquery['posTags.'+tag] = (req.user['posTags'][tag] || 0) + 1;
                    } else {
                        setUserquery['posTags.'+tag] = 1;
                    }
                }

                await Places.findOneAndUpdate( {placeId: req.query.placeid}, 
                    {$set : setquery}, 
                    function(err, response) { 
                        console.log('tag update error: ' + err);
                    });
                
                await Users.findOneAndUpdate( {_id: req.user.id}, 
                    {$set : setUserquery}, 
                    function(err, response) { 
                        console.log('user tag update error: ' + err);
                    });
            }
        }
        
        await res.redirect('/listing?placeid='+req.query.placeid);
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
