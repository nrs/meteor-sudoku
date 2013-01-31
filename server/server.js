// Sudoku -- server

path_sudoku_gen="generate_sudoku.py";

//Meteor.publish("directory", function () {
  //return Meteor.users.find({}, {fields: {emails: 1, profile: 1, admin:1}});
//});

Meteor.publish("currentUserData", function () {
  return Meteor.users.find({}, {fields: {'admin': 1}});
});

//Meteor.publish("userData", function () {
  //return Meteor.users.find({_id: this.userId},
      //{fields: {'admin': 1}});
//});

//Meteor.publish("parties", function () {
//return Parties.find(
//{$or: [{"public": true}, {invited: this.userId}, {owner: this.userId}]});
//});

//Meteor.publish("puzzles", function () {
//return Puzzles.find(); // everything
//});

var addPuzzle = function (difficulty,clu, lo, hi) {
  var require = __meteor_bootstrap__.require;
  var sys = require('sys');
  var exec = require('child_process').exec;

  var lol = exec(path_sudoku_gen+" "+clu+" "+lo+" "+hi, function(error, stdout, stderr) {
    console.log(stdout);
    Fiber(function() {
      var sudoku_str=stdout;
      if (sudoku_str.length!=81){return;}
      Puzzles.insert({diff:difficulty, str:sudoku_str, random : Math.random()})
      console.log(sudoku_str);
    }).run();
  });
}

var populatePuzzles = function (difficulty,lo,hi,clu,desiredAmount) {
  var npuzzles = Puzzles.find({diff:difficulty}).count();
  if (npuzzles < desiredAmount) { addition = desiredAmount - npuzzles;
    for (var i=0; i < addition; i++) { addPuzzle(difficulty,clu,lo,hi); }}
};


Meteor.startup(function () {
  // define MAIL_STRING in a separate .js file in the form of:
  // 'smtp://USER:PASS@HOST:PORT
  //  e.g. MAIL_STRING = 'smtp://yavuzbingol02:lamepass@smtp.gmail.com:587/'
  process.env.MAIL_URL = MAIL_STRING;
  
  //Meteor.users.findOne({emails[0]:'onursolmaz@gmail.com'}).admin=true;
  Meteor.users.update({'emails.address':"onursolmaz@gmail.com"},{$set:{admin:true}});
  Meteor.users.update({'emails.address':"aysecansutanrikulu@gmail.com"},{$set:{admin:true}});
  Meteor.users.update({'emails.address':"hazalaymandir@hotmail.com"},{$set:{admin:true}});
  //console.log(Meteor.users.findOne({_id:"fe49636b-c88b-42a5-959e-6ba1823c0b80"}));
  //console.log(Meteor.users.findOne({'emails.address':'aysecansutanrikulu@gmail.com'}));

  console.log('Number of admins: '+Meteor.users.find({admin:true}).count());
  desiredAmount = 200;
  console.log("Number of puzzles: "+Puzzles.find().count());
  populatePuzzles(0,0.0,1.5 ,79,desiredAmount); // supereasy
  populatePuzzles(1,0.0,0.60,36,desiredAmount); // easy
  populatePuzzles(2,0.6,0.8 ,33,desiredAmount); // medium
  populatePuzzles(3,0.8,1.0 ,30,desiredAmount); // difficult
});

