var passport = require('passport');
var LocalStrategy = require('passport-local').Strategy;

var User = require('../models/user');

passport.serializeUser((user, done) => {
    done(null, user.id);
});

passport.deserializeUser((id, done) => {
    User.findById(id, (err, user) => {
        done(err, user);
    });
});

passport.use('local.signup', new LocalStrategy({
    usernameField: 'email', 
    passwordField: 'password',
    passReqToCallback: true
}, (req, email, password, done) => {
   User.findOne({'email':email}, (err, user) => {
       if(err){
           return done(err);
       }
       
       if(user){
           return done(null, false, req.flash('error', 'Email already exists.'))
       }
       
       var newUser = new User();
       newUser.fullname = req.body.fullname;
       newUser.email = req.body.email;
       newUser.password = newUser.encryptPassword(req.body.password);
       newUser.save((err) => {
           return done(null, newUser);
       });
   }); 
}));

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
    usernameField: 'popUsername',
    passwordField: 'popPassword',
    passReqToCallback: true
}, (req, email, password, done) => {
   User.findOne({'email':email}, (err, user) => {
       // clean preferences
       var preferences = req.body;
       delete preferences.popUsername;
       delete preferences.popPassword;
        for(name in preferences){
            var replaced_key = name.replace('_pop', '');
            preferences[replaced_key] = preferences[name];
            delete preferences[name];
        }

        if(err){
           return done(err);
       }

       if(user){
           return done(null, false, req.flash('error', 'Email already exists, please login.'))
       }

       var newUser = new User();
       newUser.email = email;
       newUser.password = newUser.encryptPassword(password);
       newUser.preferences = preferences;
       newUser.save((err) => {
           return done(null, newUser);
       });

   }); 
}));
