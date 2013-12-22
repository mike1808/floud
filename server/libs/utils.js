var crypto = require('crypto');
var fs     = require('fs');

/**
 * Computes SHA1 checksum of the specified file
 * @param {string}   filepath
 * @param {function} callback
 */
function computeSha1CheckSum(filepath, callback) {
    var shasum = crypto.createHash('sha1');

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

exports.computeCheckSum = computeSha1CheckSum;