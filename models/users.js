// grab the things we need
var mongoose = require('mongoose');
var bcrypt = require('bcrypt');

// var Schema = mongoose.Schema;
// // create a schema
// var userSchema = new Schema({
//   name: String,
//   username: { type: String, required: true, unique: true },
//   password: { type: String, required: true },
//   admin: Boolean,
//   created_at: Date,
//   updated_at: Date
// });

// // the schema is useless so far
// // we need to create a model using it
// var User = mongoose.model('User', userSchema);

// // make this available to our users in our Node applications
// module.exports = User;


var UserSchema = new mongoose.Schema({
  email: {
    type: String,
    unique: true,
    required: true,
    trim: true
  },
  username: {
    type: String,
    unique: true,
    required: true,
    trim: true
  },
  password: {
    type: String,
    required: true,
  },
  teamID : {
    type : String,
    required : false
  }
});


//authenticate input against database
UserSchema.statics.authenticate = function (email, password, callback) {
  User.findOne({ email: email })
    .exec(function (err, user) {
      if (err) {
        return callback(err)
      } else if (!user) {
        var err = new Error('User not found.');
        err.status = 401;
        return callback(err);
      }
      bcrypt.compare(password, user.password, function (err, result) {
        if (result === true) {
          return callback(null, user);
        } else {
          return callback();
        }
      })
    });
}



//hashing a password before saving it to the database
UserSchema.pre('save', function (next) {
  var user = this;
  bcrypt.hash(user.password, 10, function (err, hash){
    if (err) {
      return next(err);
    }
    user.password = hash;
    next();
  })
});

var User = mongoose.model('User', UserSchema);
module.exports = User;