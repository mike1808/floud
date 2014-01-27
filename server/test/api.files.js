var should  = require('should');
var fs      = require('fs');
var path    = require('path');
var request = require('supertest');
var utils   = require(path.join(process.cwd(), '/libs/utils'));

request = request('http://localhost:3000/api/v1.0');

describe('File API', function() {
    var token;
    var fixture = path.join(process.cwd(),'test/fixtures/razer.png');

    before(function(done) {
        var userData = {
            username: 'TestUser',
            password: '123456',
            email: 'example@domain.com'
        };

        request
            .post('/users/login')
            .send({
                username: userData.username,
                password: userData.password
            })
            .end(function(err, res) {
                if (err) return done(err);

                if (res.statusCode == 200) {
                    token = res.body.token;
                    done();
                } else {
                    request
                        .put('/users')
                        .send(userData)
                        .end(function(err, res) {
                            if (err) return done(err);

                            token = res.body.token;
                            done();
                        });
                }
            });
    });


    describe('POST /files', function(done) {
        it('should response with bad request if no token is sent', function(done) {
            request
                .post('/files')
                .expect(400, function(err, res) {
                    if (err) return done(err);
                    res.text.should.equal('Bad request - no auth token found');
                    done();
                });
        });
        it('should response with bad request if post data is incorrect', function(done) {
            request
                .post('/files')
                .set('Authorization', token)
                .expect(400, done);
        });

        it('should upload file and response with wright json', function(done) {
            utils.computeCheckSum(fixture, function(err, hash) {
                if (err) return done(err);

                fs.stat(fixture, function(err, file) {
                    if (err) return done(err);

                    var data = {
                        hash: hash,
                        path: '/files/mine/file.bin',
                        size: file.size
                    };

                    request
                        .post('/files')
                        .set('Authorization', token)
                        .set('Accept', 'application/json')
                        .attach('file', fixture)
                        .field('hash', data.hash)
                        .field('path', data.path)
                        .field('size', data.size)
                        .expect('Content-Type', /json/)
                        .expect(201, function(err, res) {
                            if (err) return done(err);

                            var file = res.body;

                            file.path.should.be.equal(data.path);
                            file.hash.should.be.equal(data.hash);
                            file.size.should.be.equal(data.size);

                            done();
                        });
                });
            });
        });
    });
});