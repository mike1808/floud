var express = require('express');
var app = module.exports = express();
var log = require('log')(module);

require('./route-handler')(app);

function logErrors(err, req, res, next) {
    log.error(err);
    log.error(err.stack);
    next(err);
}

function clientErrorHandler(err, req, res, next) {
    if (req.xhr) {
        res.send(500, { error: 'Something blew up!' });
    } else {
        next(err);
    }
}

function errorHandler(err, req, res, next) {
    res.status(500);
    res.send('Something blew up!');
}

app.use(logErrors);
app.use(clientErrorHandler);
app.use(errorHandler);