var mongoose = require('mongoose');

var reviewSchema = mongoose.Schema({
    placeid: {type: String, required: true},
    email: {type: String},
    name: {type: String},
    rating: {type: Number},
    review: {type: String},
    date: {type: Date}
});

module.exports = mongoose.model('Review', reviewSchema);
