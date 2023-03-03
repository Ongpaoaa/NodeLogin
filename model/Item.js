const mongoose = require('mongoose');
const { Schema } = mongoose;

const itemSchema = new Schema({
    Name: String,
    No: Number,
    Rarity: Number,
    Description: String,

});

mongoose.model('items', itemSchema);