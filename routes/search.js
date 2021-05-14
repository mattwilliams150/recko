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
        //tags
        var arty = req.query.arty;
        var design = req.query.design;
        var authentic = req.query.authentic;
        var brunch = req.query.brunch;
        var cocktails = req.query.cocktails;
        var food = req.query.food;
        var dogs = req.query.dogs;
        var elegant = req.query.elegant;
        var entertaining = req.query.entertaining;
        var beer = req.query.beer;
        var family = req.query.family;
        var service = req.query.service;
        var wines = req.query.wines;
        var portions = req.query.portions;
        var glamorous = req.query.glamorous;
        var groups = req.query.groups;
        var atmosphere = req.query.atmosphere;
        var meetings = req.query.meetings;
        var music = req.query.music;
        var healthy = req.query.healthy;
        var intimate = req.query.intimate;
        var lgbtq = req.query.lgbtq;
        var modern = req.query.modern;
        var party = req.query.party;
        var popup = req.query.popup;
        var quirky = req.query.quirky;
        var relaxed = req.query.relaxed;
        var romantic = req.query.romantic;
        var rustic = req.query.rustic;
        var vegan = req.query.vegan;
        var vegetarian = req.query.vegetarian;

        var title = "Recko | " + type + " in " + place
        if (req.user !== undefined) {loggedIn = true} else {loggedIn = false};

        // search places in database
        var query = {type: type, location: place};
        if (category) { query.subcategory = category}
        if (arty == 'on') { query.arty = "1"}
        if (design == 'on') { query.design = "1"}
        if (authentic == 'on') { query.authentic = "1"}
        if (brunch == 'on') { query.brunch = "1"}
        if (cocktails == 'on') { query.cocktails = "1"}
        if (food == 'on') { query.food = "1"}
        if (dogs == 'on') { query.dogs = "1"}
        if (elegant == 'on') { query.elegant = "1"}
        if (entertaining == 'on') { query.entertaining = "1"}
        if (beer == 'on') { query.beer = "1"}
        if (family == 'on') { query.family = "1"}
        if (service == 'on') { query.service = "1"}
        if (wines == 'on') { query.wines = "1"}
        if (portions == 'on') { query.portions = "1"}
        if (glamorous == 'on') { query.glamorous = "1"}
        if (groups == 'on') { query.groups = "1"}
        if (atmosphere == 'on') { query.atmosphere = "1"}
        if (meetings == 'on') { query.meetings = "1"}
        if (music == 'on') { query.music = "1"}
        if (healthy == 'on') { query.healthy = "1"}
        if (intimate == 'on') { query.intimate = "1"}
        if (lgbtq == 'on') { query.lgbtq = "1"}
        if (modern == 'on') { query.modern = "1"}
        if (party == 'on') { query.party = "1"}
        if (popup == 'on') { query.popup = "1"}
        if (quirky == 'on') { query.quirky = "1"}
        if (relaxed == 'on') { query.relaxed = "1"}
        if (romantic == 'on') { query.romantic = "1"}
        if (rustic == 'on') { query.rustic = "1"}
        if (vegan == 'on') { query.vegan = "1"}
        if (vegetarian == 'on') { query.vegetarian = "1"}

        var mongoplaces = await Places.find(query);
        var recordsPerPage = 10;

        // cut out the number of records per page for the current page
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
                category: category,
                arty: arty,
                design: design,
                authentic: authentic,
                brunch: brunch,
                cocktails: cocktails,
                food: food,
                dogs: dogs,
                elegant: elegant,
                entertaining: entertaining,
                beer: beer,
                family: family,
                service: service,
                wines: wines,
                portions: portions,
                glamorous: glamorous,
                groups: groups,
                atmosphere: atmosphere,
                meetings: meetings,
                music: music,
                healthy: healthy,
                intimate: intimate,
                lgbtq: lgbtq,
                modern: modern,
                party: party,
                popup: popup,
                quirky: quirky,
                relaxed: relaxed,
                romantic: romantic,
                rustic: rustic,
                vegan: vegan,
                vegetarian: vegetarian
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
            categories: categories
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
