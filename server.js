// Dependencies
// =============================================================
var express = require("express");
var path = require("path");
var fs = require("fs");
const util = require("util");

const writeFileAsync = util.promisify(fs.writeFile)
const appendFileAsync = util.promisify(fs.appendFile)
const readFileAsync = util.promisify(fs.readFile);


// Sets up the Express App
// =============================================================
var app = express();
var PORT = 3000;

// Sets up the Express app to handle data parsing
app.use(express.urlencoded({ extended: true }));
app.use(express.json());

// Star Wars Characters (DATA)
// =============================================================
var characters = new Array();

// Routes
// =============================================================

// Basic route that sends the user first to the AJAX Page
app.get("/", function(req, res) {
  console.log('// Basic route that sends the user first to the AJAX Page');
  res.sendFile(path.join(__dirname, "view.html"));
});

app.get("/add", function(req, res) {
  console.log('app.get/add returns add.html')
  res.sendFile(path.join(__dirname, "add.html"));
});

app.get("/delete", function(req, res) {
  console.log('app.get/delete returns delete.html')
  res.sendFile(path.join(__dirname, "delete.html"));
});

// Displays all characters
app.get("/api/characters", function(req, res) {
  console.log('app.get("/api/characters" ')
  return res.json(characters);
});

// Finds a single character by name, returning true, or returns false
app.get("/api/characters/:character", function(req, res) {
  console.log('app.get("/api/characters/:character"')
  var chosen = req.params.character;

  for (var i = 0; i < characters.length; i++) {
    if (chosen === characters[i].name) {
      console.log("found "+ chosen + "returning true")
      return res.json(true);
    }
  }
  console.log("NOT found "+ chosen + "returning false")
  return res.json(false);
});

function deleteByName(toDelete){
  if(characters == null){
    return;
  }
  for (var i = 0; i < characters.length; i++) {
    let elem = characters[i]

    let elemName = elem[0].name

    console.log(JSON.stringify(elem) + " name - " + elemName)

    if( elem == null){
      console.log("Characters not initialized!!!")
      return;

    }else if(elemName == null){
      console.log("Not getting a name "+ JSON.stringify(characters[i]))
      return;
    }
    
    console.log("comparing #"+ toDelete +"# with #"+elemName + "#")
    if (toDelete == elemName) {
      console.log("found "+ toDelete + " returning true")
      characters.splice(i,1);
      return true;
    }
  }
  console.log("NOT found "+ toDelete + "returning false")
  return false;
}
// Finds a single character by name, returning true, or returns false
app.post("/api/delete/:character", function(req, res) {
  var toDelete = req.params.character.trim();
  console.log('app.get("/api/characters/:character " ' + req.params.character )
 
  return res.json(deleteByName(req.params.character))
  
});


function deleteDbjson(){
  var tempFile = fs.openSync("db.json", 'r');
  // try commenting out the following line to see the different behavior
  if(tempFile){
    console.log("deleting db.json")
    fs.closeSync(tempFile);
    fs.unlinkSync("db.json");
  }else{
    console.log("db.json does not exist");
  }

}

function updateNotes(){

    console.log("deleting db.json and writing to db.json " + JSON.stringify(characters));

  ///////////////////////////////////////////////////////////////////
  let outputList = new Array();  
  for (let i = 0; i < characters.length; i++) {
    let jsonObject = characters[i];

    
    console.log("!!!!!jsonObject = " + JSON.stringify(jsonObject));
    outputList.push(jsonObject); 
  }
// Here we are putting json object into newuserList which is of JSONArray type
try{
    writeFileAsync( "db.json" ,  JSON.stringify(outputList));
    console.log("Successfully wrote to db.json");
}
catch( e  ){
    console.log(e);
}






   
   
 
}


// Create New Characters - takes in JSON input
app.post("/api/characters", function(req, res) {
  console.log('!!!!!!!!!app.post("/api/characters"' + JSON.stringify(req.body))
  
  let toMatch = req.body.name;
 // console.log("returning --- take out")
 // return;

  //if(characters != null &&  characters[0] != null){

    console.log("CHECKING FOR DUPLICATES")
   
    for (var i = 0; i < characters.length; i++) {
      let elem = characters[i]

      if(elem == null || elem[0] == null) break;

      let elemName = elem[0].name
      

      console.log("Comparing : ")

      console.log(JSON.stringify(" stored name - " + elemName + " with " + toMatch))
      
      if (toMatch == elemName) {
        console.log("RETURNING FALSE")
        return res.json(false);  //did not add
      }

    }
  //}else{
    
  //}
  // req.body hosts is equal to the JSON post sent from the user
  // This works because of our body parsing middleware
  var newCharacter = req.body;

  // Using a RegEx Pattern to remove spaces from newCharacter
  // You can read more about RegEx Patterns later https://www.regexbuddy.com/regex.html
  //newCharacter.routeName = newCharacter.name.replace(/\s+/g, "").toLowerCase();

  console.log(newCharacter);

  characters.push(newCharacter);

  updateNotes();

  console.log("RETURNING TRUE")
  return res.json(true);

});


 async function init() {
  console.log("init called")
  try {
    
    var contents = await readFileAsync("db.json", "utf8")
    characters.push(JSON.parse(contents))
    console.log("Init characters read: ", contents)

    //for debug: deleteByName("1")

  } catch(err) {
    console.log(err);
  }
}

init();

// Starts the server to begin listening
// =============================================================
app.listen(PORT, function() {
  console.log("App listening on PORT " + PORT);
});
