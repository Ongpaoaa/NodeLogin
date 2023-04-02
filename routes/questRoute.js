const mongoose = require("mongoose");
const quest = mongoose.model("quests");

module.exports = app => {

  //create quest
  app.post("/quest/create", async (req, res) => {
    console.log(req.body);
    const { rName, rObjective, rTag, rLevel, rDescription } = req.body;

    if (
      rName == null ||
      rObjective == null ||
      rTag == null ||
      rLevel == null ||
      rDescription == null
    ) {
      res.send("Not enough info");
      return;
    }

    var findQuest = await quest.findOne({Name:rName});

    if (findQuest == null) {
      
      var newQuest = new quest({
        Name:rName,
        Objective:rObjective,
        Tag:rTag,
        Level:rLevel,
        Description:rDescription
      })
      
      newQuest.save();

      res.send(newQuest);
    }

  });

  app.post('quest/')



};
