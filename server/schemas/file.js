var mongoose = require('mongoose');
var Schema = mongoose.Schema;

var FileSchema = new Schema({
    path: String,

    size: Number,
    version: Number,
    hash: String,

    user: {
        type: Schema.Types.ObjectId,
        ref: 'User'
    },

    created: {
        type: Date,
        default: Date.now
    },
    modified: {
        type: Date,
        default: Date.now
    }
});

FileSchema.index({ path: 1, version: 1}, { unique: true });

mongoose.model('File', FileSchema);