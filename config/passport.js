var passport = require('passport');
var LocalStrategy = require('passport-local').Strategy;
var categories = require("../config/categories.json");
var User = require('../models/user');

passport.serializeUser((user, done) => {
    done(null, user.id);
});

passport.deserializeUser((id, done) => {
    User.findById(id, (err, user) => {
        done(err, user);
    });
});

// passport.use('local.signup', new LocalStrategy({
//     usernameField: 'email', 
//     passwordField: 'password',
//     passReqToCallback: true
// }, (req, email, password, done) => {
//    User.findOne({'email':email}, (err, user) => {
//        if(err){
//            return done(err);
//        }
       
//        if(user){
//            return done(null, false, req.flash('error', 'Email already exists.'))
//        }
       
//        var newUser = new User();
//        newUser.firstName = req.body.firstName;
//        newUser.lastName = req.body.lastName;
//        newUser.username = req.body.username;
//        newUser.email = req.body.email;
//        newUser.password = newUser.encryptPassword(req.body.password);
//        newUser.save((err) => {
//            return done(null, newUser);
//        });
//    }); 
// }));

passport.use('local.login', new LocalStrategy({
    usernameField: 'email', 
    passwordField: 'password',
    passReqToCallback: true
}, (req, email, password, done) => {
   User.findOne({'email':email}, (err, user) => {
       if(err){
           return done(err);
       }
       var messages = [];
       if(!user || !user.validPassword(password)){
           messages.push('Email not found or password invalid')
           return done(null, false, req.flash('error', messages))
       }
       return done(null, user);
       
   });
}));

passport.use('local.popsignup', new LocalStrategy({
    usernameField: 'popEmail',
    passwordField: 'popPassword',
    passReqToCallback: true
}, (req, email, password, done) => {
   User.findOne({'email':email}, (err, user) => {
       if(err){
           return done(err);
       }
       if(user){
           return done(null, false, req.flash('error', 'Email already exists, <a href = "/login">click here to login</a>.'))
       }
       var newUser = new User();
       newUser.firstName = req.body.popFirstName;
       newUser.lastName = req.body.popLastName;
       newUser.username = req.body.popUsername;
       newUser.email = email;
       newUser.password = newUser.encryptPassword(password);
    
       // clean preferences
       var preferences = req.body;
       delete preferences.popFirstName;
       delete preferences.popLastName;
       delete preferences.popUsername;
       delete preferences.popEmail;
       delete preferences.popPassword;
       delete preferences.popConfirmPassword;
        for(name in preferences){
            var replaced_key = name.replace('_pop', '');
            preferences[replaced_key] = preferences[name];
            delete preferences[name];
        }
       newUser.preferences = preferences;
       
       var posTags = {};
       for (tagId in categories.tagObj) {
           if (tagId in preferences) {
               posTags[tagId] = 1;
           } else {
               posTags[tagId] = 0;
           }
       }
       
       newUser.posTags = posTags;
       newUser.save((err) => {
           return done(null, newUser);
       });

   }); 
}));
