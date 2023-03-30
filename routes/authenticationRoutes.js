const mongoose = require('mongoose');
const Account = mongoose.model('accounts');


module.exports = app => {

//Routes

    app.post('/account/login', async (req, res) => {

        const { rUsername, rPassword} = req.body;
        if(rUsername == null || rPassword == null)
        {
            console.log("rUsername,rPassword");
            res.send("Invalid credentials")
            return;
        }

    var userAccount = await Account.findOne({ username : rUsername});
        if(userAccount != null){
            
        if(rPassword == userAccount.password){
                userAccount.lastAuthentication = Date.now();
                await userAccount.save();
                
                res.send(userAccount);
                return;
            }
        }

        res.send('Invalid credentials');
        return;
    })

    app.post('/account/create', async (req, res) => {

        console.log(req.body);
        const {rEmail, rUsername, rPassword} = req.body;
        if(rEmail == null || rUsername == null || rPassword == null)
        {
            
            res.send("Invalid credentials")
            return;
        }

    var userAccount = await Account.findOne({ username : rUsername});
    var emailAccount = await Account.findOne({ email : rEmail});

        if(emailAccount == null){
            if(userAccount == null){
                    //create new account
                console.log("create new account");

                var newAccount = new Account({
                    email : rEmail,
                    username : rUsername,
                    password : rPassword,
                    item : ({ "Stater": 1}),

                    lastAuthentication : Date.now()
                });
                await newAccount.save();

                res.send(newAccount);
                return;
            } else {
                res.send("Username is already taken")
            }
        }
        else {
            res.send("Email is already taken")
        }
        res.send('Invalid credentials');
        return;
        })

    app.post('/account/give', async (req, res) => {
        const {rUsername, rItemName} = req.body;
        if(rUsername == null || rItemName == null )
        {
            res.send("Not enough info")
            return;
        } //test
        var userAccount = await Account.findOne({ username : rUsername});
        var dulp = parseInt(userAccount.item[rItemName]);
        console.log(dulp);
        var Names = 'item.'+rItemName;
        var obj = {};
            obj[Names] = 1;
        var obj2 = {};
            obj2[Names] = dulp+1;
        if (dulp == null)
        {
            const ress = await Account.updateOne(
                {username : rUsername}, 
                {$set: obj});
            res.send("complete1");
        }
        else
        {
            dulp += 1;
            const ress = await Account.updateOne(
                {username : rUsername}, 
                {$set: obj2});
            res.send("complete2");
        }
        
        // if(userAccount == null)
        // {
        //     res.send("There is no user")
        //     return;
        // }
        // else
        // {
        //     Account.updateOne({$set:{ "ticket": 1}});
        //     Account.save();   
        //     res.send("Sucess");
        // }

        })

}