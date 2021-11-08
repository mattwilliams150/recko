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
            if (req.user !== undefined) {
                var relevanceAvailable = true;
                var reviewnum = parseFloat(place[0].review);
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
            } else {
                var relevanceAvailable = false;
            };
            
            // work out top tags
            var toptags = [];
            for (let t in categories.tagIds) {
                let tag = categories.tagIds[t]
                let tagcount = 0;
                for (let i = 0; i < review.length; i++) {
                    let rev = review[i];
                    if (rev[tag] == "on") {
                        tagcount++
                    }
                 }
               
                toptags.push([tag, tagcount])
            }
            toptags.sort(function(a, b) {
                return b[1] - a[1];
            });

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
                    relevanceAvailable: relevanceAvailable,
                    toptags: toptags
            });
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
        newReview.culturally_authentic_dishes = req.body.culturally_authentic_dishes
        newReview.exciting_menu = req.body.exciting_menu
        newReview.fresh_flavours = req.body.fresh_flavours
        newReview.generous_portions = req.body.generous_portions
        newReview.fine_dining = req.body.fine_dining
        newReview.small_plates_sharing = req.body.small_plates_sharing
        newReview.street_food_vibes = req.body.street_food_vibes
        newReview.delicious_cocktails = req.body.delicious_cocktails
        newReview.craft_local_beer = req.body.craft_local_beer
        newReview.fantastic_wine_list = req.body.fantastic_wine_list
        newReview.awesome_architecture = req.body.awesome_architecture
        newReview.entertaining = req.body.entertaining
        newReview.fantastic_service = req.body.fantastic_service
        newReview.luxurious = req.body.luxurious
        newReview.buzzing_atmosphere = req.body.buzzing_atmosphere
        newReview.great_music = req.body.great_music
        newReview.intimate = req.body.intimate
        newReview.modern_design = req.body.modern_design
        newReview.party_vibes = req.body.party_vibes
        newReview.quirky = req.body.quirky
        newReview.relaxing = req.body.relaxing
        newReview.romantic = req.body.romantic
        newReview.rustic = req.body.rustic
        newReview.chic = req.body.chic
        newReview.working_from_home = req.body.working_from_home
        newReview.young_kids_families = req.body.young_kids_families
        newReview.large_groups = req.body.large_groups
        newReview.vegans_vegetarians = req.body.vegans_vegetarians
        newReview.bringing_the_dog = req.body.bringing_the_dog
        newReview.a_date = req.body.a_date
        newReview.a_special_occasion = req.body.a_special_occasion
        newReview.a_quiet_catch_up = req.body.a_quiet_catch_up
        newReview.watching_sport = req.body.watching_sport
        newReview.an_evening_with_friends = req.body.an_evening_with_friends
        newReview.bottomless_brunch = req.body.bottomless_brunch

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
