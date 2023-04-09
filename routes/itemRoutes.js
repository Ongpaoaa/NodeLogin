const mongoose = require("mongoose");
const Item = mongoose.model('items');

module.exports = (app) => {
  // Create a new item
  app.post("/item/create", async (req, res) => {
    const { rName, rRarity, rDescription } = req.body;

    // Check if all required fields are present in the request body
    if (!rName || !rRarity || !rDescription) {
      return res.status(400).send("Not enough information provided");
    }

    try {
      // Check if an item with the same name already exists
      const existingItem = await Item.findOne({ Name: rName });

      if (existingItem) {
        return res.status(409).send("An item with that name already exists");
      }

      // Create a new item with the provided details
      const newItem = new Item({
        Name: rName,
        Rarity: rRarity,
        Description: rDescription,
      });

      // Save the new item to the database
      await newItem.save();

      // Send a success response with the newly created item
      res.status(201).send(newItem);
    } catch (error) {
      // Handle any errors that occur during item creation
      console.error(error);
      res.status(500).send("Something went wrong while creating the item");
    }
  });

  // Get all items
  app.get("/item", async (req, res) => {
    try {
      // Retrieve all items from the database
      const items = await Item.find();

      // Send a success response with the list of items
      res.json(items);
    } catch (error) {
      // Handle any errors that occur while fetching items
      console.error(error);
      res.status(500).send("Something went wrong while fetching items");
    }
  });
};