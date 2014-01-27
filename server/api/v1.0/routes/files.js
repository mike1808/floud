var mongoose = require('mongoose');
var ObjectId = mongoose.Types.ObjectId;
var File = mongoose.model('File');
var fs = require('fs');
var path = require('path');
var crypto = require('crypto');
var async = require('async');
var fileService = require('file-service');
var utils = require('utils');
var formidable = require('formidable');
var multiparty = require('multiparty');

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


function parseFileName(path) {
    var data = path.split('.');
    var version = parseInt(data[data.length - 1]);
    var filename = data.splice(data.length - 1, 1).join('.');
    return {
        version: version,
        path: path
    }
}

function createFilesTree(files) {
    var tree = { '/': {} };
    files.forEach(function(file) {
        var tokens = file.path.split('/');

        var subtree = tree['/'] ;

        for(var i = 1; i <= tokens.length - 2; i++) {
            if (!subtree[tokens[i]]) {
                subtree[tokens[i]] = {};
            }

            subtree = subtree[tokens[i]];
        }

        if (!subtree.files) {
            subtree.files = [];
        }

        subtree.files.push(file);
    });

    return tree;
}

exports.getList = function(req, res, next) {
    File.aggregate(
        {
            $match: {
                user: ObjectId(req.user.id),
                deleted: false
            }
        },
        {
            $sort: {
                version: -1
            }
        },
        {
            $group: {
                _id: '$path',
                path: { $first: '$path' },
                version: { $first: '$version' },
                size: { $first: '$size' },
                hash: { $first: '$hash' },
                modified: { $first: '$modified' },
                created: { $first: '$created' }
            }
        },
        {
            $project: {
                _id: 0,
                path: 1,
                version: 1,
                size: 1,
                hash: 1,
                modified: 1,
                created: 1
            }
        },

        function(err, files) {
            if (err) { return next(err); }

            var tree = createFilesTree(files);

            res.send(tree);
        });

    /*if (req.query.from) {
        query.where('modified').gte(req.query.from);
    }



    query.exec()*/
};

exports.uploadFile = function(req, res, next) {
    if (!req.files || !req.files.file || !req.body.path || !req.body.size || !req.body.hash) {
        return res.send(400);
    }


    var file = {
        path: req.body.path,
        size: req.body.size,
        hash: req.body.hash,
        user: req.user.id
    };



    var attachedFile = req.files.file;

    File.find({ path: req.body.path }, {}, { sort: { version: -1 }, limit: 1 }).exec(function(err, files) {
        if (err) { return next(err); }


        var latestFile = files && files.length && files[0] || null;

        var hash = attachedFile.hash;

        async.waterfall([
            function(callback) {
                if (file.hash != hash) {
                    return callback(null, { text: 'Files damaged during uploading', status: 400 });
                }

                if (latestFile && latestFile.hash === hash) {
                    return callback(null, { text: 'Uploaded file is the same', status: 304 });
                }

                file.version = (latestFile && latestFile.version + 1) || 0;

                File.create(file, function(err, file) {
                    if (err) {
                        return callback(err);
                    }
                    fileService.saveFile(attachedFile.path, file.id, req.user, function(err, filePath) {
                        if (err) return callback(err);

                        callback(null, { status: 201, data: file });
                    });
                });

            }
        ], function(err, result) {
            if (err) {
                return next(err);
            }

            res.send(result.status, result.text || result.data);
        });
    })
};

exports.sendFile = function(req, res, next) {
    if (!req.query.path) {
        return res.send(401);
    }

    File.find({ path: req.query.path, deleted: false }, {}, { sort: { version: -1 }}).exec(function(err, files) {
        if (err) {
            return next(err);
        }

        if (!files || !files.length) {
            return res.send(404);
        }

        var pendingFile = files[0];
        if (req.query.version !== '') {
            files.forEach(function(file) {
                if (file.version == req.query.version) {
                    pendingFile = file;
                }
            })
        }

        if (!pendingFile) {
            return res.send(401, 'File with such version doesn\'t exist');
        }

        var filePath = fileService.getFilePath(pendingFile.id, req.user);

        res.sendfile(fileService.getFilePath(pendingFile.id, req.user));
    })
};

exports.deleteFile = function(req, res, next) {
    if (!req.query.path || req.query.path === '') {
        return res.send(401, 'No path was specified');
    }

    File.find({ path: req.query.path, deleted: false }, {}, { sort: { version: -1 }}).exec(function(err, files) {
        if (err) {
            return next(err);
        }

        if (!files || !files.length) {
            return res.send(404);
        }

        async.each(files, function(file, cb) {
            file.deleted = true;
            file.save(cb);

        }, function(err) {
            if (err) return next(err);
            res.send(200);
        });
    });
};