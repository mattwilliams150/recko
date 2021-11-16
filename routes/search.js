var Places = require('../models/places');
var locations = require("../config/locations.json");
var categories = require("../config/categories.json");

module.exports = (app) => {
    app.get('/results', async (req, res) => {

        // possible parameters
        var type = req.query.type;
        var place = req.query.place;
        var category = req.query.category;
        var page = parseInt(req.query.page) || 1; // current page defaults to 1
        var sort = req.query.sort;

        //tags
        var tagParams = {};
        for (tag in categories.tagObj) {
            tagParams[tag] = req.query[tag];
        }

        var title = "Recko | " + type + " in " + place
        if (req.user !== undefined) {loggedIn = true} else {loggedIn = false};

        // search places in database
        var query = {type: type, location: place};
        if (category) { query.subcategory = category}
        
        for (tag in categories.tagObj) {
            if(req.query[tag] == 'on') {query['tags.'+tag] = {$gt:0}}
        }
        
        // get places
        var mongoplaces = await Places.find(query).lean();
        
        // count number of places per filter
        var filters = [];
        for (tag in categories.tagObj) {
            let tagcount = 0;
            for (var i in mongoplaces) {
                if (mongoplaces[i]['tags'][tag] == '1') {tagcount++}
            }
            if (tagcount > 0) {
                filters.push([tag, tagcount]);
            }
        };
        filters.sort(function(a, b) {
            return b[1] - a[1];
        });

        // match perc for each user
        if (req.user !== undefined) {
            var relevanceAvailable = true;
            mongoplaces.forEach((mongoplace, key) => {
                var reviewnum = parseFloat(mongoplace.review);
                if (reviewnum > 0) { // return zero if review is undefined / null / negative
                    var relevance = 15.0 * (reviewnum - 1.0)
                    for (pref in req.user.preferences) {
                        if (mongoplace[pref] == 1) {relevance += (reviewnum + 5.0)};
                        if (pref == mongoplace.subcategory) {relevance += (reviewnum + 5.0)};
                    };
                    relevance = relevance.toFixed(1)
                } else {
                    var relevance = 0;
                }
                mongoplace.relevance = relevance;
                mongoplaces[key] = mongoplace;
            });
        } else {
            var relevanceAvailable = false;
        }

        // sort places
        function GetSortOrder(prop) {
            return function(a, b) {
                if (a[prop] > b[prop]) {
                    return -1;
                } else if (a[prop] < b[prop]) {
                    return 1;
                }
                return 0;
            }
        }
        if (sort == "rating") {
            mongoplaces.sort(GetSortOrder("review"))
        } else {
            mongoplaces.sort(GetSortOrder("relevance"))
        }

        // cut out the number of records per page for the current page
        var recordsPerPage = 10;
        var places = mongoplaces.slice((page-1)*recordsPerPage,page*recordsPerPage);

        // pagination
        var totalRecords = mongoplaces.length;
        if (page != 1) {var previousPage = page-1} else {var previousPage};
        if (page*recordsPerPage < totalRecords) {var nextPage = page+1} else {var nextPage};
        var maxPage = Math.ceil(totalRecords / recordsPerPage)

        var data = {
            parameters: {
                type: type,
                place: place,
                page: page,
                sort: sort,
                category: category,
                tags: tagParams
            },
            pagination: {
                totalRecords: totalRecords,
                recordsPerPage: recordsPerPage,
                previousPage: previousPage,
                currentPage: page,
                nextPage: nextPage,
                maxPage: maxPage
            },
            places: places,
            locations: locations,
            categories: categories
        }

        res.render('results', {
            title: title,
            type: type,
            place: place,
            data: data,
            loggedIn: loggedIn,
            categories: categories,
            relevanceAvailable: relevanceAvailable,
            filters: filters
        })


    });
};
    
    
function getGooglePlaces(type, place){
    return new Promise((resolve, reject) => {    
        var gp = require('googleplaces');
        var apikey = process.env.SERVER_GOOGLE_PLACES_API_KEY;
        var googlePlaces = new gp(apikey, "json");
        var parameters = {
            query: type + " in " + place
        };
        var places = googlePlaces.textSearch(parameters, function (error, response) {
            if (error) {   
                reject(error);
            }
            resolve(response);
        });
    });
};
