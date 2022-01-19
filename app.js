const express = require("express");
const bodyParser = require("body-parser");
const mongoose = require("mongoose");


const app = express();


app.set('view engine', 'ejs');

app.use(bodyParser.urlencoded({extened: true}));
app.use(express.static("public"));

mongoose.connect("mongodb://localhost:27017/todolistDB", {useNewUrlParser: true});

const itemSchema = {
  name: String
};

const Item = mongoose.model("Item", itemSchema);

const item1 = new Item({
  name: "Welcome to your To-do list"
});

const item2 = new Item({
  name: "Hit the + button to add a new item"
});

const item3 = new Item({
  name: "<--- Hit this to delete an item"
});

const defaultItems = [item1, item2, item3];

const listSchema = {
  name: String,
  item: [itemSchema]
};

const List = mongoose.model("List", listSchema);

app.get("/", function(req, res){


  Item.find({}, function(err, foundItems){

    if (foundItems.length === 0){
      Item.insertMany(defaultItems, function(err){
        if (err){
          console.log(err);
        } else {
          console.log("Success save");
        }
      });
      res.redirect("/");
    } else{
      res.render("list", {listTitle: "Today", newListItems: foundItems});
    }

    });

});

app.get("/:customListName", function(req, res){
  const customListName = req.params.customListName;

  List.findOne({name: customListName}, function(err, foundList){
    if (!err){
      if (!foundList){
        const list = new List ({
          name: customListName,
          item: defaultItems
        });
        list.save();
        res.redirect("/"+ customListName);
      } else {
         res.render("list", {listTitle: foundList.name, newListItems: foundList.items});
      }
    }
  });
});

app.post("/", function(req, res){

  const itemName = req.body.newItem;
  const listName = req.body.list;

  const item = new Item({
    name: itemName
  });

  if(listName === "Today"){
    item.save();
    res.redirect("/");
  } else {
    List.findOne({name: listName}, function(err, foundList){
      foundList.items.push(item);
      foundList.save();
      res.redirect("/"+ listName);
    });
  }
});

 app.post("/delete", function(req, res){
   const checkItemId = req.body.checkbox;

   Item.findByIdAndRemove(checkItemId, function(err){
     if (!err){
       console.log("Success Delete");
       res.redirect("/");
     }
   });
 });

app.get("/about", function(req, res){
  res.render("about");
});

// app.post("/work", function(req, res){
// let item = req.body.newItem;
// workItems.push(item);
// res.redirect("/work");
// });


app.listen(3000, function(){
  console.log("Server To-do Lists is running")
});
