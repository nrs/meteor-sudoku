///////////////////////////////////////////////////////////////////////////////
// Sudoku

Puzzles = new Meteor.Collection("puzzles");
Currentgames = new Meteor.Collection("currentgames");
Gamehistory = new Meteor.Collection("gamehistory");

//Currentgames.allow({
  //insert: function(){
    //return true;
  //}
//});


Meteor.methods({
  sendReport: function (repobj){
    console.log('Sending report to admins');
    if (Meteor.isServer) {
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
    }
  }
});

///////////////////////////////////////////////////////////////////////////////
// Users

//var displayName = function (user) {
//if (user.profile && user.profile.name)
//return user.profile.name;
//return user.emails[0].address;
//};

//var contactEmail = function (user) {
//if (user.emails && user.emails.length)
//return user.emails[0].address;
//if (user.services && user.services.facebook && user.services.facebook.email)
//return user.services.facebook.email;
//return null;
//};

