const mongoose = require("mongoose");
const Item = mongoose.model('items');

module.exports = app => {

  app.post("/item/create", async (req, res) => {
    console.log(req.body);

    const { rName, rRarity, rDescription } = req.body;

    if (rName == null || rRarity == null || rDescription == null) 
    {
      res.send("Not enough info");
      return;
    } 
    

      var findName = await Item.findOne({Name: rName });

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


  app.get("/item", async (req, res) => {
      Item.find((err,items)=>{
        if (err) return next(err);
        res.json(items);
      })
  })
};
