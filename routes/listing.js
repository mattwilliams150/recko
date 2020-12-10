module.exports = (app) => {
    app.get('/listing', (req, res) => {
        var placeid = req.query.placeid;
        var title = "Recko"
        getGooglePlace(placeid)
        .then((place) => res.render('listing', {
            title: title,
            placeid: place,
            place: place
        }))
        .catch(err => res.status(500).send('An error occured'));
    });
}

function getGooglePlace(placeid){
    return new Promise((resolve, reject) => {    
        var gp = require('googleplaces');
        var config = require("../config.js");
        var googlePlaces = new gp(config.apiKey, config.outputFormat);
        var parameters = {
            reference: placeid
        };
        var place = googlePlaces.placeDetailsRequest(parameters, function (error, response) {
            if (error) {   
                reject(error);
            }
            resolve(response);
        });
    });
};