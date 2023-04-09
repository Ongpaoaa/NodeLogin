const mongoose = require('mongoose');
const Account = mongoose.model('accounts');
const quest = mongoose.model("quests");

module.exports = app => {

//Routes
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

    //create account
    app.post('/account/create', async (req, res) => {
        const { rEmail, rUsername, rPassword } = req.body;
      
        if (!rEmail || !rUsername || !rPassword) {
          res.send('Invalid credentials');
          return;
        }
      
        const userAccount = await Account.findOne({ username: rUsername });
        const emailAccount = await Account.findOne({ email: rEmail });
      
        if (emailAccount) {
          res.send('Email is already taken');
          return;
        }

    var userAccount = await Account.findOne({ username : rUsername});
    var emailAccount = await Account.findOne({ email : rEmail});

        if(emailAccount == null){
            if(userAccount == null){
                console.log("create new account");
                const foodtype = ["spicy","fried","sweet","bread","meat","vegetable","fruit"];
                foodtype.sort(() => Math.random() - 0.5);
                const ffood = [foodtype.shift(),foodtype.shift(),foodtype.shift()];
                var dfood = [foodtype.pop(),foodtype.pop(),foodtype.pop()];
                var newAccount = new Account({
                    email : rEmail,
                    username : rUsername,
                    password : rPassword,
                    item : ({}),
                    pending: ({}),
                    wOof: ({hp: 120, favoritef: ffood, dislike: dfood, type: "", en: 5, str: 5, int:5}),
                    quest: ([]),
                    finishedQ: ({}),

                    lastAuthentication : Date.now()
                });
                await newAccount.save();

                res.send(newAccount);
                return;
            }
        
            const userAccount = await Account.findOne({ username: rUsername });
            const itemAmount = parseInt(userAccount.item[rItemName] || 0);
            const Names = 'item.' + rItemName;
        
            const updateQuery = {
                $set: { [Names]: itemAmount + 1 }
            };
        
            const updateResult = await Account.updateOne({ username: rUsername }, updateQuery);
        
            if (updateResult.nModified === 0) {
                res.send("Failed to update item amount");
            } else {
                res.send(updateQuery.$set);
            }
        });


        app.post('/account/getdata', async (req, res) => { //get data player
            const {rUsername} = req.body;
            if(rUsername == null  )
            {
                res.send("Please input user name")
                return;
            } //test
            var userAccount = await Account.findOne({ username : rUsername});
            res.send(userAccount)
            return;

        })

        app.post('/account/sentgift', async (req, res) => {
            const { rSentedperson, rRecieveperson, rGift } = req.body;
            if (!rSentedperson || !rRecieveperson || !rGift) {
              res.send("Not enough info");
              return;
            }
          
            const sentedAccount = await Account.findOne({ username: rSentedperson });
            const recievedAccount = await Account.findOne({ username: rRecieveperson });
          
            const dulp = parseInt(recievedAccount.item[rGift]);
            const dulp2 = parseInt(sentedAccount.item[rGift]);
          
            const obj2 = { [`item.${rGift}`]: dulp2 - 1 };
            await Account.updateOne({ username: rSentedperson }, { $set: obj2 });
          
            if (isNaN(dulp)) {
              const obj = { [`pending.${rSentedperson}`]: rGift };
              await Account.updateOne({ username: rRecieveperson }, { $set: obj });
              res.send("complete1");
            }
          });


        app.post('/account/recievegift', async (req, res) => {
            const {rRecieveperson, rSentedperson} = req.body; //require 2 data
            if(rSentedperson == null || rRecieveperson == null) //check 3 data
            {
              res.send("Not enough info");
              return;
            } 
            try {
              const recievedAccount = await Account.findOne({ username: rRecieveperson });
              delete recievedAccount.pending[rSentedperson];
              await recievedAccount.save();
              console.log(recievedAccount);
              res.send("Gift received successfully.");
            } catch (err) {
              console.error(err);
              res.status(500).send("Internal server error.");
            }
          });
    
}