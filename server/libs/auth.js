var crypto = require('crypto'),
    mongoose = require('mongoose'),
    User = mongoose.model('User'),
    algorithm = 'aes-256-cbc',
    key,
    iv,
    token_expiry_min,
    moment = require('moment'),
    log = require('log')(module);


var auth_token_timestamp = "YYYY-MM-DDTHH:mm:ssZ";

exports.init = function(config) {
    log.info('Initializing authentication');

    // our secret key   
    key = new Buffer(config.key, 'base64').toString('binary');
    // our secret vector
    iv = new Buffer(config.iv, 'base64').toString('binary');

    token_expiry_min = config.token_expiry_min;
};

function encrypt(text) {
    var cipher = crypto.createCipheriv(algorithm, key, iv);
    var crypted = cipher.update(text, 'utf8', 'base64');
    crypted += cipher.final('base64');
    return crypted;
}

function decrypt(crypted) {
    var decipher = crypto.createDecipheriv(algorithm, key, iv);
    var dec = decipher.update(crypted, 'base64', 'utf8');
    dec += decipher.final('utf8');
    return dec;
}

exports.aes_encrypt = encrypt;
exports.aes_decrypt = decrypt;


function processToken(req, res, next) {
    var auth = req.get('Authorization');

    //Enable URL token param when in Development environment
    var env = process.env.NODE_ENV || 'development';
    if(!auth && env == 'development') {
        auth = req.query.authorization;
    }

    if(!auth) {
        return res.send(400, 'Bad request - no auth token found');
    }


    var tokendata;
    try {
        tokendata = decrypt(auth).split('|');
    } catch(err){
        //Invalid token if couldn't decrypt
        return res.send(400, 'Bad request - invalid auth token');
    }

    //Invalid token if doesn't contain required data
    if(tokendata.length != 3){
        return res.send(400, 'Bad request - invalid auth token');
    }

    var expireDate = moment.utc(tokendata[1], auth_token_timestamp).toDate();

    //Invalid token if expired
    if(expireDate < moment.utc()) {
        res.set('WWW-Authenticate', auth);
        return res.send(401, 'Permission denied - expired auth token');
    }

    req.authdata = {
        userId: tokendata[0],
        expire: expireDate,
        type: tokendata[2]
    };
    res.set('Authorization', auth);

    User.findById(req.authdata.userId, function(err, user) {
        if(err) {
            log.error(err);
            return res.send(500);
        }

        if(!user) {
            return res.send(400, 'Bad request - user specified in the token doesn\'t exists');
        }

        req.user = user;
        next();
    });
}


//Middleware for user request authentication
exports.requiresLogin = function(req, res, next) {
    processToken(req, res, function(){
        if(req.authdata.type != 'access'){
            res.send(403, 'Invalid token type');
            return;
        }
        next();
    })
};


exports.generateNewToken = function(userId, ttl) {
    var timestamp = moment().add('h', ttl || 9).utc().format(auth_token_timestamp);
    return encrypt(userId + '|' + timestamp + '|access');
};