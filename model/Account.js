const mongoose = require('mongoose');
const { Schema } = mongoose;

const accountSchema = new Schema({
    email: String,
    username: String,
    password: String,
    item: Object,
    lastAuthentication: Date,
});

mongoose.model('accounts', accountSchema);