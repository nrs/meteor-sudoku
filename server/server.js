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
  console.log("Number of games completed: "+Gamehistory.find().count());
  console.log("Number of games being played now: "+Currentgames.find().count());
  populatePuzzles(0,0.0,1.5 ,79,desiredAmount); // supereasy
  populatePuzzles(1,0.0,0.60,36,desiredAmount); // easy
  populatePuzzles(2,0.6,0.8 ,33,desiredAmount); // medium
  populatePuzzles(3,0.8,1.0 ,30,desiredAmount); // difficult
});


Meteor.methods({
  sendReport: function (repobj){
    console.log('Sending report to admins');
    var admins = Meteor.users.find({admin:true}).fetch();
    console.log(Meteor.users.find({admin:true}).count());
    // This code only runs on the server. If you didn't want clients
    // to be able to see it, you could move it to a separate file.
    for(var i = 0; i < admins.length; i++){
      console.log(admins[i].emails[0].address);
      Email.send({
        from: "yavuzbingol02@gmail.com",
        to: admins[i].emails[0].address,
        //replyTo: from || undefined,
        subject: "The user "+repobj.who+" just finished a puzzle", 
        text:"User: "+repobj.who+
        "\nDifficulty: "+repobj.diff+
        "\nStart date: "+repobj.startdate+
        "\nEnd date: "+repobj.enddate+
        "\nDuration: "+repobj.duration+" min"+
        "\nNumber of mistakes: "+repobj.mistakes+
        "\nPuzzle str: "+repobj.str
      });
    }
  },
    sendTotalRecord: function(){
      var admins = Meteor.users.find({admin:true}).fetch();
      records = Gamehistory.find().fetch();
      today = new Date();
      mtext='Cut and paste the text below into a plain text file. Change the extension to .csv (comma separated values). Now you can open that file in Excel.\n\nuser,difficulty,duration,mistakes,startdate,enddate,str\n';
      for (var i = 0; i < records.length; i++){
        mtext=mtext+records[i].email+','+records[i].diff+','+records[i].duration+','+records[i].mistakes+','+records[i].startdate+','+records[i].enddate+',"'+records[i].str+'"\n';
      }
      for(var i = 0; i < admins.length; i++){
        console.log(admins[i].emails[0].address);
        Email.send({
          from: "yavuzbingol02@gmail.com",
          to: admins[i].emails[0].address,
          //replyTo: from || undefined,
          subject: "Total record of games as of "+today, 
          text:mtext
        });
      }
    }

});
