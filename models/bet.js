// grab the things we need
var mongoose = require('mongoose');
var Schema = mongoose.Schema;

// create a schema
var betSchema = new Schema({
  username: { type: String, required: true, unique: false },
  gameID: String,
  homeTeam: String, 
  awayTeam: String, 
  homeScore: Number,
  awayScore: Number,
  created_at: Date,
  winner: String,
  updated_at : Date
});

betSchema.pre('save', function(next) {
  // get the current date
  var currentDate = new Date();

  // change the updated_at field to current date
  this.updated_at = currentDate;

  // if created_at doesn't exist, add to that field
  if (!this.created_at)
    this.created_at = currentDate;

  next();
});


// the schema is useless so far
// we need to create a model using it
var Bet = mongoose.model('Bet', betSchema);

// make this available to our users in our Node applications
module.exports = Bet;