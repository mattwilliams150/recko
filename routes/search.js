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
        var culturally_authentic_dishes = req.query.culturally_authentic_dishes;
        var exciting_menu = req.query.exciting_menu;
        var fresh_flavours = req.query.fresh_flavours;
        var generous_portions = req.query.generous_portions;
        var fine_dining = req.query.fine_dining;
        var small_plates_sharing = req.query.small_plates_sharing;
        var street_food_vibes = req.query.street_food_vibes;
        var delicious_cocktails = req.query.delicious_cocktails;
        var craft_local_beer = req.query.craft_local_beer;
        var fantastic_wine_list = req.query.fantastic_wine_list;
        var awesome_architecture = req.query.awesome_architecture;
        var entertaining = req.query.entertaining;
        var fantastic_service = req.query.fantastic_service;
        var luxurious = req.query.luxurious;
        var buzzing_atmosphere = req.query.buzzing_atmosphere;
        var great_music = req.query.great_music;
        var intimate = req.query.intimate;
        var modern_design = req.query.modern_design;
        var party_vibes = req.query.party_vibes;
        var quirky = req.query.quirky;
        var relaxing = req.query.relaxing;
        var romantic = req.query.romantic;
        var rustic = req.query.rustic;
        var chic = req.query.chic;
        var working_from_home = req.query.working_from_home;
        var young_kids_families = req.query.young_kids_families;
        var large_groups = req.query.large_groups;
        var vegans_vegetarians = req.query.vegans_vegetarians;
        var bringing_the_dog = req.query.bringing_the_dog;
        var a_date = req.query.a_date;
        var a_special_occasion = req.query.a_special_occasion;
        var a_quiet_catch_up = req.query.a_quiet_catch_up;
        var watching_sport = req.query.watching_sport;
        var an_evening_with_friends = req.query.an_evening_with_friends;
        var bottomless_brunch = req.query.bottomless_brunch;

        var title = "Recko | " + type + " in " + place
        if (req.user !== undefined) {loggedIn = true} else {loggedIn = false};

        // search places in database
        var query = {type: type, location: place};
        if (category) { query.subcategory = category}
        if (culturally_authentic_dishes == 'on') {query.culturally_authentic_dishes = '1'}
        if (exciting_menu == 'on') {query.exciting_menu = '1'}
        if (fresh_flavours == 'on') {query.fresh_flavours = '1'}
        if (generous_portions == 'on') {query.generous_portions = '1'}
        if (fine_dining == 'on') {query.fine_dining = '1'}
        if (small_plates_sharing == 'on') {query.small_plates_sharing = '1'}
        if (street_food_vibes == 'on') {query.street_food_vibes = '1'}
        if (delicious_cocktails == 'on') {query.delicious_cocktails = '1'}
        if (craft_local_beer == 'on') {query.craft_local_beer = '1'}
        if (fantastic_wine_list == 'on') {query.fantastic_wine_list = '1'}
        if (awesome_architecture == 'on') {query.awesome_architecture = '1'}
        if (entertaining == 'on') {query.entertaining = '1'}
        if (fantastic_service == 'on') {query.fantastic_service = '1'}
        if (luxurious == 'on') {query.luxurious = '1'}
        if (buzzing_atmosphere == 'on') {query.buzzing_atmosphere = '1'}
        if (great_music == 'on') {query.great_music = '1'}
        if (intimate == 'on') {query.intimate = '1'}
        if (modern_design == 'on') {query.modern_design = '1'}
        if (party_vibes == 'on') {query.party_vibes = '1'}
        if (quirky == 'on') {query.quirky = '1'}
        if (relaxing == 'on') {query.relaxing = '1'}
        if (romantic == 'on') {query.romantic = '1'}
        if (rustic == 'on') {query.rustic = '1'}
        if (chic == 'on') {query.chic = '1'}
        if (working_from_home == 'on') {query.working_from_home = '1'}
        if (young_kids_families == 'on') {query.young_kids_families = '1'}
        if (large_groups == 'on') {query.large_groups = '1'}
        if (vegans_vegetarians == 'on') {query.vegans_vegetarians = '1'}
        if (bringing_the_dog == 'on') {query.bringing_the_dog = '1'}
        if (a_date == 'on') {query.a_date = '1'}
        if (a_special_occasion == 'on') {query.a_special_occasion = '1'}
        if (a_quiet_catch_up == 'on') {query.a_quiet_catch_up = '1'}
        if (watching_sport == 'on') {query.watching_sport = '1'}
        if (an_evening_with_friends == 'on') {query.an_evening_with_friends = '1'}
        if (bottomless_brunch == 'on') {query.bottomless_brunch = '1'}

        // get places
        var mongoplaces = await Places.find(query).lean();
        
        // count number of places per filter
        var filters = [];
        for (tag in categories.tagObj) {
            let tagcount = 0;
            for (var i in mongoplaces) {
                if (mongoplaces[i][tag] == '1') {tagcount++}
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
                culturally_authentic_dishes: culturally_authentic_dishes,
                exciting_menu: exciting_menu,
                fresh_flavours: fresh_flavours,
                generous_portions: generous_portions,
                fine_dining: fine_dining,
                small_plates_sharing: small_plates_sharing,
                street_food_vibes: street_food_vibes,
                delicious_cocktails: delicious_cocktails,
                craft_local_beer: craft_local_beer,
                fantastic_wine_list: fantastic_wine_list,
                awesome_architecture: awesome_architecture,
                entertaining: entertaining,
                fantastic_service: fantastic_service,
                luxurious: luxurious,
                buzzing_atmosphere: buzzing_atmosphere,
                great_music: great_music,
                intimate: intimate,
                modern_design: modern_design,
                party_vibes: party_vibes,
                quirky: quirky,
                relaxing: relaxing,
                romantic: romantic,
                rustic: rustic,
                chic: chic,
                working_from_home: working_from_home,
                young_kids_families: young_kids_families,
                large_groups: large_groups,
                vegans_vegetarians: vegans_vegetarians,
                bringing_the_dog: bringing_the_dog,
                a_date: a_date,
                a_special_occasion: a_special_occasion,
                a_quiet_catch_up: a_quiet_catch_up,
                watching_sport: watching_sport,
                an_evening_with_friends: an_evening_with_friends,
                bottomless_brunch: bottomless_brunch,
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
