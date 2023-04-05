const mongoose = require("mongoose");
const quest = mongoose.model("quests");
const Account = mongoose.model("accounts");

module.exports = (app) => {
  //create quest
  app.post("/quest/create", async (req, res) => {
    console.log(req.body);
    const { qName, rObjective, rTag, rLevel, rDescription } = req.body;

    if (
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

  app.post("/quest/give", async (req, res) => {
    // const questName = await req.body.Name;

    const accountName = await req.body.Name;
    const questDescription = await quest.findOne(req.body.qName);
    const questUpdate = Account.findOneAndUpdate(accountName, {
      $push: { quest: { questDescription } },
    }, {new:true});
    

    console.log(questUpdate);
    res.send(questDescription);
  });

  app.get("/quest", async (req, res) => {
    quest.find((err,quests)=>{
      if (err) return next(err);
      res.json(quests);
    })
})

};
