var categories = require("../config/categories.json");
var Review = require('../models/review');
var Places = require('../models/places');
var Users = require('../models/user');
var algorithm = require('./algorithm');

module.exports.relevance = function relavance(user, place) {

    var subCatCap = 20.0;
    var subCatBase = 40.0;
    var tagCap = 30.0;
    var tagBase = 60.0;
    var reviewCap = 50.0;
    
    var subCatRelevance = 0.0;
    var tagRelevance = 0.0;
    var reviewRelevance = 0.0;
    var relevance = 0.0;
    
    var reviewnum = parseFloat(place.review);
    
    if (user !== undefined && reviewnum > 0) {
        
    // calculate contribution from review score
        reviewRelevance = reviewCap * (Math.sin((7 - reviewnum) * Math.PI / 4) + 1) / 2
        
    // calculate percentages of each tag for the place...    
        // total positive tags
        if(place.posTags !== undefined) {
            var totalPosTags = Object.values(place.posTags).reduce((a, b) => a + b);
            placeTagPercentages = {};

            for (posTag in place.posTags) {
                placeTagPercentages[posTag] = Number(place.posTags[posTag]) / totalPosTags;
            }
        }

    // calculate percentages of each tag for the user...    
        // total positive tags
        if(user.posTags !== undefined) {
            var totalUserPosTags = Object.values(user.posTags).reduce((a, b) => a + b);
            userTagPercentages = {};

            for (posTag in user.posTags) {
                userTagPercentages[posTag] = Number(user.posTags[posTag]) / totalUserPosTags;
            }
        }
        
    // find matches between user pos tags and place pos tags
        if(place.posTags !== undefined && user.posTags !== undefined) {
            for (userTagPerc in userTagPercentages) {
                
                if(placeTagPercentages[userTagPerc] !== undefined) {
                    tagRelevance += (userTagPercentages[userTagPerc] * placeTagPercentages[userTagPerc] * tagBase);
                }
            }
        }
        
        relevance = (reviewRelevance + Math.min(tagCap, tagRelevance) + Math.min(subCatRelevance, subCatCap)).toFixed(1)
        var relevanceAvailable = true;
        
    } else {
        var relevanceAvailable = false;
        var relevance = null;
    };
    var results = {relevance, relevanceAvailable}
    
    return results
}