var nconf = require('nconf');
var path = require('path');

nconf.argv()
    .env()
    .file({ file: path.join(__dirname, nconf.get('NODE_ENV') + '.json') });

/**
 * Setting storage folder to 'root_folder/storage:path'
 */
nconf.set('storage:path', path.resolve(__dirname, '../' + nconf.get('storage:path')));

module.exports = nconf;