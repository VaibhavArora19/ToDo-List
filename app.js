const express = require("express");
const bodyParser = require("body-parser");
const mongoose = require("mongoose");

const app = express();

app.set('view engine', 'ejs');
app.use(bodyParser.urlencoded({ extended: true }));
app.use(express.static("public"));

mongoose.connect("mongodb://localhost:27017/todolistDB", { useNewUrlParser: true });

const itemsSchema = new mongoose.Schema({
    name: String
});

const Item = mongoose.model("Item", itemsSchema);

const item1 = new Item({
    name: "Welcome to your todoList!"
});

const item2 = new Item({
    name: "Hit the + button to add a new item."
});

const item3 = new Item({
    name: "<-- Hit this to delete an item."
});
const defaultItems = [item1, item2, item3];

const listSchema =
{
    name: String,
    items: [itemsSchema]
}

const List = mongoose.model("List", listSchema);

app.get("/", (req, res) => {

    Item.find({}, function (err, foundItems) {

        if (foundItems.length === 0) {
            Item.insertMany(defaultItems, function (err) {
                if (err) {
                    console.log(err);
                }
                else {
                    console.log("Successfully Inserted!");
                }
            });

            res.redirect("/");
        }
        
        else {
            res.render("list", { listTitle: "Today", newListItems: foundItems });
        }
    });
});

app.post("/", (req, res) => {

    const itemName = req.body.newItem;
    const listName = req.body.list;

    const item = new Item({
        name: itemName
    });

    if(listName === "Today")
    {
        item.save();
    res.redirect("/");
    }
    else
    {
      List.findOne({name : listName}, function(err, foundList)
      {
          foundList.items.push(item);
          foundList.save();
          res.redirect("/" + listName);
      });
    }
    
});

app.post("/delete", function (req, res) {
    const checkedItemId = req.body.checkbox;
    const listName = req.body.listName;

    if(listName === "Today")
    {
        Item.deleteOne({ _id: checkedItemId }, function (err) {
            if (err) {
                console.log(err);
            }
            else {
                console.log("Succesfully Deleted");
            }
            res.redirect("/");
        });
    }
    else
    {
       List.findOneAndUpdate({name : listName}, {$pull:{items: {_id: checkedItemId}}}, function(err, foundList)
       {
            if(!err)
            {
                res.redirect("/" + listName);
            }
       });
    }

});

app.get("/:customListName", (req, res) => {
    const customListName = req.params.customListName;
   
    
    List.findOne({name : customListName}, function(err, result)
    {
        if(!err)
        {
            if(!result)
            {
                const list = new List({
                    name : customListName,
                    items : defaultItems
                });
                list.save();
                res.redirect("/" + customListName);
            }
            else
            {
                res.render("list", { listTitle: result.name, newListItems: result.items});
            }
        }
        
    });
    
});

app.listen(process.env.PORT || 3000, console.log("Server started at port 3000"));