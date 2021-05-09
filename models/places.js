var mongoose = require('mongoose');

var placesSchema = mongoose.Schema({
    placeid: {type: String, required: true},
    placeName: {type: String},
    review: {type: String},
    price: {type: String},
    address: {type: String},
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
    amenities: {type: String}
});

module.exports = mongoose.model('Places', placesSchema);
