const mongoose = require("mongoose");
const quest = mongoose.model("quests");
const Account = mongoose.model("accounts");
const Item = mongoose.model('items');

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
        _id: "q" +`${qId}`,
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

    //random number function
    function generateRandomNumbers(count, min, max) {
      const randomNumbers = [];
      for (let i = 0; i < count; i++) {
        const randomNumber = Math.floor(Math.random() * (max - min + 1) + min);
        randomNumbers.push(randomNumber);
      }
      return randomNumbers;
    }
    
    
    const {rUsername} = req.body;
    const {rName} = req.body;
    
    // get quest description
    // get username
    const qAccount = await Account.findOne({username:rUsername})
    const qDescription = await quest.findOne({qName:rName}) 
    console.log(qDescription)
    // get account quest length
    // size to add to account.quest
    const qLength = qAccount.quest.length;
    const size = 3 - qLength;
    
    console.log(qLength + "length"); 
    console.log(size + "size")
    const quest_Id_Num = generateRandomNumbers(size,1,100);

    await qAccount.quest.push({qDescription})
    await qAccount.save()


    res.send(qAccount);
    console.log(quest_Id_Num);


  });
}