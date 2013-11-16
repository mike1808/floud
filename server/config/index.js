var nconf = require('nconf');
var path = require('path');

nconf.argv()
    .env()
    .file({ file: path.join(__dirname, nconf.get('NODE_ENV') + '.json') });

module.exports = nconf;