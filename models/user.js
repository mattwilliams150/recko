var mongoose = require('mongoose');
var bcrypt = require('bcrypt-nodejs');

var userSchema = mongoose.Schema({
    email: {type: String, required: true},
    firstName: {type: String, default: ''},
    lastName: {type: String, default: ''},
    imgUrl: {type: String, default: ''},
    password: {type: String},
    passwordResetToken: {type: String, default: ''},
    passwordResetExpires: {type: Number, default: Date.now},
    facebook: {type: String, default: ''},
    tokens: Array,
    preferences: Object
});

userSchema.methods.encryptPassword = (password) => {
    return bcrypt.hashSync(password, bcrypt.genSaltSync(10, null))
}

userSchema.methods.validPassword = function(password) {
    return bcrypt.compareSync(password, this.password);
}

module.exports = mongoose.model('User', userSchema);
