const mongoose = require("mongoose");
const Account = mongoose.model("accounts");
const quest = mongoose.model("quests");

module.exports = (app) => {
  //login api
  app.post("/account/login", async (req, res) => {
    const { rUsername, rPassword } = req.body; //use 2 data for login rUsername, rPassword
    if (!rUsername || !rPassword) {
      //if 2 data are null end api
      res.send("Invalid credentials");
      return;
    }

    const userAccount = await Account.findOne({ username: rUsername }); //find username in Account database
    if (userAccount) {
      //if find user account
      if (rPassword === userAccount.password) {
        //check password
        userAccount.lastAuthentication = Date.now(); //update date
        await userAccount.save();
        res.send("logged in"); //send user info
        return;
      }
    }

    res.send("Invalid credentials"); //if can't find user
  });

  // This route is used to create a new account
  app.post("/account/create", async (req, res) => {
    // Extract the email, username, and password from the request body
    const { rEmail, rUsername, rPassword } = req.body;

    // If any of the required fields are missing, send an error response
    if (!rEmail || !rUsername || !rPassword ) {
      res.send("Invalid credentials");
      return;
    }

    // Check if there is already an account with the same username or email
    const userAccount = await Account.findOne({ username: rUsername });
    const emailAccount = await Account.findOne({ email: rEmail });
    console.log(emailAccount);
    console.log(userAccount);
    // If there is already an account with the same email, send an error response
    if (emailAccount) {
      res.send("Email or Username is already taken ");
      return;
    }

    // If there is already an account with the same username, send an error response
    if (userAccount) {
      res.send("Username is already taken");
      return;
    }

    // Define the favorite and disliked foods for the new account
    const foodTypes = [
      "spicy",
      "fried",
      "sweet",
      "bread",
      "meat",
      "vegetable",
      "fruit",
    ];
    const favoriteFoods = [
      foodTypes.shift(),
      foodTypes.shift(),
      foodTypes.shift(),
    ];
    const dislikedFoods = [foodTypes.pop(), foodTypes.pop(), foodTypes.pop()];

    // Create a new account with the given data and default values for other fields
    const newAccount = new Account({
      email: rEmail,
      username: rUsername,
      password: rPassword,
      fyncid: "not have data",
      wOof: {
        favoritef: favoriteFoods,
        dislike: dislikedFoods,
        type: "",
        stat: {
          CP: 0,
          EN: 0,
          MP: 0,
          hp: 0,
        },
      },
      item: { rock: 1, gun: 3 },
      quest: [{}],
      lastAuthentication: Date.now(),
    });

    // Save the new account to the database
    await newAccount.save();

    // Send a success response with the new account object
    res.send(newAccount);
  });

  app.post("/account/give", async (req, res) => {
    const { rUsername, rItemName } = req.body;

    if (!rUsername || !rItemName) {
      res.send("Not enough info");
      return;
    }

    const userAccount = await Account.findOne({ username: rUsername });
    let itemAmount = 0;
    if (userAccount.item.hasOwnProperty(rItemName)) {
      itemAmount = parseInt(userAccount.item[rItemName]);
      console.log(parseInt(userAccount.item[rItemName]));
    } else {
      itemAmount = 0;
    }
    const Names = "item." + rItemName;

    const updateQuery = {
      $set: { [Names]: itemAmount + 1 },
    };

    const updateResult = await Account.updateOne(
      { username: rUsername },
      updateQuery
    );

    if (updateResult.nModified === 0) {
      res.send("Failed to update item amount");
    } else {
      res.send(updateQuery.$set);
    }
  });

  app.get("/account/getdata/:username", async (req, res) => {
    var rusername = req.params.username; // Retrieve the username from the request body
    console.log(rusername);
    // Check if the username is null or undefined

    // Query the database for an Account document that has the specified username
    var userAccount = await Account.findOne({ username: rusername });
    console.log(userAccount);
    res.send(userAccount); // Send the user data as a response
    return;
  });
  
  // This route allows clients to retrieve user data based on a provided username
  app.post("/account/sentgift", async (req, res) => {
    try {
      // Extract the required fields from the request body
      const { rSentedPerson, rRecievePerson, rGift } = req.body;
  
      // Check if all the required fields are present
      if (!rSentedPerson || !rRecievePerson || !rGift) {
        // Send a "Not enough info" response to the client and return from the function
        res.send("Not enough info");
        return;
      }
  
      // Look up the sender and receiver accounts in the database
      const sentedAccount = await Account.findOne({ username: rSentedPerson });
      const receivedAccount = await Account.findOne({ username: rRecievePerson });
  
      if (!sentedAccount || !receivedAccount) {
        // Send an error response if either the sender or receiver account is not found
        res.send("Sender or receiver account not found");
        return;
      }
  
      // Check if the sender has the gift in their item object
      if (!sentedAccount.item || !sentedAccount.item[rGift]) {
        // Send an error response if the gift is not found in the sender's item object
        res.send("Gift not found in sender's item object");
        return;
      }
  
      // Initialize the receiver's pending object if it doesn't exist
      if (!receivedAccount.pending) {
        receivedAccount.pending = {};
      }
  
    receivedAccount.pending = { ...receivedAccount.pending, [rSentedPerson]: rGift };
    
    await sentedAccount.save();
    // Remove the gift from the sender's item object
    
    itemAmount = parseInt(sentedAccount.item[rGift]);
    console.log(parseInt(sentedAccount.item[rGift]));
    
    const Names = "item." + rGift;
    
    if (itemAmount > 1){
      updateQuery = { $set: { [Names]: itemAmount - 1}};
    }
    else if (itemAmount == 1){
      updateQuery = {$unset: {[Names] : itemAmount }};
    }

    const updateResult = await Account.updateOne(
      { username: sentedAccount },
      updateQuery
    );
    // Save the updated sender and receiver accounts
    
  
  
      // Send a success response to the client
      res.send("Gift sent successfully");
    } catch (err) {
      // Handle any errors that occur during the process
      console.error(err);
      res.status(500).send("Internal server error");
    }
  });
  

  // Handle POST requests to '/account/recievegift'
  app.post("/account/receivegift", async (req, res) => {
    const { rReceivePerson, rSentedPerson } = req.body;

  if (!rReceivePerson || !rSentedPerson) {
    res.send("Not enough info");
    return;
  }

  try {
    const receivedAccount = await Account.findOne({ username: rReceivePerson });

    if (!receivedAccount.pending || !receivedAccount.pending[rSentedPerson]) {
      res.send("Gift not found in receiver's pending gifts");
      return;
    }

    await receivedAccount.updateOne({
      $unset: { [`pending.${rSentedPerson}`]: 1 },
    });

    console.log(receivedAccount);
    res.send(receivedAccount);
  } catch (err) {
    console.error(err);
    res.status(500).send("Internal server error.");
  }
  });
  

  app.post("/account/upstat", async (req, res) => {
    const { rUsername, value, stat } = req.body;
    try {
      const filter = { username: rUsername };
      const acc = await Account.findOneAndUpdate(filter);
      const update = {
        $set: {
          "wOof.stat": {
            ...acc.wOof.stat, // Keep the old values of wOof.stat
            [stat]: parseInt(value), // Set the new value for the specified stat
          },
        },
      };
      const options = { new: true }; // Return the updated document
      const updatedAcc = await Account.findOneAndUpdate(
        filter,
        update,
        options
      );

      console.log(updatedAcc);
      res.send(updatedAcc);
    } catch (err) {
      console.log(err);
      res.status(500).send("Internal server error.");
    }
  });

  app.post("/account/deleteitem", async (req, res) => {
    const { rUsername, rItemName } = req.body;

    if (!rUsername || !rItemName) {
      res.send("Not enough info");
      return;
    }

    const userAccount = await Account.findOne({ username: rUsername });

    if (userAccount.item.hasOwnProperty(rItemName)) {
      itemAmount = parseInt(userAccount.item[rItemName]);
      console.log(parseInt(userAccount.item[rItemName]));
    } else {
    }
    const Names = "item." + rItemName;
    
    if (itemAmount > 1){
      updateQuery = { $set: { [Names]: itemAmount - 1}};
    }
    else if (itemAmount == 1){
      updateQuery = {$unset: {[Names] : itemAmount }};
    }

    const updateResult = await Account.updateOne(
      { username: rUsername },
      updateQuery
    );

    if (updateResult.nModified === 0) {
      res.send("Failed to update item amount");
    } else {
      res.send(updateQuery.$set);
    }
  });

  app.post("/account/deletemultipleitem", async (req, res) => {
    const { rUsername, rItemName, rNumber } = req.body;

    if (!rUsername || !rItemName || !rNumber) {
      res.send("Not enough info");
      return;
    }

    const userAccount = await Account.findOne({ username: rUsername });

    if (userAccount.item.hasOwnProperty(rItemName)) {
      itemAmount = parseInt(userAccount.item[rItemName]);
      console.log(parseInt(userAccount.item[rItemName]));
    } else {
    }
    const Names = "item." + rItemName;
    
    if (itemAmount > 1){
      updateQuery = { $set: { [Names]: itemAmount - rNumber}};
    }
    else if (itemAmount == 1){
      updateQuery = {$unset: {[Names] : itemAmount }};
    }

    const updateResult = await Account.updateOne(
      { username: rUsername },
      updateQuery
    );

    if (updateResult.nModified === 0) {
      res.send("Failed to update item amount");
    } else {
      res.send(updateQuery.$set);
    }
  });

  app.post("/account/editfyncid", async (req, res) => {
    const { rUsername, rFyncId } = req.body;
    if (!rUsername || !rFyncId) {
      res.send("Not enough info");
      return;
    }

    updateQuery = { $set: { fyncid: rFyncId}};


    const updateResult = await Account.updateOne(
      { username: rUsername },
      updateQuery
    );

    if (updateResult.nModified === 0) {
      res.send("Failed to update item amount");
    } else {
      res.send(updateQuery.$set);
    }

  });


  app.get("/account/getbyfync/:FyncId", async (req, res) => {
    var rFyncId = req.params.FyncId; // Retrieve the username from the request body
    // Check if the username is null or undefined
    // Query the database for an Account document that has the specified username
    var userAccount = await Account.findOne({ fyncid: rFyncId });
    console.log(userAccount.username);
    res.send(userAccount.username); // Send the user data as a response
    return;
  });

  app.post("/account/deletemultipleitem", async (req, res) => {
    const { rUsername, rItemName, rNumber } = req.body;

    if (!rUsername || !rItemName || !rNumber) {
      res.send("Not enough info");
      return;
    }

    const userAccount = await Account.findOne({ username: rUsername });

    if (userAccount.item.hasOwnProperty(rItemName)) {
      itemAmount = parseInt(userAccount.item[rItemName]);
      console.log(parseInt(userAccount.item[rItemName]));
    } else {
    }
    const Names = "item." + rItemName;
    
    if (itemAmount > 1){
      updateQuery = { $set: { [Names]: itemAmount - rNumber}};
    }
    else if (itemAmount == 1){
      updateQuery = {$unset: {[Names] : itemAmount }};
    }

    const updateResult = await Account.updateOne(
      { username: rUsername },
      updateQuery
    );

    if (updateResult.nModified === 0) {
      res.send("Failed to update item amount");
    } else {
      res.send(updateQuery.$set);
    }
  });
};
