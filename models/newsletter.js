var mongoose = require('mongoose');

var newsletterSchema = mongoose.Schema({
    email: {type: String, required: true}
});

module.exports = mongoose.model('Newsletter', newsletterSchema);
