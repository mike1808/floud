var mongoose = require('mongoose');
var Schema = mongoose.Schema;

var FileSchema = new Schema({
    path: {
        type: String
    },

    size: {
        type: Number,
        required: true
    },

    version: {
        type: Number,
        default: 0
    },

    hash: String,

    user: {
        type: Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },

    deleted: {
        type: Boolean,
        default: false
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