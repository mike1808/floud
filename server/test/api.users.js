var request = require('supertest');
var should = require('should');

request = request('http://localhost:3000/api/v1.0');

describe('User API', function() {
    var userData = {
        username: 'TestUser',
        password: '123456',
        email: 'example@domain.com'
    };

    before(function(done) {
        request
            .post('/users/login')
            .send({
                username: userData.username,
                password: userData.password
            })
            .end(function(err, res) {
                if (err) return done(err);

                if (res.statusCode == 200) {
                    request
                        .del('/users/' + res.body.userId)
                        .end(done);
                } else done();
            });
    });

    describe('DELETE /users/:id', function() {
        var userId;

        before(function(done) {
            request
                .put('/users')
                .set('Accept', 'application/json')
                .send(userData)
                .expect(201)
                .end(function(err, res) {
                    if (err) return done(err);
                    userId = res.body.userId;
                    done();
                });
        });

        it('should work', function(done) {
            request
                .del('/users/' + userId)
                .expect(200, done);
        });
    });

    describe('PUT /users', function() {
        var userId = '52ada254af371bc00e000003';

        afterEach(function(done) {
            request
                .del('/users/' + userId)
                .end(function(err, res) {
                    done();
                });
        });

        it('should respond with bad request if no data sent', function(done) {
            request
                .put('/users')
                .set('Accept', 'application/json')
                .expect(400, done);
        });

        it('should respond with json', function(done) {
            request
                .put('/users')
                .set('Accept', 'application/json')
                .send(userData)
                .expect('Content-Type', /json/)
                .expect(201)
                .end(function(err, res) {
                    if (err) return done(err);
                    userId = res.body.userId;
                    done();
                });
        });

        it('should respond wright data', function(done) {
            request
                .put('/users')
                .set('Accept', 'application/json')
                .send(userData)
                .expect('Content-Type', /json/)
                .expect(201)
                .end(function(err, res) {
                    if (err) return done(err);
                    userId = res.body.userId;

                    res.body.should.have.property('token');
                    res.body.should.have.property('userId');
                    res.body.should.have.property('email');
                    res.body.should.have.property('gravatar');
                    res.body.should.have.property('expires');

                    done();
                });
        });
    });

    describe('POST /users/login', function() {
        var userId;

        before(function(done) {
            request
                .put('/users')
                .set('Accept', 'application/json')
                .send(userData)
                .end(function(err, res) {
                    userId = res.body.userId;
                    done();
                });
        });

        after(function(done) {
            request
                .del('/users/' + userId)
                .end(function() {
                    done();
                });
        });

        it('should respond with bad request if username or password is missing', function(done) {
            request
                .post('/users/login')
                .expect(400, done);
        });

        it('should respond with bad request if username is wrong', function(done) {
            request
                .post('/users/login')
                .send({
                    username: 'test',
                    password: '12345'
                })
                .expect(400, done);
        });

        it('should respond with bad request if password is wrong', function(done) {
            request
                .post('/users/login')
                .send({
                    username: userData.username,
                    password: '123'
                })
                .expect(400, done);
        });

        it('should respond with right json', function(done) {
            request
                .post('/users/login')
                .set('Accept', 'application/json')
                .expect('Content-Type', /json/)
                .send({
                    username: userData.username,
                    password: userData.password
                })
                .expect(200)
                .end(function(err, res) {
                    if (err) return done(err);

                    res.body.should.have.property('token');
                    res.body.should.have.property('userId');
                    res.body.should.have.property('email');
                    res.body.should.have.property('gravatar');
                    res.body.should.have.property('expires');

                    done();
                });
        });
    });

    describe('GET /users/current', function() {
        var userLoginData = {};

        before(function(done) {
            request
                .put('/users')
                .send(userData)
                .end(function(err, res) {
                    userLoginData = res.body;
                    done();
                });
        });

        after(function(done) {
            request
                .del('/users/' + userLoginData.userId)
                .end(function() {
                    done();
                });
        });

        it('should respond current user data', function(done) {
            request
                .get('/users/current')
                .set('Authorization', userLoginData.token)
                .expect(200)
                .end(function(err, res) {
                    if(err) return done(err);
                    done();
                })
        });

        it('should respond with bad request if no token is assigned', function(done) {
            request
                .get('/users/current')
                .expect(400, done);
        });
    });
});
