const mongoose = require("mongoose");
const Account = mongoose.model("accounts");
const Tag = mongoose.model("tags");

module.exports = (app) => {

    app.post("/wOof/upstat", async (req, res) => {
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

    app.post("/wOof/updatelevel", async (req, res) => {
    const { rUsername } = req.body;
    
    if (!rUsername) {
        res.send("Not enough info");
        return;
    }
    try {
        const updatedAccount = await Account.findOneAndUpdate(
        { username: rUsername },
        { $inc: { "wOof.Level": 1 } },
        { new: true }
        );
    
        if (!updatedAccount) {
        res.send("User not found");
        return;
        }
    
        console.log(updatedAccount.wOof.Level);
        res.send("Level updated successfully");
    } catch (error) {
        console.error(error);
        res.status(500).send("Internal server error");
    }
    });
    
    app.post("/wOof/updateEXP", async (req, res) => {
    const { rUsername, rExp } = req.body;
    
    if (!rUsername || !rExp) {
        res.send("Not enough info");
        return;
    }
    try {
        const updatedAccount = await Account.findOneAndUpdate(
        { username: rUsername },
        { $inc: { "wOof.Exp": parseInt(rExp) } },
        { new: true }
        );
    
        if (!updatedAccount) {
        res.send("User not found");
        return;
        }
    
        console.log(updatedAccount.wOof.Level);
        res.send("Exp updated successfully");
    } catch (error) {
        console.error(error);
        res.status(500).send("Internal server error");
    }
    });
    
    app.post("/wOof/resetEXP", async (req, res) => {
    const { rUsername} = req.body;
    
    if (!rUsername) {
        res.send("Not enough info");
        return;
    }
    try {
        const updatedAccount = await Account.findOneAndUpdate(
        { username: rUsername },
        { $set: { "wOof.Exp": 0 } },
        { new: true }
        );
    
        if (!updatedAccount) {
        res.send("User not found");
        return;
        }
    
        console.log(updatedAccount.wOof.Level);
        res.send("Exp updated successfully");
    } catch (error) {
        console.error(error);
        res.status(500).send("Internal server error");
    }
    });
};