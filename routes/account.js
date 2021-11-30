var categories = require("../config/categories.json");
var Review = require('../models/review');
var Places = require('../models/places');


module.exports = (app) => {
    app.get('/account', (req, res) => {
        var title = "Recko | My Account";
        var username = req.user.username;
        var placeid = "ChIJHRs2_hoFdkgRHpOP_c75e6s"
        //console.log(req.user)
        
        if (req.user !== undefined) {loggedIn = true} else {loggedIn = false};
        
        Review.find({'username':username}, async (err, review) => {
            //console.log(review);
            for (i in review) {
                await Places.find({placeId: review[i].placeid}, async (err, place) =>{
                    review[i].placeName = place[0].placeName;
                });
            }
            await res.render('account', {
                title: title,
                categories: categories,
                loggedIn: loggedIn,
                reviews: review,
                username: username
            });
        });
    });
}