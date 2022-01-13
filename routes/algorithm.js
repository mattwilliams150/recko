var categories = require("../config/categories.json");
var Review = require('../models/review');
var Places = require('../models/places');
var Users = require('../models/user');
var algorithm = require('./algorithm');

module.exports.relevance = function relavance(user, place) {

    var subCatCap = 20.0;
    var subCatBase = 40.0;
    var tagCap = 30.0;
    var tagBase = 150.0;
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
        if(place.posTags !== undefined) {
            var totalPosTags = Object.values(place.posTags).reduce((a, b) => a + b); // total positive tags
            placeTagPercentages = {};

            for (posTag in place.posTags) {
                placeTagPercentages[posTag] = Number(place.posTags[posTag]) / totalPosTags;
            }
        }

    // calculate percentages of each tag for the user...    
        if(user.posTags !== undefined) {
            var totalUserPosTags = Object.values(user.posTags).reduce((a, b) => a + b); // total positive tags
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
        
    // calculate percentages of pos subcat for the user, but just for the type (restaurant/bar/todo) of the current place ...    
        if(user.subCatPosCounts !== undefined) {
            
            let userSubPosCounts = {};
            userSubPosCounts = Object.assign({}, user.subCatPosCounts); // can't simply x = y. see https://stackoverflow.com/questions/33918926/javascript-how-to-delete-key-from-copied-object
            
            if (Object.keys(userSubPosCounts).includes(place.subcategory)) { // if place type isnt in the users subcatposcounts theres no need to calculate the subcatrelevance as it's zero
            
                if (place.type == "Restaurants") {
                    var subcatlabel = "cuisines";
                } else if (place.type == "Bars") {
                    var subcatlabel = "bars";
                } else if (place.type == "Activities") {
                    var subcatlabel = "thingsToDo";
                }

                for (let prop of Object.keys(userSubPosCounts)) {
                   if (!categories[subcatlabel].includes(prop)) {
                       delete userSubPosCounts[prop];
                   }
                }

                if (Object.keys(userSubPosCounts).length !== 0) { // exclude case where user has some possubcats, but not any for current subcatlabel

                    var totalSubCatPosCounts = Object.values(userSubPosCounts).reduce((a, b) => a + b);
                    subCatPosPercentages = {};

                    for (subCatPosCount in userSubPosCounts) {
                        subCatPosPercentages[subCatPosCount] = Number(userSubPosCounts[subCatPosCount]) / totalSubCatPosCounts;
                    }

                    subCatRelevance = subCatPosPercentages[place.subcategory] * subCatBase;
                }
            }
        }    
        
        
        //console.log("review:"+reviewRelevance+" tag:"+tagRelevance+" subcat:"+ subCatRelevance)
        //console.log(userTagPercentages)
        //console.log(placeTagPercentages)
        
        relevance = (reviewRelevance + Math.min(tagCap, tagRelevance) + Math.min(subCatRelevance, subCatCap)).toFixed(1)
        var relevanceAvailable = true;
        
    } else {
        var relevanceAvailable = false;
        var relevance = null;
    };
    var results = {relevance, relevanceAvailable}
    
    return results
}