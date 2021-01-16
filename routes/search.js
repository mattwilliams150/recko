module.exports = (app) => {
    app.get('/results', (req, res) => {
        var type = req.query.type;
        var place = req.query.place;
        var title = "Recko | " + type + " in " + place
        if (req.user !== undefined) {loggedIn = true} else {loggedIn = false};
        getGooglePlaces(type, place)
        .then((places) => res.render('results', {
            title: title,
            type: type,
            place: place,
            places: places, 
            loggedIn: loggedIn
            
        }))
        .catch(err => res.status(500).send('An error occured'));
    });
};
    
    
function getGooglePlaces(type, place){
    return new Promise((resolve, reject) => {    
        var gp = require('googleplaces');
        var config = require("../config.js");
        var googlePlaces = new gp(config.apiKey, config.outputFormat);
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
