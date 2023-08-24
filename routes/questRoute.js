const mongoose = require("mongoose");
const quest = mongoose.model("quests");
const Account = mongoose.model("accounts");
const Item = mongoose.model("items");

module.exports = (app) => {
  //create quest
  app.post("/quest/create", async (req, res) => {
    console.log(req.body);
    const { qId, qName, rObjective, rTag, rLevel, rDescription, rMaxprogress } =
      req.body;

    if (
      qId == null ||
      qName == null ||
      rObjective == null ||
      rTag == null ||
      rLevel == null ||
      rDescription == null ||
      rMaxprogress == null
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
        Maxprogress: parseInt(rMaxprogress),
      });
      console.log(parseInt(rMaxprogress));
      newQuest.save();

      res.send(newQuest);
    }
  });

  app.post("/quest/give", async (req, res) => {
    const { rUsername } = req.body;
    const { rName } = req.body;
    // const qDescription = await quest.findOne({qName:rName})
    // const qAccount = await Account.findOne({username:rUsername})

    try {
      const qAccount = await Account.findOne({ username: rUsername });
      const questAmount = qAccount.quest.length;
      if (questAmount < 3) {
        await Account.updateOne(
          { username: rUsername },
          {
            $push: {
              quest: {
                rName,
                progress: 0,
              },
            },
          },
          { new: true }
        );
        res.send(qAccount);
      } else {
        res.send("already have 3 quest");
      }
    } catch (err) {
      // Handle error
      console.error(err);
    }
  });

  app.post("/quest/weeklyGive", async (req, res) => {
    const { rUsername } = req.body;
    const { rName } = req.body;
    // const qDescription = await quest.findOne({qName:rName})
    // const qAccount = await Account.findOne({username:rUsername})

    try {
      const qAccount = await Account.findOne({ username: rUsername });
      const questAmount = qAccount.weeklyQuest.length;
      if (questAmount < 3) {
        await Account.updateOne(
          { username: rUsername },
          {
            $push: {
              weeklyQuest: {
                rName,
                progress: 0,
              },
            },
          },
          { new: true }
        );
        res.send(qAccount);
      } else {
        res.send("already have 3 quest");
      }
    } catch (err) {
      // Handle error
      console.error(err);
    }
  });

  app.post("/quest/update", async (req, res) => {
    const { rUsername } = req.body;
    const { rQuestno } = req.body;
    try {
      const qAccount = await Account.findOne({ username: rUsername });
      const objects = "quest." + String(rQuestno) +  ".progress";
      let progress = qAccount.quest[rQuestno].progress + 1;
      await qAccount.updateOne(
        { "$set": { [objects]: progress } }
      )
      console.log([objects], progress);
      res.send(qAccount);
  
    } catch (err) {
      // Handle error
      console.error(err);
    }
  });

  app.post("/quest/weeklyUpdate", async (req, res) => {
    const { rUsername } = req.body;
    const { rQuestno } = req.body;
    try {
      const qAccount = await Account.findOne({ username: rUsername });
      const objects = "weeklyQuest." + String(rQuestno) +  ".progress";
      let progress = qAccount.weeklyQuest[rQuestno].progress + 1;
      await qAccount.updateOne(
        { "$set": { [objects]: progress } }
      )
      console.log([objects], progress);
      res.send(qAccount);
  
    } catch (err) {
      // Handle error
      console.error(err);
    }
  });

  app.get("/quest", async (req, res) => {
    try {
      // Retrieve all items from the database
      const quests = await quest.find();

      // Send a success response with the list of items
      res.json(quests);
    } catch (error) {
      // Handle any errors that occur while fetching items
      console.error(error);
      res.status(500).send("Something went wrong while fetching items");
    }
  });

  app.get("/quest/one", async (req, res) => {
    const { rName } = req.body;

    try {
      // Retrieve all items from the database
      const quests = await quest.findOne({ qName: rName });
      console.log(quests);
      // Send a success response with the list of items
      res.json(quests);
    } catch (error) {
      // Handle any errors that occur while fetching items
      console.error(error);
      res.status(500).send("Something went wrong while fetching items");
    }
  });

  app.post("/quest/clearquest", async (req, res) => {
  const { rUsername, rQuestno } = req.body;

  if (!rUsername || rQuestno === undefined) {
    res.send("Not enough info");
    return;
  }

  try {
    const userAccount = await Account.findOne({ username: rUsername });

    if (!userAccount) {
      res.send(`Account not found for username: ${rUsername}`);
      return;
    }

    const questArray = userAccount.quest;

    if (rQuestno >= questArray.length || rQuestno < 0) {
      res.send(`Invalid quest index: ${rQuestno}`);
      return;
    }

    // unset the entire object at the specified index
    questArray[rQuestno] = undefined;

    // remove the undefined elements from the questArray
    const filteredQuestArray = questArray.filter((quest) => quest !== undefined);

    // update the user account with the filtered quest array
    const updateQuery = {
      $set: {
        quest: filteredQuestArray,
      },
    };

    const updateResult = await Account.updateOne(
      { username: rUsername },
      updateQuery
    );

    if (updateResult.nModified === 0) {
      res.send("Failed to update quest");
    } else {
      res.send(updateQuery.$set);
    }
  } catch (err) {
    console.error(err);
    res.status(500).send({ error: "Server error" });
  }
});

app.post("/quest/weeklyClearquest", async (req, res) => {
  const { rUsername, rQuestno } = req.body;

  if (!rUsername || rQuestno === undefined) {
    res.send("Not enough info");
    return;
  }

  try {
    const userAccount = await Account.findOne({ username: rUsername });

    if (!userAccount) {
      res.send(`Account not found for username: ${rUsername}`);
      return;
    }

    const questArray = userAccount.weeklyQuest;

    if (rQuestno >= questArray.length || rQuestno < 0) {
      res.send(`Invalid quest index: ${rQuestno}`);
      return;
    }

    // unset the entire object at the specified index
    questArray[rQuestno] = undefined;

    // remove the undefined elements from the questArray
    const filteredQuestArray = questArray.filter((weeklyQuest) => weeklyQuest !== undefined);

    // update the user account with the filtered quest array
    const updateQuery = {
      $set: {
        weeklyQuest: filteredQuestArray,
      },
    };

    const updateResult = await Account.updateOne(
      { username: rUsername },
      updateQuery
    );

    if (updateResult.nModified === 0) {
      res.send("Failed to update quest");
    } else {
      res.send(updateQuery.$set);
    }
  } catch (err) {
    console.error(err);
    res.status(500).send({ error: "Server error" });
  }
});

};
