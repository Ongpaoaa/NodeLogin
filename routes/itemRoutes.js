const mongoose = require("mongoose");
const Item = mongoose.model('items');

module.exports = app => {

  // create item
  app.post("/item/create", async (req, res) => {
    console.log(req.body);

    const { rName, rRarity, rDescription } = req.body;

    if (rName == null || rRarity == null || rDescription == null) 
    {
      res.send("Not enough info");
      return;
    } 
    
      // find item name
      var findName = await Item.findOne({Name: rName });

      //check if dont have item create
      if (findName == null) {

        var newItem = new Item({
              Name: rName,
              Rarity: rRarity,
              Description: rDescription,
            });

        newItem.save();

        res.send(newItem);
      }
      
    
  });

  //check all items
  app.get("/item", async (req, res) => {
      Item.find((err,items)=>{
        if (err) return next(err);
        res.json(items);
      })
  })
};
