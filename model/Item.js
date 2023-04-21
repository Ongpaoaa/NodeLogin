const mongoose = require('mongoose');
const { Schema } = mongoose;

const itemSchema = new Schema({
    Name: String,
    No: Number,
    Rarity: Number,
    Description: String,
    Type: String,
    Tag: String,
    Date: {type: Date, default: Date.now}
});

mongoose.model('items', itemSchema);