const mongoose = require('mongoose');
const { Schema } = mongoose;

const questSchema = new Schema({
    Name:String,
    Objective:String,
    Tag:String,
    Level:Number,
    Description:String
});

mongoose.model("quests",questSchema);















