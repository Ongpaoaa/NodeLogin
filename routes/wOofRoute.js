const mongoose = require("mongoose");
const Account = mongoose.model("accounts");
const Tag = mongoose.model("tags");

module.exports = (app) => {

  app.post("/wOof/upstat", async (req, res) => {
    const { rUsername, value, stat } = req.body;
  
    if (!rUsername || !value || !stat) {
      res.send("Not enough information provided");
      return;
    }
  
    try {
      const updateQuery = {
        $inc: { [`wOof.stat.${stat}`]: parseInt(value) }
      };
  
      const updateResult = await Account.updateOne({ username: rUsername }, updateQuery);
  
      if (updateResult.nModified === 0) {
        res.send("Failed to update stat");
      } else {
        res.send("Stat updated successfully");
      }
    } catch (err) {
      console.error(err);
      res.status(500).send("Internal server error");
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