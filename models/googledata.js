var mongoose = require('mongoose');

var googleDataSchema = mongoose.Schema({
    placeid: {type: String},
    data: {type: Object}
});

module.exports = mongoose.model('googleData', googleDataSchema);
