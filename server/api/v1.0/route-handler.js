var auth = require('auth');
var files = require('./routes/files');


module.exports = function(app) {
    app.get('/files', auth.requiresLogin, files.getList);
};