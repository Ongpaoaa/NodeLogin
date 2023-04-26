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
        res.send(userAccount); //send user info
        return;
      }
    }

    res.send("Invalid credentials"); //if can't find user
  });

  // This route is used to create a new account
  app.post("/account/create", async (req, res) => {
    // Extract the email, username, and password from the request body
    const { rEmail, rUsername, rPassword, rFyncId } = req.body;

    // If any of the required fields are missing, send an error response
    if (!rEmail || !rUsername || !rPassword || !rFyncId) {
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
      rFyncId: fyncid,
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

  // This route allows clients to retrieve user data based on a provided username
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

  // Handle HTTP POST requests to the "/account/sentgift" route
  app.post("/account/sentgift", async (req, res) => {
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
  app.post("/account/recievegift", async (req, res) => {
    const { rRecieveperson, rSentedperson } = req.body; // Extract data from request body
    if (rSentedperson == null || rRecieveperson == null) {
      // Check if both data are present
      res.send("Not enough info"); // Send error message if data is missing
      return;
    }
    try {
      const recievedAccount = await Account.findOne({
        username: rRecieveperson,
      }); // Look up the account of the receiver
      delete recievedAccount.pending[rSentedperson]; // Remove the sent gift from the receiver's pending gifts
      await recievedAccount.save(); // Save the updated account data
      console.log(recievedAccount); // Log the updated account data
      res.send("Gift received successfully."); // Send success message
    } catch (err) {
      console.error(err); // Log any errors that occur
      res.status(500).send("Internal server error."); // Send error response
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

    if (userAccount.item[rItemName] > 1){
      userAccount.item[rItemName] -= 1;
    }
    else if (userAccount.item[rItemName] == 1){
      db.item.update({},{$unset: {[Names] : userAccount.item[rItemName] }});
    }

    res.send("complete");
};
