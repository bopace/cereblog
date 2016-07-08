var mongoose = require('mongoose');
var Schema = mongoose.Schema;

var Post = new Schema({
    post: {
        id: String,
        title: String,
        author: String,
        content: String,
        score: Number
    }
});

module.exports = mongoose.model('Post', Post);