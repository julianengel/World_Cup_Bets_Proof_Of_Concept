// grab the things we need
var mongoose = require('mongoose');
var Schema = mongoose.Schema;

// create a schema
var gameSchema = new Schema({
  gameID: {type: String, unique: true},
  winner : String,
  status: String,
  homeTeam: String, 
  awayTeam: String, 
  homeScore: Number,
  awayScore: Number,
  created_at: Date, 
});



// the schema is useless so far
// we need to create a model using it
var Game = mongoose.model('Games', gameSchema);

// make this available to our users in our Node applications
module.exports = Game;