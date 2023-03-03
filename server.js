const express = require('express');
const keys = require('./config/keys.js');
const app = express();
const bodyParser = require('body-parser');

app.use(bodyParser.urlencoded({ extended: false}))
app.use(express.json());

// Setup DB
const mongoose = require('mongoose');
mongoose.set('strictQuery',false);

mongoose.connect(keys.mongoURI, {useNewUrlParser: true, useUnifiedTopology: true});

//Setup database models
require('./model/Account');
require('./model/Item');

//setup routes
require('./routes/authenticationRoutes')(app);

const port = 13756
app.listen(keys.port, () => {
    console.log("Listening on " + port)
})