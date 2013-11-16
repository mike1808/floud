var mongoose = require('mongoose'),
    Schema = mongoose.Schema,
    crypto = require('crypto');

var UserSchema = new Schema({
    fullname: {
        type: String,
        trim: true
    },

    username: {
        type: String,
        required: true,
        trim: true,
        unique: true
    },


    hashedPassword: String,
    salt: String,

    email: { type: String, required: true },

    updated: { type: Date, default: Date.now },
    created: { type: Date, default: Date.now }
});


UserSchema.virtual('gravatar').get(function () {
    var emailHash = crypto.createHash('md5').update(this.email).digest('hex');
    return 'http://www.gravatar.com/avatar/' + emailHash;
});


UserSchema
    .virtual('password')
    .set(function(password) {
        this._password = password;
        this.salt = this.makeSalt();
        this.hashedPassword = this.encryptPassword(password);
    })
    .get(function () {
        return this._password
    });


UserSchema.method('authenticate', function (plainText) {
    return this.encryptPassword(plainText) === this.hashedPassword;
});

UserSchema.method('makeSalt', function () {
    return Math.round((new Date().valueOf() * Math.random())) + '';
});

UserSchema.method('encryptPassword', function (password) {
    return crypto.createHmac('sha1', this.salt).update(password).digest('hex');
});

mongoose.model('User', UserSchema);