var mongoose = require('mongoose');

var reviewSchema = mongoose.Schema({
    placeid: {type: String, required: true},
    userId: {type: String},
    placeName: {type:String},
    username: {type: String},
    rating: {type: Number},
    review: {type: String},
    title: {type: String},
    date: {type: Date},
    tags: {type: Object}
});

module.exports = mongoose.model('Review', reviewSchema);
