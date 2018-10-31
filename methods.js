var Bet = require('./models/bet');
var request = require('request');
var Game = require('./models/games');
var User = require('./models/users')
const fs = require('fs');




function getGameForID() {

    return new Promise(function(resolve, reject) {
        Game.find({}, null, {
            sort: 'created_at'
        }, function(error, games) {
            resolve(games)
        })

    })



}

function getBetForID(id) {


    return new Promise(function(resolve, reject) {

        Bet.find({
            gameID: id
        }, null, {
            sort: 'created_at'
        }, function(error, bets) {
            resolve(bets)
        })
    })

}


module.exports = {


    getTeamUsersAndBets: function(teamID) {
        User.find({
            teamID: teamID
        }, function(err, users) {
            if (err) throw err;

            let usernames = users.map(one => {
                return one.username
            })
            // temporary date comparison, setting hours to zero to compare.... doesnt account for daylight savings as Wc is summer exclusive
            let d = new Date()
            let today = d.setHours(0, 0, 0)
            let tomorrow = d.setDate(d.getDate() + 1)
            console.log(today + '  ' + tomorrow)
            console.log(typeof today)
            Bet.find({
                username: {
                    '$in': usernames
                },
                created_at: {
                    "$gte": today,
                    "$lt": tomorrow
                }
            }, function(error, bets) {
                if (error) throw error;
                console.log(bets)

            })

        })



    },

    updateCreatedAt: function() {

        Bet.find({}, function(err, bets) {
            if (err) {

            } else {
                // all bets for user
                bets.forEach(bet => {
                    bet.updated_at = bet.created_at
                    bet.save(function(err) {
                        if (err) throw err;

                        console.log('User successfully updated!' + bet.updated_at);
                    });


                })


            }
        });




    },

    calculate: function() {
        return new Promise (function(resolve,reject){

          var correctWinner = {
              julian: 0,
              ChristosWinner: 0
          }
          var correctScore = {
              julian: 0,
              ChristosWinner: 0
          }
          var correctTotal = {
              julian: 0,
              ChristosWinner: 0
          }
          let divider = '\n------------------------------\n'
          var wstream = fs.createWriteStream('/app/public/log.txt');

          getGameForID()
              .then(gameList => {

                  // find way to also download the actual games, to be doinf comparisons 


                  Promise.all(gameList.map(game => getBetForID(game.gameID)))
                      .then(games => {
                          // games is the 64 different games
                          games.forEach(function(bets, i) {
                              // here we have each individual game
                              // each game has two bets

                              let game = gameList[i]
                              let titleString = `The Game With ID ${game.gameID} between ${game.homeTeam} and ${game.awayTeam} was played on ${game.created_at}. The final score was ${game.homeScore}:${game.awayScore}`
                              wstream.write(divider + `\n${titleString}\n\n`)

                              bets.forEach(bet => {
                                  if (game.winner == bet.winner) {
                                      correctWinner[bet.username]++
                                      correctTotal[bet.username]++
                                      let longStringW = `${bet.username} has scored 1 point. \n  -) They betted correctly that ${bet.winner} would win. \n`
                                      wstream.write(longStringW)
                                  } else {
                                      let longStringW = `${bet.username} was incorrect. \n  -) They betted that ${bet.winner} would win.`
                                      wstream.write(longStringW)

                                  }
                                  if (game.homeScore == bet.homeScore && game.awayScore == bet.awayScore) {
                                      correctScore[bet.username]++
                                      correctTotal[bet.username]++
                                      let longStringS = `${bet.username} has scored 1 point. \n  -) They betted the correct score of ${bet.homeScore} : ${bet.awayScore}. \n`
                                      wstream.write(longStringS)


                                  }
                                let pointString = `\nHis new total is: ${correctTotal[bet.username]} \n\n`
                                wstream.write(pointString)
                              })
                            wstream.write(divider)
                          })
                          resolve([correctTotal,correctWinner, correctScore])
                      })
              })
      
      });
    },

    updateWinner: function() {

        Bet.find({}, function(err, bets) {
            if (err) {

            } else {
                // all bets for user
                bets.forEach(bet => {

                    if (bet.homeScore > bet.awayScore) {
                        bet.winner = bet.homeTeam
                    } else if (bet.homeScore < bet.awayScore) {
                        bet.winner = bet.awayTeam
                    } else {
                        bet.winner = "Draw"

                    }

                    bet.save(function(err) {
                        if (err) throw err;

                        console.log('Bet successfully updated!');
                        console.log("The winner is " + bet.winner + " With a score of " + bet.homeScore + " against " + bet.awayScore + " for " + bet.awayTeam)
                    });


                })


            }
        });




    },

    getTodayMatches: function() {

        return new Promise(function(resolve, reject) {

            request('http://worldcup.sfg.io/matches/today?details=false', function(error, response, body) {
                // console.log('error:', error); // Print the error if one occurred
                // console.log('statusCode:', response && response.statusCode); // Print the response status code if a response was received
                let bodyy = JSON.parse(body)
                // console.log('body:', bodyy); // Print the HTML for the Google homepage


                let games = []

                bodyy.forEach((match, index) => {

                    let status = match["status"]
                    let home_team = match["home_team"]["country"]
                    let home_goals = match["home_team"]["goals"]
                    let away_team = match["away_team"]["country"]
                    let away_goals = match["away_team"]["goals"]
                    let winner = match["winner"]
                    let game_id = match["fifa_id"]
                    let date = match["datetime"]


                    let game = {
                        status: status,
                        homeTeam: home_team,
                        homeScore: home_goals,
                        awayTeam: away_team,
                        awayScore: away_goals,
                        winner: winner,
                        gameID: game_id,
                        date: date
                    }
                    games.push(game)
                    // console.log(game)
                })

                resolve(games)

            });
        });

    },

    takeBet: function(game_id, date, home_team, away_team, score1, score2, user) {
        // whatever

        var bet = new Bet({

            username: user,
            gameID: game_id,
            homeTeam: home_team,
            awayTeam: away_team,
            homeScore: score1,
            awayScore: score2,
            created_at: date,
            updated_at: date,

        });

        // call the built-in save method to save to the database
        bet.save(function(err) {
            if (err) throw err;

            console.log('Bet saved successfully!');
        });


    },

    retrieveBetsForUser: function(user) {

        return new Promise(function(resolve, reject) {

            Bet.find({
                username: user.username
            }, null, {
                sort: '-created_at'
            }, function(err, bets) {
                if (err) {

                    reject(err)
                } else {
                    // all bets for user
                    resolve(bets)
                }
            });

        })


    },

    takeGame: function(game_id, status, date, home_team, away_team, score1, score2, winner) {

        var game = new Game({

            gameID: game_id,
            status: status,
            winner: winner,
            homeTeam: home_team,
            awayTeam: away_team,
            homeScore: score1,
            awayScore: score2,
            created_at: date,
            updated_at: date,

        });

        // call the built-in save method to save to the database
        game.save(function(err) {
            if (err) throw err;

            console.log('Game saved successfully!');
        });

    },
  
    getAllMatches: function() {

        return new Promise(function(resolve, reject) {

            request('http://worldcup.sfg.io/matches/?details=false', function(error, response, body) {
                // console.log('error:', error); // Print the error if one occurred
                // console.log('statusCode:', response && response.statusCode); // Print the response status code if a response was received
                let bodyy = JSON.parse(body)
                // console.log('body:', bodyy); // Print the HTML for the Google homepage


                let games = []

                bodyy.forEach((match, index) => {

                    let status = match["status"]
                    let home_team = match["home_team"]["country"]
                    let home_goals = match["home_team"]["goals"]
                    let away_team = match["away_team"]["country"]
                    let away_goals = match["away_team"]["goals"]
                    let winner = match["winner"]
                    let game_id = match["fifa_id"]
                    let date = match["datetime"]


                    let game = {
                        status: status,
                        homeTeam: home_team,
                        homeScore: home_goals,
                        awayTeam: away_team,
                        awayScore: away_goals,
                        winner: winner,
                        gameID: game_id,
                        date: date
                    }
                    games.push(game)
                    // console.log(game)
                })

                resolve(games)

            });
        });

    }


};