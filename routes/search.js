module.exports = (app) => {
    app.get('/results', (req, res) => {
        var type = req.query.type;
        var place = req.query.place;
        var title = "Recko | " + type + " in " + place
        try {
            var config = require("../config.js");
        } catch {
            console.log('no config.js file')
        }
        var clientPlacesApiKey = process.env.CLIENT_GOOGLE_PLACES_API_KEY || config.clientPlacesApiKey;
        if (req.user !== undefined) {loggedIn = true} else {loggedIn = false};
        getGooglePlaces(type, place)
        .then((places) => res.render('results', {
            title: title,
            type: type,
            place: place,
            places: places, 
            loggedIn: loggedIn,
            clientPlacesApiKey: clientPlacesApiKey
            
        }))
        .catch(err => res.status(500).send('An error occured'));
    });
};
    
    
function getGooglePlaces(type, place){
    return new Promise((resolve, reject) => {    
        var gp = require('googleplaces');
        try {
            var config = require("../config.js");
        } catch {
            console.log('no config.js file')
        }
        var apikey = process.env.SERVER_GOOGLE_PLACES_API_KEY || config.serverPlacesApiKey;
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
