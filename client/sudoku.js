//// All Tomorrow's Parties -- client

//Meteor.subscribe("directory");
//Meteor.subscribe("parties");
//Meteor.subscribe("puzzles");

//// If no party selected, select one.
//Meteor.startup(function () {
//Meteor.autorun(function () {
//if (! Session.get("selected")) {
//var party = Parties.findOne();
//if (party)
//Session.set("selected", party._id);
//}
//});
//});



//(function($) {
var active = null;
var bound = false;

var initialize = function(initial) {
  var board = $('<div/>').addClass('sudoku-board');
  var deployed = 0;

  var rows = xmap(function(row, column) {
    var value = parseInt(initial.charAt(row * 9 + column), 10);
    var cell = create(row, column, value);
    if (cell.data('sudoku').deployed) deployed++;
    return [row, column, cell.appendTo(board)];
  });

  var columns = xmap(function(row, column) {
    return [column, row, rows[row][column]];
  });

  var blocks = xmap(function(row, column) {
    var i = Math.floor(row / 3) * 3 + Math.floor(column / 3);
    var j = (row % 3) * 3 + column % 3;
    return [i, j, rows[row][column]];
  });

  var apply = function(cell, iterator) {
    var data = cell.data('sudoku');
    var row = data.row;
    var column = data.column;
    var block = Math.floor(row / 3) * 3 + Math.floor(column / 3);

    $.each(rows[row], iterator);
    $.each(columns[column], iterator);
    $.each(blocks[block], iterator);
  };

  return board.data('sudoku', {
    rows:     rows,
         columns:  columns,
         blocks:   blocks,
         deployed: deployed,
         apply:    apply
  });
};

var create = function(row, column, value) {
  var cell = $('<div/>').addClass('sudoku-cell').css({
    left: column * 46 + 2,
      top:  row    * 46 + 2
  });

  if (value > 0) {
    cell.addClass('sudoku-frozen').text(value);
  }
  else {
    cell.click(function() {
      if (active) deactivate(active);
      active = $(this).addClass('sudoku-active');
      apply(active, function() { this.addClass('sudoku-group') });
    });
  }

  return cell.data('sudoku', {
    row:      row,
         column:   column,
         value:    value,
         frozen:   value > 0,
         deployed: value > 0
  });
};

var complete = function(board) {
  var rows = board.data('sudoku').rows;
  xmap(function(row, column) { rows[row][column].unbind('click') });
  if (active) deactivate(active);
  active = null;
  thissession = Currentgames.findOne({id:Meteor.userId()});
  delete thissession._id;
  thissession.enddate = new Date();
  loldate = new Date(thissession.startdate);
  thissession.duration = (thissession.enddate-loldate)/60000;// in minutes
  Gamehistory.insert(thissession);
  Currentgames.remove({id:Meteor.userId()});
  Meteor.call('sendReport',
      {who:Meteor.user().emails[0].address,
       diff:thissession.diff,
       startdate:thissession.startdate,
       enddate:thissession.enddate,
       str:thissession.str,
       duration: thissession.duration
  });
  alert('Tebrikler.');
};

var create_subborder = function(left, top) {
  var cell = $('<div/>').addClass('sudoku-subborder').css({
    left: left,
      top:  top
  });

  return cell.data('sudoku', {
    left: left,
         top:  top
  });
};


var deactivate = function(cell) {
  cell.removeClass('sudoku-active');
  apply(cell, function() { this.removeClass('sudoku-group') });
  if (!cell.data('sudoku').deployed) clear(cell);
};

var clear = function(cell) {
  var data = cell.data('sudoku');
  data.value = 0;
  data.deployed = false;
  return cell.removeClass('sudoku-invalid').text('');
};

var apply = function(cell, iterator) {
  cell.parent('div.sudoku-board').data('sudoku').apply(cell, iterator);
};

var xmap = function(iterator) {
  var items = [];

  for (var row = 0; row < 9; row++) {
    for (var column = 0; column < 9; column++) {
      result = iterator(row, column);
      if (!result) continue;
      var i = result[0];
      var j = result[1];
      if (!items[i]) items[i] = [];
      items[i][j] = result[2];
    }
  }

  return items;
};


$.fn.sudoku2 = function(sudoku_string) {
  this.html('');
  //var sudoku_string; 

  //if ( result == null ) {
  //result = Puzzles.findOne( { diff : difficulty, random : { $lte : rand } } );
  //}
  //sudoku_string=result.str;
  //console.log('adsasdasdasd '+result);
  //sudoku_string=result.str;
  //console.log(rand+' '+'ASD'+sudoku_string+'ASD');
  //var sudoku_string ='051002379000040086076030500300209008000308000100407003004020730610070000723500860'
  if (!bound) {
    $(window).keydown(function(event) {
      if (!active) return;
      var data = active.data('sudoku');
      if (data.frozen) return;
      var value = event.keyCode - 48;
      if (value < 0 || 9 < value) return;
      var before = data.deployed;
      if (value == 0) { clear(active); }
      else {
        var deployed = true;
        apply(active, function() {
          if (deployed && value == this.data('sudoku').value) {
            return deployed = false;
          }
        });
        data.value = value;
        data.deployed = deployed;
        active[deployed ? 'removeClass' : 'addClass']('sudoku-invalid').
      text(value);
      }
    var after = data.deployed;
    var board = active.parent('div.sudoku-board');
    var boardData = board.data('sudoku');

    if      (!before &&  after) boardData.deployed++;
    else if ( before && !after) boardData.deployed--;

    if (boardData.deployed == 81) complete(board);
    });
    bound = true;
  }

  //var thisdate = new Date();
  //Currentgames.insert({id:Meteor.userId()});
  console.log('KLKOKOKOKOKOKO '+sudoku_string);

  var board = initialize(sudoku_string).appendTo(this);
  board.append(create_subborder(2,2));
  board.append(create_subborder(140,2));
  board.append(create_subborder(278,2));
  board.append(create_subborder(2,140));
  board.append(create_subborder(140,140));
  board.append(create_subborder(278,140));
  board.append(create_subborder(2,278));
  board.append(create_subborder(140,278));
  board.append(create_subborder(278,278));

  if (board.data('sudoku').deployed == 81) complete(board);
  return this;
};
//})(jQuery);


//Meteor.startup(function(){
////setTimeout(function(){ 
//console.log('qqqq '+Puzzles.find().count());
//$('#sudoku').sudoku2(0);
////}, 2000);
//});

//Meteor.startup(function(){
//Meteor.autorun(function(){
//var lololol = Puzzles.find().fetch();
//});
//});

var givePuzzle = function (difficulty){

  rand = Math.floor((Math.random()*Puzzles.find({diff:difficulty}).count()));

  console.log(rand+' '+'ASD');
  result = Puzzles.find( { diff : difficulty} ).fetch()[rand];
  if (result == undefined){
    console.log('Cant retrive puzzle');
    //return;
  }else{
    Currentgames.insert({id:Meteor.userId(), str:result.str, startdate:new Date(),diff:difficulty});
    $('#sudoku').sudoku2(result.str);
    //$('#sudoku').html("ASDASDASDSADASDAS");
  }
};
//////////////////////////////
Template.puzzle.events({
  'click .requestgame': function(){
    console.log('LLOLOLOLOLOL');
    //Currentgames.insert({id:Meteor.userId()});
    givePuzzle(selectDiff());
  }

});

var selectDiff = function() {
  if (Gamehistory.find({id:Meteor.userId()}).count()>=5){
    return 1;
  }else {
    return 0;
  }
};
////////////////////////////////////////
Template.puzzle.currentNotExists = function(){
  //if (!Meteor.userId()){console.log('asfasfas'); return false; }

  if (Puzzles.find().count()==0){console.log('asfasfas'); return false; }
  if (Currentgames.find({id:Meteor.userId()}).count()==0){
    return true;  
  }else{
    return false;
  }
};

Template.puzzle.loadCurrent = function () {
  if (Puzzles.find().count()==0){return;}
  if ($('#sudoku').html()!=''){return;}
  thissession = Currentgames.findOne({id:Meteor.userId()});
  $('#sudoku').sudoku2(thissession.str);
  console.log('Loading previous session.');
};

Template.puzzle.isAdmin = function () {
  if (Meteor.user().emails==undefined){return false;}
  if (Meteor.user().emails[0].address=='aysecansutanrikulu@gmail.com'||
      Meteor.user().emails[0].address=='onursolmaz@gmail.com'){
        return true;
      }else{
        return false;
      }

};

Template.puzzle.rendered = function(){
  //var self = this;
  //self.node = self.find("#sudoku");
  if (!self.handle){
    self.handle = Meteor.autorun( function(){
      var lololol = Puzzles.find().fetch();
      //var ololol= Meteor.users.find().fetch();
      console.log('LOLPAINIS '+Puzzles.find().count());

      //console.log(Meteor.userID);
      //if (!Meteor.userId()){ 
      //$('#sudoku').html('Lutfen giris yapin.');
      //return;
      //}
      //$('#sudoku').sudoku2(0);
      //givePuzzle(0);
    });

  }
  var puzzles = Puzzles.find();


  //if (puzzles.count() > 0){ 
  ////return puzzles;
  ////$(function(){
  //$('#sudoku').sudoku2(0);
  ////$("#sudoku").hide().fadeIn('fast');
  //console.log($('#sudoku').html());
  ////});
  ////return self.node;
  ////self.node.sudoku2(0);
  ////if (self.find('#sudoku')!=false){

  ////self.find("#sudoku").sudoku2(0);

  ////}
  ////return $('#sudoku').html();
  //console.log('LOLPAINIS '+Puzzles.find().count());
  //}
}

Template.puzzle.destroyed = function () {
  this.handle && this.handle.stop();
};

Template.page.loading = function() {
  return Puzzles.find().count === 0 ? "Loading..." : "";
}

//Meteor.subscribe('puzzles', function (){
//// set a session key to true to indicate that the subscription is completed.
////          Session.set('subscription_completed', true);
//Session.set('subscription_completed', true);
//console.log('qqqq '+Puzzles.find().count());
////$('#sudoku').sudoku2(0);
//});
//console.log('qqqq '+Puzzles.find().count());


//Template.myTemplate.isSubscriptionComplete = function(){
//return Session.get('subscription_completed'); 
//}

//$('#sudoku').sudoku('530070000' +
//'600195000' +
//'098000060' +
//'800060003' +
//'400803001' +
//'700020006' +
//'060000280' +
//'000419005' +
//'000080079');


//$('#sudoku').sudoku('034678912' +
//'672195348' +
//'198342567' +
//'859761423' +
//'426853791' +
//'713924856' +
//'961537284' +
//'287419635' +
//'345286170');

//Template.page.puzzles = function() {  
//console.log('Templatedasdasda'+Puzzles.find().count());
//return $('#sudoku').sudoku2(0);
////return Puzzles.find();
//};

//var create_puzzle = function(difficulty) 
//{
//var sudoku_string = Meteor.call("getpuzzle",36,0.4,0.5);
//console.log(sudoku_string);
//$('#sudoku').sudoku();

//}

//console.log("LOLOLOLOLOLOL");
//create_puzzle(0);
/*
   $('#resolved-sudoku').sudoku('534678912' +
   '672195348' +
   '198342567' +
   '859761423' +
   '426853791' +
   '713924856' +
   '961537284' +
   '287419635' +
   '345286179');
   */

//Meteor.methods({
//getpuzzle: function (clu, lo, hi) {
//var require = __meteor_bootstrap__.require;
//var sys = require('sys');
//var exec = require('child_process').exec;

////exec("php social.php", function(error, stdout, stderr) {
////exec(path_sudoku_gen+" 36 0.4 0.5", function(error, stdout, stderr) {
//exec(path_sudoku_gen+" "+clu+" "+lo+" "+hi, function(error, stdout, stderr) {
//console.log(stdout);
//Fiber(function() {
//Shell.insert(
//{
//result: stdout
//}
//);
//}).run();
//});

////var results = Shell.find({}, {});
//var results = Shell.find({}, {}).fetch();
////console.log(results);
//return results;
//}
//});

