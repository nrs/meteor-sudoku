// Sudoku -- server

path_sudoku_gen="generate_sudoku.py";

//Meteor.publish("directory", function () {
//return Meteor.users.find({}, {fields: {emails: 1, profile: 1, admin:1}});
//});

Meteor.publish("currentUserData", function () {
  return Meteor.users.find({}, {fields: {'admin': 1}});
});

var today;
var updateToday = function () {a = new Date(); today = a.getDate();};
var diffToday = function () {
  a = new Date();
  if (today != a.getDate()){
    return true;
  } else {
    return false;
  }
};

Meteor.startup(function () {
  updateToday();
  console.log('Today: '+today);
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

//var addPuzzle = function (difficulty,clu, lo, hi) {
  //var require = __meteor_bootstrap__.require;
  //var sys = require('sys');
  //var exec = require('child_process').exec;

  //var lol = exec(path_sudoku_gen+" "+clu+" "+lo+" "+hi, function(error, stdout, stderr) {
    //console.log(stdout);
    //Fiber(function() {
      //var sudoku_str=stdout;
      //if (sudoku_str.length!=81){return;}
      //Puzzles.insert({diff:difficulty, str:sudoku_str, random : Math.random()})
      //console.log(sudoku_str);
    //}).run();
  //});
//}

//var populatePuzzles = function (difficulty,lo,hi,clu,desiredAmount) {
  //var npuzzles = Puzzles.find({diff:difficulty}).count();
  //if (npuzzles < desiredAmount) { addition = desiredAmount - npuzzles;
    //for (var i=0; i < addition; i++) { addPuzzle(difficulty,clu,lo,hi); }}
//};

var checkComplete = function () {
  Fiber(function(){
  cur = Currentgames.find().fetch();
  now = new Date();
  for (var i = 0; i < cur.length; i++){
    var curdate = new Date(cur[i].startdate);
    var duration = (now-curdate)/1000/60;
    // 50 minutes for 1 game
    if (duration > 50) {
      Currentgames.remove({id:cur[i].id});
    }
    //console.log((now-curdate)/1000);
  }
  }).run();
};
// Run every minute
setInterval(checkComplete ,60000);


var incrSchedule = function () {
  Fiber(function(){
    Schedule.update({},{$inc:{order:1}},{multi:true});
    console.log("Incrementing schedule");
  }).run();
};

var checkDayOver = function () {
  if (diffToday()) {
    updateToday();
    incrSchedule();
    //Fiber(function(){
      //Meteor.call('sendTotalRecord');
    //}).run();
  }
};

setInterval(checkDayOver,300000);


var addPuzzle = function (diffstring,difficulty) {
  var require = __meteor_bootstrap__.require;
  var sys = require('sys');
  var exec = require('child_process').exec;

  var lol = exec("qqwing --csv --difficulty "+diffstring+" --generate 1", function(error, stdout, stderr) {
    console.log(stdout);
    Fiber(function() {
      var sudoku_str=stdout;
      sudoku_str = sudoku_str.slice(0,-1);
      if (sudoku_str.length!=81){return;}
      Puzzles.insert({diff:difficulty, str:sudoku_str,order:0});
      console.log(sudoku_str);
    }).run();
  });
};

var populatePuzzles = function (difficulty,diffstring,desiredAmount) {
  var npuzzles = Puzzles.find({diff:difficulty}).count();
  if (npuzzles < desiredAmount) { addition = desiredAmount - npuzzles;
    for (var i=0; i < addition; i++) { addPuzzle(diffstring,difficulty); }}
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
  Meteor.users.update({'emails.address':"merve16nov@hotmail.com"},{$set:{admin:true}});
  //console.log(Meteor.users.findOne({_id:"fe49636b-c88b-42a5-959e-6ba1823c0b80"}));
  //console.log(Meteor.users.findOne({'emails.address':'aysecansutanrikulu@gmail.com'}));

  console.log('Number of admins: '+Meteor.users.find({admin:true}).count());
  desiredAmount = 10;
  console.log("Number of puzzles: "+Puzzles.find().count());
  console.log("Number of games completed: "+Gamehistory.find().count());
  console.log("Number of games being played now: "+Currentgames.find().count());
  //populatePuzzles(0,0.0,1.5 ,79,desiredAmount); // supereasy
  //populatePuzzles(1,0.0,0.45,40,desiredAmount); // easy
  //populatePuzzles(2,0.45,0.6 ,36,desiredAmount); // medium
  //populatePuzzles(3,0.8,1.0 ,30,desiredAmount); // difficult

  
  populatePuzzles(0,'simple',desiredAmount); 
  populatePuzzles(1,'easy',desiredAmount); 
  populatePuzzles(2,'intermediate',desiredAmount); 
  populatePuzzles(3,'expert',desiredAmount); 
  
  //populatePuzzles(0,0.0,1.5 ,79,desiredAmount); // supereasy
  //populatePuzzles(1,0.0,0.60,36,desiredAmount); // easy
  //populatePuzzles(2,0.6,0.8 ,33,desiredAmount); // medium
  //populatePuzzles(3,0.8,1.0 ,30,desiredAmount); // difficult
  addPreparedPuzzles();

});


Meteor.methods({
  incrSchedule: function () {
    incrSchedule();
  },
  completeCurrent: function (id, nmis){

    thissession = Currentgames.findOne({id:id});
    delete thissession._id;
    thissession.enddate = new Date();
    loldate = new Date(thissession.startdate);
    thissession.duration = Math.round((thissession.enddate-loldate)/60000);// in minutes
    thissession.mistakes = nmis;
    Gamehistory.insert(thissession);
    Currentgames.remove({id:id});

    Meteor.call('sendReport',
      {who:Meteor.user().emails[0].address,
        diff:thissession.diff,
      startdate:thissession.startdate,
      enddate:thissession.enddate,
      order:thissession.order,
      str:thissession.str,
      duration: thissession.duration,
      mistakes: thissession.mistakes
      });
  },
    addCurrent: function (cur){
      cur.startdate = new Date();
      Currentgames.insert(cur);
  },
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
        "\nOrder: "+repobj.order+
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
      mtext='Cut and paste the text below into a plain text file. Change the extension to .csv (comma separated values). Now you can open that file in Excel.\n\nuser,difficulty,order,duration,mistakes,startdate,enddate,str\n';
      for (var i = 0; i < records.length; i++){
        mtext=mtext+records[i].email+','+records[i].diff+','+records[i].order+','+records[i].duration+','+records[i].mistakes+','+records[i].startdate+','+records[i].enddate+',"'+records[i].str+'"\n';
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



var addPreparedPuzzles = function () {
  puzzles1 = [
    '060090008708002904052401300090060105000103000807020040004709250109500706300010080',
    '609500003200000741000043560000034210006109400081670000072360000835000002100005908',
    '049301720200805003050000060006090500700000009001020800090000010500603002012409650',
    '580961400000000000000547020009710005300000006600029700020895000000000000003174082',
    '800036201000901000607802500472000910100000003093000824008204607000705000704690005',
    '010706020080000050003215800107000302006000900805000104004158700070000040050604010',
    '000000000000250307062307050209000640001804200084000503010708420307026000000000000',
    '000304000200010006690000071805602907100000008903801604310000025700020009000105000',
    '401006050260700010500043000300019000800000005000430001000380007070004039040500102',
    '047000360050000040800403002900607005004208100200901004600504007030000050071000480',
    '000301000603000209740000016402805107000000000309704605150000032206000408000403000',
    '105000207300000008040070060070803090250407031080206070090040050500000006608000409',
    '091000000000700001004013205008905030006040700070102900607290800300001000000000640',

    '074000150800000009300502007001204500000060000005901300700309008100000005043000690',
    '300000002070503080000174000086000570009000200027000390000439000050601030800000001',
    '004300000026570090000000061000010039080957020190060000430000000070042910000009800',
    '000000000019080260026004750007805000030000090000209800098500670063090480000000000',
    '309040508000903000008265300070000080000030000030000020002518900000607000906020105',
    '104000500000890070700040006010005000026010830000600090300020004060078000008000709',
    '000302000008010300010406090509000702040060050703000601050203070002070400000908000',
    '800500030007010805040806020703000900050000040001000503020409010309060400010008006 '];


    //'010364020006000700000105000508702601200000008104809203005030000002000400030927080',
    //'100902007760581023000000000009103400010000080005208300000000000270895046500604009',
    //'000500008890100200020074300902000030013000860060000109009350020008009015200001000',
    //'562000189000508000010000040890107054000000000120409073040000020000203000253000718',
    //'070040010100507008500908006050090060006000500080060070900802003700106004030050020',
    //'010402090800635004000010000048000520007308600069000740000090000700584002050703080',
    //'580010000000047020000005809607009005950000064800600902706500000090470000000030096',
    //'800406007050903040003010900760000012000605000530000074006040300070502080400308001'];

  if (Puzzles.find({diff:4}).count() == 0){
    console.log("Inserting prepared puzzles.");
    for (var i = 0; i < puzzles1.length; i++){
      Puzzles.insert({diff:4, str:puzzles1[i],order:i});
    }
  }

}
