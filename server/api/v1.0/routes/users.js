var mongoose = require('mongoose');
var User     = mongoose.model('User');
var auth     = require('auth');
var log      = require('log')(module);

var generateSigninResponse = function(user){

    var result = {
        token: auth.generateNewToken(user.id, 9),
        userId: user.id,
        name: user.fullname,
        gravatar: user.gravatar,
        email: user.email,
        expires: 9*3600 - 20
    };

    return result;
};

exports.createUser = function(req, res, next) {
    var userData = req.body;

    if (!userData.username || !userData.password || !userData.email) {
        return res.send(400, 'Bad request - username, password or email is missing');
    }

    User.findOne({ $or: [ {username: userData.username}, {email: userData.email} ] }).exec(function(err, user) {
        if (err) { return next(err); }
        if (user) { return res.send(400, 'Bad request - user with such username or email already exists'); }

        User.create(userData, function(err, user) {
            if (err) { return next(err); }

            res.send(201, generateSigninResponse(user));
        })
    })
};

exports.login = function(req, res, next) {
    var userData = req.body;

    if (!userData.username || !userData.password) {
        return res.send(400, 'Bad request - username or password is missing');
    }

    User.findOne({ username: userData.username }, function(err, user) {
        if (err) { return next(err); }
        if (!user) { return res.send(400, 'Bad request - invalid username'); }

        if(!user.authenticate(userData.password)) {
            return res.send(400, 'Bad request - invalid password');
        }

        res.send(200, generateSigninResponse(user));
    })
};

exports.deleteUser = function(req, res, next) {
    User.findByIdAndRemove(req.params.id, function(err) {
        if (err) { return next(err); }

        res.send(200);
    })
};

exports.getCurrentUser = function(req, res, next) {
    res.send(req.user);
};