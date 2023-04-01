const mongoose = require('mongoose');
const { Schema } = mongoose;

const accountSchema = new Schema({
    email: String,
    username: String,
    password: String,
    item: Object,
    pending: Object,
    wOof: Object,
    quest: Object,
    finishedQ: Object,
    lastAuthentication: {type: Date, default: Date.now}
});

mongoose.model('accounts', accountSchema);