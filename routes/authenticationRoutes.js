const mongoose = require('mongoose');
const Account = mongoose.model('accounts');
const quest = mongoose.model("quests");

module.exports = app => {

//login api
    app.post('/account/login', async (req, res) => {
        const { rUsername, rPassword } = req.body; //use 2 data for login rUsername, rPassword
        if (!rUsername || !rPassword) { //if 2 data are null end api
        res.send("Invalid credentials");
        return;
        }
    
        const userAccount = await Account.findOne({ username: rUsername }); //find username in Account database
        if (userAccount) {  //if find user account  
        if (rPassword === userAccount.password) { //check password
            userAccount.lastAuthentication = Date.now(); //update date
            await userAccount.save();
            res.send(userAccount); //send user info
            return;
        }
        }
    
        res.send('Invalid credentials'); //if can't find user
    });

        // This route is used to create a new account
    app.post('/account/create', async (req, res) => {
    
        // Extract the email, username, and password from the request body
        const { rEmail, rUsername, rPassword } = req.body;
    
        // If any of the required fields are missing, send an error response
        if (!rEmail || !rUsername || !rPassword) {
        res.send('Invalid credentials');
        return;
        }
    
        // Check if there is already an account with the same username or email
        const userAccount = await Account.findOne({ username: rUsername });
        const emailAccount = await Account.findOne({ email: rEmail });
    
        // If there is already an account with the same email, send an error response
        if (emailAccount) {
        res.send('Email is already taken');
        return;
        }
    
        // If there is already an account with the same username, send an error response
        if (userAccount) {
        res.send('Username is already taken');
        return;
        }
    
        // Define the favorite and disliked foods for the new account
        const foodTypes = ['spicy', 'fried', 'sweet', 'bread', 'meat', 'vegetable', 'fruit'];
        const favoriteFoods = [foodTypes.shift(), foodTypes.shift(), foodTypes.shift()];
        const dislikedFoods = [foodTypes.pop(), foodTypes.pop(), foodTypes.pop()];
    
        // Create a new account with the given data and default values for other fields
        const newAccount = new Account({
        email: rEmail,
        username: rUsername,
        password: rPassword,
        wOof: {
            hp: 120,
            favoritef: favoriteFoods,
            dislike: dislikedFoods,
            type: '',
            en: 5,
            str: 5,
            int: 5
        },
        quest:[{}],
        lastAuthentication: Date.now()
        });
    
        // Save the new account to the database
        await newAccount.save();
    
        // Send a success response with the new account object
        res.send(newAccount);
    });

            // Create a POST route for giving an item to a user
    app.post('/account/give', async (req, res) => {
        const { rUsername, rItemName } = req.body; // Get the username and item name from the request body

        // Check if either the username or the item name are not provided
        if (!rUsername || !rItemName) {
            res.send("Not enough info"); // Send a response indicating that there isn't enough info to complete the request
            return;
        }

        // Find the user's account in the database using their username
        const userAccount = await Account.findOne({ username: rUsername });

        // Get the current amount of the given item the user has (if they have any)
        const itemAmount = parseInt(userAccount.item[rItemName] || 0);

        // Construct the query to update the item amount by incrementing it by 1
        const Names = 'item.' + rItemName;
        const updateQuery = {
            $set: { [Names]: itemAmount + 1 }
        };

        // Update the user's account in the database with the new item amount
        const updateResult = await Account.updateOne({ username: rUsername }, updateQuery);

        // Check if the update was successful
        if (updateResult.nModified === 0) {
            res.send("Failed to update item amount"); // Send a response indicating that the update failed
        } else {
            res.send(updateQuery.$set); // Send a response indicating the new item amount
        }
    });



        // This route allows clients to retrieve user data based on a provided username
    app.post('/account/getdata', async (req, res) => {
        const {rUsername} = req.body; // Retrieve the username from the request body
        
        // Check if the username is null or undefined
        if (rUsername == null) {
            res.send("Please input user name"); // If so, send a response with an error message and return
            return;
        }
        
        // Query the database for an Account document that has the specified username
        var userAccount = await Account.findOne({ username : rUsername});
        
        res.send(userAccount); // Send the user data as a response
        return;
    })


    // Handle HTTP POST requests to the "/account/sentgift" route
    app.post('/account/sentgift', async (req, res) => {
        // Extract the required fields from the request body
        const { rSentedperson, rRecieveperson, rGift } = req.body;
    
        // Check if all the required fields are present
        if (!rSentedperson || !rRecieveperson || !rGift) {
        // Send a "Not enough info" response to the client and return from the function
        res.send("Not enough info");
        return;
        }
        
        // Look up the sender and receiver accounts in the database
        const sentedAccount = await Account.findOne({ username: rSentedperson });
        const recievedAccount = await Account.findOne({ username: rRecieveperson });
        
        // Convert the value of the gift in the receiver's and sender's item object to an integer
        const dulp = parseInt(recievedAccount.item[rGift]);
        const dulp2 = parseInt(sentedAccount.item[rGift]);
        
        // Construct an object to update the sender's account in the database
        const obj2 = { [`item.${rGift}`]: dulp2 - 1 };
        
        // Update the sender's account in the database with the new gift count
        await Account.updateOne({ username: rSentedperson }, { $set: obj2 });
        
        // Check if the gift is not in the receiver's item object
        if (isNaN(dulp)) {
        // Construct an object to update the receiver's pending gift list in the database
        const obj = { [`pending.${rSentedperson}`]: rGift };
        
        // Update the receiver's account in the database with the pending gift
        await Account.updateOne({ username: rRecieveperson }, { $set: obj });
        
        // Send a "complete1" response to the client
        res.send("complete1");
        }
    });
    


            // Handle POST requests to '/account/recievegift'
    app.post('/account/recievegift', async (req, res) => {
        const { rRecieveperson, rSentedperson } = req.body; // Extract data from request body
        if (rSentedperson == null || rRecieveperson == null) { // Check if both data are present
        res.send("Not enough info"); // Send error message if data is missing
        return;
        } 
        try {
        const recievedAccount = await Account.findOne({ username: rRecieveperson }); // Look up the account of the receiver
        delete recievedAccount.pending[rSentedperson]; // Remove the sent gift from the receiver's pending gifts
        await recievedAccount.save(); // Save the updated account data
        console.log(recievedAccount); // Log the updated account data
        res.send("Gift received successfully."); // Send success message
        } catch (err) {
        console.error(err); // Log any errors that occur
        res.status(500).send("Internal server error."); // Send error response
        }
    });  
    
}