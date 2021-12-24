const express = require("express");
const bodyParser = require("body-parser");
const date = require(__dirname + "/date.js");

const app = express();

app.set('view engine', 'ejs');
app.use(bodyParser.urlencoded({ extended: true }));
app.use(express.static("public"));

let Items = ["Buy Food", "Cook Food", "Eat Food"];
let workItems = [];
app.get("/", (req, res) => 
{
    const day = date.getDay();
    res.render("list", { listTitle : day, newListItem: Items });
});

app.post("/", (req, res) => {
  
    const Item = req.body.newItem;
    if(req.body.list === "Work")
    {
       workItems.push(Item);
       res.redirect("/work");
    }
    else
    {
        Items.push(Item);
        res.redirect("/");
    }
 
});

app.get("/work", (req, res) =>
{
    const work = "Work List";
    res.render("list", {listTitle : work, newListItem: workItems} )
});

app.listen(process.env.port|| 3000, console.log("Server started at port 3000"));