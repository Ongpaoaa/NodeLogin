const mongoose = require('mongoose');
const { Schema } = mongoose;

const tagSchema = new Schema({
    tag: String,
    color: String,
    user: Array
});

mongoose.model('tags', tagSchema);