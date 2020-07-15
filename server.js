// Dependencies
// =============================================================
var express = require("express");
var path = require("path");
var fs = require("fs");
const util = require("util");
const { json } = require("express");

const writeFileAsync = util.promisify(fs.writeFile)
const appendFileAsync = util.promisify(fs.appendFile)
const readFileAsync = util.promisify(fs.readFile);


// Sets up the Express App
// =============================================================
var app = express();
//var PORT = 3000;
var PORT = process.env.PORT || 3000;
console.log("PORT " + PORT);

// Sets up the Express app to handle data parsing
app.use(express.urlencoded({ extended: true }));
app.use(express.json());

// Characters (DATA)
// =============================================================
let notes = null;

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

// Displays all notes
app.get("/api/notes", function(req, res) {
  console.log('app.get("/api/notes" ')
  return res.json(notes);
});

// Finds a single note by name, returning true, or returns false
app.get("/api/notes/:note", function(req, res) {
  console.log('app.get("/api/notes/:note"')
  var chosen = req.params.note;

  for (var i = 0; i < notes.length; i++) {
    if (chosen === notes[i].name) {
      console.log("found "+ chosen + "returning true")
      return res.json(true);
    }
  }
  console.log("NOT found "+ chosen + "returning false")
  return res.json(false);
});

function deleteByName(toMatch){
  console.log('!!!!! deleteByName !!!!!')
  let notesIndex = -1;
  let elemName = null;
  if(notes != null){

    console.log("SEARCH FOR RECORD TO DELETE  notes.length " + notes.length)


    for (var i = 0; i < notes.length; i++) {
      let elem = notes[i]

      console.log("@@@@@@ Comparing : " + JSON.stringify(elem))

      //if(elem == null || elem[0] == null) break;

      elemName = elem.name
      
      console.log(JSON.stringify(" stored name - " + elemName + " with " + toMatch))
      
      if (toMatch == elemName) {
        notesIndex = i;
        
      }

    }
  }
  if(notesIndex != -1){
    console.log("DELETING " + elemName)
    notes.splice(notesIndex,1)
    updateNotes();
    return true

  }

  console.log("NOT found "+ toDelete + "returning false")
  return false
}
// Finds a single note by name, returning true, or returns false
app.post("/api/delete/:note", function(req, res) {
  var toDelete = req.params.note.trim();
  console.log('app.get("/api/notes/:note " ' + req.params.note )
 
  return res.json(deleteByName(req.params.note))
  
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

    console.log("deleting db.json and writing to db.json " + JSON.stringify(notes));

  ///////////////////////////////////////////////////////////////////
  let outputList = new Array();  
  let outputString = "";
  for (let i = 0; i < notes.length; i++) {
    let jsonObject = notes[i];

    console.log("\n!!!!!jsonObject at i = " + i + " " + jsonObject) //JSON.stringify(jsonObject));

    outputString += JSON.stringify(jsonObject);
    if(i + 1 != notes.length){
      outputString += ","
    }
  }
  //outputString += ""
  //writeFileAsync( "db.json" , outputString )
// Here we are putting json object into newuserList which is of JSONArray type
try{
    console.log("$$$$$$ " + outputString)
    writeFileAsync( "db.json" , "[" + outputString + "]");
    console.log("Successfully wrote to db.json");
}
catch( e  ){
    console.log(e);
}






   
   
 
}


// Create New Characters - takes in JSON input
app.post("/api/notes", function(req, res) {
  console.log('!!!!!!!!!app.post("/api/notes"' + JSON.stringify(req.body))
  
  let toMatch = req.body.name;
 // console.log("returning --- take out")
 // return;

  //if(notes != null &&  notes[0] != null){

    
    
  if(notes != null){

    console.log("CHECKING FOR DUPLICATES  notes.length " + notes.length)


    for (var i = 0; i < notes.length; i++) {
      let elem = notes[i]

      console.log("@@@@@@ Comparing : " + JSON.stringify(elem))

      //if(elem == null || elem[0] == null) break;

      let elemName = elem.name
      
      console.log(JSON.stringify(" stored name - " + elemName + " with " + toMatch))
      
      if (toMatch == elemName) {
        console.log("RETURNING FALSE")
        return res.json(false);  //did not add
      }

    }
  }
  console.log("NO DUPLICATE, PROCEED")

  // req.body hosts is equal to the JSON post sent from the user
  // This works because of our body parsing middleware
  var newCharacter = req.body;

  // Using a RegEx Pattern to remove spaces from newCharacter
  // You can read more about RegEx Patterns later https://www.regexbuddy.com/regex.html
  //newCharacter.routeName = newCharacter.name.replace(/\s+/g, "").toLowerCase();

  console.log(newCharacter);

  if(notes == null || notes.length == 0){
    console.log("ASSIGNING NOTES")
    notes = [newCharacter]
  }else{
    console.log("typeof notes " + typeof notes)
    notes.push(newCharacter);
  }
  

  console.log("notes after push $$$$$ " + JSON.stringify(notes))

  updateNotes();

  console.log("RETURNING TRUE")
  return res.json(true);

});


 async function init() {
  console.log("init called")
  try {
    
    var contents = await readFileAsync("db.json", "utf8")
    
    console.log("init contents = " + contents)
    if(contents == null){
      console.log("no file contents $$$$$$$$$$$$$$$$ ")
    }
    notes = JSON.parse(contents);

    console.log("Init notes: ", notes.length > 0 ? JSON.stringify(notes) : "empty")

    console.log("Type of notes = " + typeof notes)

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
