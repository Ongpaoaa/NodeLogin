const mongoose = require("mongoose");
const quest = mongoose.model("quests");
const Account = mongoose.model("accounts");
const Item = mongoose.model("items");

module.exports = (app) => {
  //create quest
  app.post("/quest/create", async (req, res) => {
    console.log(req.body);
    const { qId, qName, rObjective, rTag, rLevel, rDescription } = req.body;

    if (
      qId == null ||
      qName == null ||
      rObjective == null ||
      rTag == null ||
      rLevel == null ||
      rDescription == null
    ) {
      res.send("Not enough info");
      return;
    }

    var findQuest = await quest.findOne({ qName: qName });

    if (findQuest == null) {
      var newQuest = new quest({
        _id: "q" + `${qId}`,
        qName: qName,
        Objective: rObjective,
        Tag: rTag,
        Level: rLevel,
        Description: rDescription,
      });

      newQuest.save();

      res.send(newQuest);
    }
  });

  app.put("/quest/give", async (req, res) => {
    const { rUsername } = req.body;
    const { rName } = req.body;
    // const qDescription = await quest.findOne({qName:rName})
    // const qAccount = await Account.findOne({username:rUsername})

    try {
      const qAccount = await Account.findOne({ username: rUsername });
      const qDescription = await quest.findOne({ qName: rName });
      await Account.updateOne(
        { username: rUsername },
        {
          $set: {
            quest: {
              qDescription
            },
          },
        },
        { new: true }
      );

      // await qAccount.save();

      console.log(qDescription);
      console.log(qAccount);
      res.send(qAccount);
    } catch (err) {
      // Handle error
      console.error(err);
    }
  });
};
