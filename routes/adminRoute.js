const mongoose = require("mongoose");
const Account = mongoose.model("accounts");
const Tag = mongoose.model("tags");

module.exports = (app) => {
    app.post("/tag/create", async (req, res) => {
    const { rName, rColor} = req.body;

    // Check if all required fields are present in the request body
    if (!rName || !rColor ) {
        return res.send("Not enough information provided");
    }

    try {
        // Check if an item with the same name already exists
        const existingtag = await Tag.findOne({ tag: rName });

        if (existingtag) {
        return res.send("An item with that name already exists");
        }

        // Create a new item with the provided details
        const newTag = new Tag({
        tag: rName,
        color: rColor,
        });

        // Save the new item to the database
        await newTag.save();

        // Send a success response with the newly created item
        res.send(newTag);
        } catch (err) {
        console.error(err);
        res.status(500).send("Internal server error");
        }
    });

    app.post("/tag/edit", async (req, res) => {
        const {rName, rNewName, rNewColor} = req.body;
    
        // Check if all required fields are present in the request body
        if (!rName || !rNewName || !rNewColor ) {
            return res.send("Not enough information provided");
        }
    
        try {
            // Check if an item with the same name already exists
            const editedTag = await Tag.findOne({ tag: rName });
    
            if (!editedTag) {
            return res.send("Tag not found");
            }

            editedTag.tag = rNewName;
            editedTag.color = rNewColor;
    
            await editedTag.save();

            for (const user of editedTag.user) {
                const members = await Account.findOne({username: user})
                const tagIndex = members.tag.indexOf(rName);
                members.tag[tagIndex] = rNewName;
                await members.save();
            }
            res.send(editedTag);
            } catch (err) {
            console.error(err);
            res.status(500).send("Internal server error");
            }
        });

    app.post("/tag/delete", async (req, res) => {
        const { rName } = req.body;
        
        // Check if all required fields are present in the request body
        if (!rName) {
            return res.send("Not enough information provided");
        }
        
        try {
            // Delete the tag document from the Tag collection
            const deletedTag = await Tag.findOneAndDelete({ tag: rName });
        
            if (!deletedTag) {
            return res.send("Tag not found");
            }
        
            // Find all user accounts that have the tag and remove it from their tag array
            const usersWithTag = await Account.find({ tag: rName });
        
            for (const user of usersWithTag) {
            const tagIndex = user.tag.indexOf(rName);
            user.tag.splice(tagIndex, 1);
            await user.save();
            }
        
            res.send("Tag deleted successfully");
        } catch (err) {
            console.error(err);
            res.status(500).send("Internal server error");
        }
        });
          
    app.post("/tag/add", async (req, res) => {
        try {
        // Extract the required fields from the request body
        const { rUsername, rTag } = req.body;
        console.log(rUsername)
        // Check if both the username and tag are provided
        if (!rUsername || !rTag) {
            
            res.send("Not enough info");
            return;
        }
    
        // Find the user in the database
        const userAccount = await Account.findOne({ username: rUsername });
        const selectedTag = await Tag.findOne({ tag: rTag });
        console.log(userAccount)
        
        if (!userAccount) {
            
            res.send("User not found");
            return;
        }

        if (!selectedTag) {
            
            res.send("Tag not found");
            return;
        }
    
        const isTagFound = userAccount.tag.includes(rTag);

        if (isTagFound == true) {

            res.send("Tag already in user");
            return;
        } 

        // Add the tag to the user's tags array
        userAccount.tag.push(rTag);
    
        // Save the updated user
        await userAccount.save();

        selectedTag.user.push(rUsername);
    
        // Save the updated user
        await selectedTag.save();
    
        // Send a success response to the client
        res.send("Tag added successfully");
        } catch (err) {
        console.error(err);
        res.status(500).send("Internal server error");
        }
    });

    app.post("/tag/remove", async (req, res) => {
        try {
        // Extract the required fields from the request body
        const { rUsername, rTag } = req.body;
        console.log(rUsername)
        // Check if both the username and tag are provided
        if (!rUsername || !rTag) {
            
            res.send("Not enough info");
            return;
        }
    
        // Find the user in the database
        const userAccount = await Account.findOne({ username: rUsername });
        const selectedTag = await Tag.findOne({ tag: rTag });
        console.log(userAccount)
        
        if (!userAccount) {
            
            res.send("User not found");
            return;
        }

        if (!selectedTag) {
            
            res.send("Tag not found");
            return;
        }
    
        // Add the tag to the user's tags array
        const tagIndex = userAccount.tag.indexOf(rTag);
        userAccount.tag.splice(tagIndex, 1);
    
        // Save the updated user
        await userAccount.save();

        const userIndex = selectedTag.user.indexOf(rUsername);
        selectedTag.user.splice(userIndex, 1);
    
        // Save the updated user
        await selectedTag.save();
    
        // Send a success response to the client
        res.send("Tag remove successfully");
        } catch (err) {
        console.error(err);
        res.status(500).send("Internal server error");
        }
    });

    app.get("/tag/get/:tagName", async (req, res) => {
        var rTag = req.params.tagName; // Retrieve the username from the request body
        console.log(rTag);
        // Check if the username is null or undefined
    
        // Query the database for an Account document that has the specified username
        var tagData = await Tag.findOne({ tag: rTag });
        console.log(tagData);
        res.send(tagData); // Send the user data as a response
        return;
      });

    app.get("/tag/getAll", async (req, res) => {

        try {
            // Retrieve all tag documents from the database
            const tags = await Tag.find();
            res.send(tags);
        } catch (err) {
            console.error(err);
            res.status(500).send("Internal server error");
        }
    });

    
};