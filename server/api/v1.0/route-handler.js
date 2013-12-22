var auth = require('auth');
var path = require('path');
var files = require('./routes/files');
var users = require('./routes/users');
var multipart = require('connect-multiparty');
var multipartMiddleware = multipart({
    uploadDir: path.join(process.cwd(), 'tmp'),
    autoFiles: true,
    hash: 'sha1'
});

module.exports = function(app) {
    app.get('/files', auth.requiresLogin, files.getList);
    app.post('/files', auth.requiresLogin, multipartMiddleware, files.uploadFile);
    app.get('/files/file', auth.requiresLogin, files.sendFile);
    app.delete('/files', auth.requiresLogin, files.deleteFile);

    app.put('/users', users.createUser);
    app.post('/users/login', users.login);
    app.delete('/users/:id', users.deleteUser);
    app.get('/users/current', auth.requiresLogin, users.getCurrentUser);
};

