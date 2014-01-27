var fs = require('fs');
var path = require('path');
var config = require('config');

/**
 * Callback function of saveFile
 * @typedef {function} saveFileCallback
 * @param error
 * @param filePath
 */

/**
 * Saves file
 * @param {string} filePath    - path of the file that will be saved
 * @param {string} fileId      - id of the file
 * @param {object} user        - user object with username and id
 * @param {saveFileCallback} callback
 */
function saveFile(filePath, fileId, user, callback) {
    var newFilePath = _getFilePath(config.get('storage:path'), fileId, user);

    fs.exists(path.dirname(newFilePath), function(exists) {
        if (exists) {
            moveFile();
        } else {
            fs.mkdir(path.dirname(newFilePath), function(err) {
                if (err) return callback(err);
                moveFile();
            });
        }
    });


    function moveFile() {
        fs.rename(filePath, newFilePath, function(err) {
            if (err) return callback(err);
            callback(err, newFilePath);
        });
    }

}
/**
 * Coping file to a public folder
 * @param filePath file that need to be copied
 * @param fileId   fileId for uniqueness
 * @param fileName fileName
 * @param cb       callback with new file path
 */
function makePublic(filePath, fileId, fileName, cb) {
    var publicFolder = path.resolve(config.get('storage:public'), fileId);
    var publicFile = path.resolve(publicFolder, fileName);

    fs.exists(publicFile, function(exists) {
        if (exists) { return cb(publicFile); }
        fs.mkdir(publicFolder, function(err) {
            if (err) return cb(err);

            var readStream = fs.createReadStream(filePath);
            var writeStream = fs.createWriteStream(publicFile);

            readStream.pipe(writeStream);

            writeStream
                .on('error', cb)
                .on('finish', function() {
                    cb(publicFile);
                });
        });
    });
}

/**
 * Gets path of file with specified user and version
 * @param {string} storagePath - path of locale storage
 * @param {string} fileId      - id of the file
 * @param {object} user        - user object with username and id
 * @returns {string}           - path of file
 * @private
 */
function _getFilePath(storagePath, fileId, user) {
    return path.join(storagePath, user.username + '-' + user.id, fileId);
}

exports.saveFile = saveFile;
exports.makePublic = makePublic;
exports.getFilePath = function(fileId, user) {
    return _getFilePath(config.get('storage:path'), fileId, user);
};