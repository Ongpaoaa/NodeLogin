require("dotenv").config();
const express = require('express');


const app = express();
const bodyParser = require('body-parser');


app.use(bodyParser.urlencoded({ extended: false}))
app.use(express.json());

// Setup DB
const mongoose = require('mongoose');
mongoose.set('strictQuery',false);

mongoose.connect(process.env.mongoURI, {useNewUrlParser: true});

//Setup database models
require('./model/Quest')
require('./model/Account');
require('./model/Item');



//setup routes
require('./routes/authenticationRoutes')(app);
require('./routes/itemRoutes')(app);
require('./routes/questRoute')(app);

const port = 13756
app.listen(port, () => {
    console.log("Listening on " + port)
})