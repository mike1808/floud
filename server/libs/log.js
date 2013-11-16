var winston = require('winston');
var ENV = process.env.NODE_ENV;

function makeLogger(path) {
    var transports = [
        new winston.transports.Console({
            colorize: true,
            level: ENV == 'development' ? 'debug' : 'error',
            label: path
        }),
        new winston.transports.File({
            filename: 'debug.log',
            level: 'debug'
        })
    ];

    return new winston.Logger({ transports: transports });
}

module.exports = function(module) {
    return makeLogger(module.filename.split('\\').slice(-2).join('/'));
};