var mongoose = require('mongoose');

var placesSchema = mongoose.Schema({
    placeId: {type: String, required: true},
    photo: {type: String},
    lat: {type: String},
    long: {type: String},
    placeName: {type: String},
    review: {type: String},
    price: {type: String},
    address: {type: String},
    location: {type: String},
    sw4: {type: String},
    sw11: {type: String},
    sw12: {type: String},
    telephone: {type: String},
    website: {type: String},
    description: {type: String},
    type: {type: String},
    tag1: {type: String},
    tag2: {type: String},
    tag3: {type: String},
    subcategory: {type: String},
    amenities: {type: String},
    tags: {type: Object},
    posTags: {type: Object}
});

module.exports = mongoose.model('Places', placesSchema);
