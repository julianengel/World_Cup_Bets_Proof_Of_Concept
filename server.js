// server.js
// where your node app starts

// init project
var express = require('express');
var app = express();
var mongoose = require('mongoose');
var request = require('request');
var bodyParser = require("body-parser");
var session = require('express-session');
var MongoStore = require('connect-mongo')(session);



mongoose.connect("mongodb://worker:"+ process.env.db_pwd +"@" + process.env.db_usr)
var db = mongoose.connection;
app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());
app.use(express.static('public'));
//use sessions for tracking logins
app.use(session({
  secret: 'sessionSecret',
  resave: true,
  saveUninitialized: false,
  store: new MongoStore({
    mongooseConnection: db
  })
}));
app.set('view engine', 'ejs');

var routes = require('./router.js');
app.use('/', routes);


// listen for requests :)
var listener = app.listen(process.env.PORT, function () {
  console.log('Your app is listening on port ' + listener.address().port);
});
