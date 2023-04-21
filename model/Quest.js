const mongoose = require('mongoose');
const { Schema } = mongoose;

const questSchema = new Schema({
    _id:String,
    qName:String,
    Objective:String,
    Tag:String,
    Level:Number,
    Description:String,
    Maxprogress:Number
});

mongoose.model("quests",questSchema);















