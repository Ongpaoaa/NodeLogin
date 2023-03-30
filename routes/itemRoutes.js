const mongoose = require("mongoose");
const Item = mongoose.model('items');

module.exports = (app) => {
  app.post("/item/create", async (req, res) => {
    const { Name, Rarity, Description } = req.body;

    if (Name == null || Rarity == null || Description == null) {
      res.send("Not enough info");
      return;
    } else {
      

      var findName = await Item.findOne({ name: Name });

      if (findName == null) {

        var newItem = new Item({
              Name: Name,
              Rarity: Rarity,
              Description: Description,
            });

        newItem.save();

        res.send(newItem);
      }
    }
  });
};
