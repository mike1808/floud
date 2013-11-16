var fs = require('fs');
var path = require('path');
var log = require('log')(module);
var mongoose = require('mongoose');

module.exports = function(db) {
    //Init Database connection
    log.info('Initializing database connection');
    mongoose.connect(db);
    log.info('Connected to: %s', db);

    //Init model schemas
    log.info('Initializing model schemas');
    var schemasPath = './schemas',
        schemaFiles = fs.readdirSync(schemasPath);

    schemaFiles.forEach(function(file) {
        require(path.join(schemasPath, file));
        log.info('Model schema initialized: %s', file);
    });
};