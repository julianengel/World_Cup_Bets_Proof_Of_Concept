var express = require('express');
var router = express.Router();
var User = require('./models/users.js');
var methods = require('./methods.js')

// http://expressjs.com/en/starter/basic-routing.html
router.get("/", function (request, response) {
  // methods.updateAllBets()
  response.render('pages/welcome')  
});

router.get("/sign", function (request, response, next) {
  
    User.findById(request.session.userId)
    .exec(function (error, user) {
      if (error) {
        return next(error);
      } else {
        if (user === null) {
          return response.render('pages/sign-up',{data : "Non Existent"})
        } else {
          return response.render('pages/sign-up',{data:user})
        }
      }
    });
  
  
  
 // response.render('pages/sign-up')
});

router.get('/team',function(reques,response){

  methods.getTeamUsersAndBets('ems')

response.send('hi')



})


router.get("/saveGames", function(request,response){
  
  methods.getAllMatches()
    .then(games =>{
    
    games.forEach(game =>{
    
      methods.takeGame(game.gameID,game.status, game.date, game.homeTeam,game.awayTeam,game.homeScore,game.awayScore, game.winner)
    
    })
    response.send(games)
    
  
  
  })
  
  
})

router.get("/calculate",function(request, response){
   
  methods.calculate().then(r => {
                                 
                                 
                                 
                                 response.render('pages/the_end',{winner:"julian",scores:r})})

  
})

router.get('/matches', function(request, response){

response.render('pages/matches')

})

router.post('/boob',function(request,response){
  let game = request.body
  console.log(game)
  methods.takeBet(game.gameID, game.date, game.homeTeam,game.awayTeam, game.homeScore, game.awayScore, game.user)
  let resp = `Success, your bet was saved with the following data: ${game.homeTeam} vs ${game.awayTeam} - ${game.homeScore} : ${game.awayScore}`
  console.log(resp)
  response.end(resp);
});


router.post('/sign', function (req, res, next) {
  // confirm that user typed same password twice
  if (req.body.password !== req.body.passwordConf) {
    var err = new Error('Passwords do not match.');
    err.status = 400;
    res.send("passwords dont match");
    return next(err);
  }

  if (req.body.email &&
    req.body.username &&
    req.body.password &&
    req.body.passwordConf) {

    var userData = {
      email: req.body.email,
      username: req.body.username,
      password: req.body.password,
    }

    User.create(userData, function (error, user) {
      if (error) {
        return next(error);
      } else {
        req.session.userId = user._id;
        return res.redirect('/main');
      }
    });

  } else if (req.body.logemail && req.body.logpassword) {
    User.authenticate(req.body.logemail, req.body.logpassword, function (error, user) {
      if (error || !user) {
        var err = new Error('Wrong email or password.');
        err.status = 401;
        return next(err);
      } else {
        req.session.userId = user._id;
        return res.redirect('/main');
      }
    });
  } else {
    var err = new Error('All fields required.');
    err.status = 400;
    return next(err);
  }
})







// GET route after registering
router.get('/profile', function (req, res, next) {
  User.findById(req.session.userId)
    .exec(function (error, user) {
      if (error) {
        return next(error);
      } else {
        if (user === null) {
          var err = new Error('Not authorized! Go back!');
          err.status = 400;
          return next(err);
        } else {
          methods.retrieveBetsForUser(user).then(bets => {
          
            return res.render("pages/profile",{user:user,bets:bets})
          
          
          })
        }
      }
    });
});


router.get('/main', function (req, res, next) {
  User.findById(req.session.userId)
    .exec(function (error, user) {
      if (error) {
        return next(error);
      } else {
        if (user === null) {
          var err = new Error('Not authorized! Go back!');
          err.status = 400;
          return res.redirect("/")
        } else {
            return methods.getTodayMatches().then(
              returned => {
                           res.render('pages/index',{game:returned, user:user})
                })
          
        }
      }
    });
});

// router.get('/all', function (req, res, next) {
//   User.findById(req.session.userId)
//     .exec(function (error, user) {
//       if (error) {
//         return next(error);
//       } else {
//         if (user === null) {
//           var err = new Error('Not authorized! Go back!');
//           err.status = 400;
//           return next(err);
//         } else {
//             return methods.getAllMatches().then(
//               returned => {console.log(returned);
//                            res.render('pages/all',{game:returned, user:user})
//                 })
          
//         }
//       }
//     });
// });


// GET /logout
router.get('/logout', function(req, res, next) {
  if (req.session) {
    // delete session object
    req.session.destroy(function(err) {
      if(err) {
        return next(err);
      } else {
        return res.redirect('/');
      }
    });
  }
});



module.exports = router;