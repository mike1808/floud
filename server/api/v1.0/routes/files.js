var mongoose = require('mongoose'),
    File = mongoose.model('File'),
    fs = require('fs'),
    path = require('path');

function createResponseData(files) {
    return files.map(function(file) {
        return {
            path: file.path,
            version: file.version,
            size: file.size,
            hash: file.hash,
            modified: file.modified,
            created: file.created
        };
    });
}

exports.getList = function(req, res, next) {
    File.find({ user: req.user.id }).exec(function(err, files) {
        if (err) { return next(err); }

        res.send(createResponseData(files));
    })
};