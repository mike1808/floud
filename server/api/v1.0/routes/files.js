var mongoose = require('mongoose');
var File = mongoose.model('File');
var fs = require('fs');
var path = require('path');
var crypto = require('crypto');
var shasum = crypto.createHash('sha1');
var async = require('async');
var storagePath = require('config').get('storage:path');

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


function computeShaSum(filepath, callback) {
    var s = fs.ReadStream(filepath);
    s.on('data', function(d) {
        shasum.update(d);
    });

    s.on('end', function() {
        callback(null, shasum.digest('hex'));
    });

    s.on('error', function(err) {
        callback(err);
    });
}

function getFilePath(filename, version, user) {
    return path.join(storagePath, user.username + '-' + user.id, filename + '.' + version);
}

function parseFileName(path) {
    var data = path.split('.');
    var version = parseInt(data[data.length - 1]);
    var filename = data.splice(data.length - 1, 1).join('.');
    return {
        version: version,
        path: path
    }
}

exports.getList = function(req, res, next) {
    File.find({ user: req.user.id }).exec(function(err, files) {
        if (err) { return next(err); }

        res.send(createResponseData(files));
    })
};

exports.uploadFile = function(req, res, next) {
    if (!req.files && !req.files.length && !req.body.path && !req.body.size && !req.body.hash) {
        return res.send(401);
    }

    var file = {
        path: req.body.path,
        size: req.body.size,
        hash: req.body.hash
    };

    File.find({ path: req.body.path }, { sort: { version: -1 }}).exec(function(err, files) {
        if (err) { return next(err); }

        var hash;
        async.waterfall([
            computeShaSum(req.files[0].path),
            function(hash, callback) {
                if (files && files.length) {
                    if (files[0].hash == hash) {
                        callback(null, 304);
                    } else {
                        files[0].version++;
                        files[0].save(function(err) {
                            if (err) {
                                callback(err);
                            } else {
                                fs.rename(req.files[0].path, getFilePath(files[0].path, files[0].version, req.body.user),
                                function(err) {
                                    if (err) {
                                        callback(err);
                                    } else {
                                        callback(null, 200);
                                    }
                                });
                            }
                        })
                    }
                } else {
                    if (hash != req.body.hash) {
                        return callback(null, 401);
                    }
                    File.create(file, function(err) {
                        if (err) {
                            callback(err);
                        } else {
                            callback(null, 201);
                        }
                    });
                }
            }
        ], function(err, result) {
            if (err) {
                return next(err);
            }
            res.send(result);
        });
    })
};

exports.sendFile = function(req, res, next) {
    if (!req.body.path) {
        return res.send(401);
    }

    File.find({ path: req.body.path }, { sort: { version: -1 }}).exec(function(err, files) {
        if (err) {
            return next(err);
        }

        if (!files && !files.length) {
            return res.send(404);
        }

        var pendingFile;
        if (req.body.version) {
            files.forEach(function(file) {
                if (file.version == req.body.version) {
                    pendingFile = file;
                }
            })
        }

        if (!pendingFile) {
            return res.send(401, 'File with such version does\'t exist');
        }

        res.sendfile(getFilePath(file.path, file.version, req.body.user));
    })
};