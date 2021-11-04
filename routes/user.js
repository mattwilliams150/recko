var nodemailer = require('nodemailer');
var smtpTransport = require('nodemailer-smtp-transport');
var async = require('async');
var crypto = require('crypto');
var User = require('../models/user');
//var secret = require('../secret/secret');
var categories = require("../config/categories.json");



module.exports = (app, passport) => {
    
    app.post('/popover', function(req, res, next) {
        passport.authenticate('local.popsignup', function(err, user, info) {
            var errors = req.flash('error');
            if (user == false) {
                if (err) return next(err);
                res.status(200).send({errors: errors, loggedIn: false});
            } else {           
                req.login(user, function(err) {
                    if (err) return next(err);
                    res.status(200).send({errors: errors, loggedIn: true});
                });      
            }
        })(req, res, next);
    });
    
    app.get('/register', (req, res) => {
        var errors = req.flash('error');
        console.log(errors);
        if (req.user !== undefined) {loggedIn = true} else {loggedIn = false};
        res.render('user/register', {title: 'Recko | Register', loggedIn: loggedIn, messages: errors, categories: categories, hasErrors: errors.length > 0});
    });
    
    app.post('/register', validate, passport.authenticate('local.signup', {
        successRedirect: '/',
        failureRedirect: '/register',
        failureFlash: true
    }));
    
    app.get('/login', (req, res) => {
        var errors = req.flash('error');
        if (req.user !== undefined) {loggedIn = true} else {loggedIn = false};
        res.render('user/login', {title: 'Recko | Login', loggedIn: loggedIn, messages: errors, categories: categories, hasErrors: errors.length > 0});
    });
    
    app.post('/login', loginValidate, passport.authenticate('local.login', {
        //successRedirect: '/home',
        
        failureRedirect: '/login',
        failureFlash: true
    }), (req, res) => {
        if (req.body.rememberme){
            req.session.cookie.maxAge = 30*24*60*60*1000; // 30 days
        } else {
            req.session.cookie.expires = null;
        }
        res.redirect('/');
    });
    
    app.get('/logout', (req, res) => {
        req.logout();
        req.session.destroy((err) => {
            res.redirect('/')
        });
    });

    app.get('/forgot', (req, res) => {
        var errors = req.flash('error');
        var info = req.flash('info');
        if (req.user !== undefined) {loggedIn = true} else {loggedIn = false};
        res.render('user/forgot', {title: 'Request Password Reset', loggedIn: loggedIn, messages: errors, categories: categories, hasErrors: errors.length > 0, info: info, noErrors: info.length > 0})
    });  
    
    app.post('/forgot', (req, res, next) => {
       async.waterfall([
           function(callback){
               crypto.randomBytes(20, (err, buf) => {
                   var rand = buf.toString('hex');
                   callback(err, rand);
               })
           },
           
           function(rand, callback){
               User.findOne({'email':req.body.email}, (err, user) => {
                   if(!user){
                       req.flash('error', 'No account exists with this email.');
                       return res.redirect('/forgot');
                   }
                   
                   user.passwordResetToken = rand;
                   user.passwordResetExpires = Date.now() + 60*60*1000
                   
                   user.save((err) => {
                       callback(err, rand, user)
                   });
               })
           },
           
           function(rand, user, callback){
               var smtpTransport = nodemailer.createTransport({
                   service: 'Gmail',
                   auth: {
                       user: secret.auth.user,
                       pass: secret.auth.pass
                   }
               });
               
               var mailOptions = {
                   to: user.email,
                   from: 'Recko '+'<'+secret.auth.user+'>',
                   subject: 'Recko - Password Reset',
                   text: "You hav requested for a password reset token. \n\n Please click the link to complete the process: \n\n\ http://localhost:3000/reset/"+rand
               };
               
               smtpTransport.sendMail(mailOptions, (err, response) => {
                   req.flash('info', 'A password reset token has been sent to '+user.email);
                   return callback(err, user);
               });
           }
       ], (err) => {
           if(err){
               return next(err);
           }
           
           res.redirect('/forgot')
       }) 
    });
    
    app.get('/reset/:token', (req, res) => {
        
        User.findOne({passwordResetToken: req.params.token, passwordResetExpires: {$gt: Date.now()}}, (err, user) => {
            if(!user){
                req.flash('error', 'Password reset link has expired or is invalid. Re-enter your email to get a new link.');
                return res.redirect('/forgot')
            }
            var errors = req.flash('error');
            var success = req.flash('success');
            if (req.user !== undefined) {loggedIn = true} else {loggedIn = false};
            res.render('user/reset', {title: 'Reset your password', loggedIn: loggedIn, messages: errors, categories: categories, hasErrors: errors.length > 0, success: success, noErrors: success.length>0});
  
        });
    });
    
    app.post('/reset/:token', (req, res) => {
        async.waterfall([
            function(callback){
                User.findOne({passwordResetToken: req.params.token, passwordResetExpires: {$gt: Date.now()}}, (err, user) => {
                    if(!user){
                        req.flash('error', 'Password reset link has expired or is invalid. Re-enter your email to get a new link.');
                        return res.redirect('/forgot')
                    }
                    
                    req.checkBody('password', 'Password is Required').notEmpty();
                    req.checkBody('password', 'password must be at least 6 characters').isLength({min:6});
                    req.check("password", "Password must contain at least 1 number").matches(/^.*\d.*$/, "i");
                    
                    var errors = req.validationErrors();
                    
                    if(req.body.password == req.body.cpassword){
                        if(errors){
                            var messages = [];
                            errors.forEach((error) => {
                                messages.push(error.msg)
                            })
                            var errors = req.flash('error');
                            res.redirect('/reset/'+req.params.token);     
                        } else {
                            user.password = user.encryptPassword(req.body.password);
                            user.passwordResetExpires = undefined;
                            user.passwordResetToken = undefined;
                            
                            user.save((err) => {
                                req.flash('success', 'Your password has been updated.');
                                callback(err, user);
                            })
                        }
                    } else {
                        req.flash('error', 'Password and confirm password are not equal')
                        res.redirect('/reset/'+req.params.token);
                    }

                });
            },
            
            function(user, callback) {
               var smtpTransport = nodemailer.createTransport({
                   service: 'Gmail',
                   auth: {
                       user: secret.auth.user,
                       pass: secret.auth.pass
                   }
               });
               
               var mailOptions = {
                   to: user.email,
                   from: 'Recko '+'<'+secret.auth.user+'>',
                   subject: 'Recko - Your password has been updated',
                   text: "Your password has been updated for "+user.email
               };
               
               smtpTransport.sendMail(mailOptions, (err, response) => {
                   callback(err, user);
                   
                   var error = req.flash('error');
                   var success = req.flash('success');
                   res.render('user/reset', {title: 'Reset Your Password', messages: error, hasErrors: error.length > 0, success:success, noErrors:success.length > 0});
               });
            }
        ]);
    });
}


function validate(req, res, next) {
    req.checkBody('email', 'Email is required').notEmpty();
    req.checkBody('email', 'Email is invalid').isEmail();
    req.checkBody('password', 'Password is required').notEmpty();
    req.checkBody('password', 'Password must be at least 6 characters').isLength({min:6});
    req.check("password", "Password must contain at least 1 number").matches(/^.*\d.*$/, "i");
    req.checkBody('password2', 'Passwords do not match').equals(req.body.password);
    
    var errors = req.validationErrors();
    
    if(errors){
        var messages = [];
        errors.forEach((error) => {
            messages.push(error.msg)
        });
        
        req.flash('error', messages);
        res.redirect('/register');
        
    } else {
        return next()
    }
}
          
function loginValidate(req, res, next) {
    req.checkBody('email', 'Email is required').notEmpty();
    req.checkBody('email', 'Email is invalid').isEmail();
    req.checkBody('password', 'Password is required').notEmpty();
    req.checkBody('password', 'password must be at least 6 characters').isLength({min:6});
    req.check("password", "Password must contain at least 1 number").matches(/^.*\d.*$/, "i");
    
    var loginErrors = req.validationErrors();
    
    if(loginErrors){
        var messages = [];
        loginErrors.forEach((error) => {
            messages.push(error.msg)
        });
        
        req.flash('error', messages);
        res.redirect('/login');
        
    } else {
        return next()
    }
}

