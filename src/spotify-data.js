// ------------ NECESSARY MODULES AND GLOBAL VARIABLES ------------------

const Sequelize = require ('sequelize')
const express = require ('express')
const session = require ('express-session')
const bodyParser = require('body-parser')
const request = require('request')
const Promise = require('promise')
const querystring = require('querystring')
// const cookieParser = require('cookie-parser')
const router = express.Router()
const app = express()

// User authorization based on Spotify tutorial from https://github.com/spotify/web-api-auth-examples
let client_id = process.env.SPOT_CLIENT_ID
let client_secret = process.env.SPOT_CLIENT_SECRET
let redirect_uri = process.env.SPOT_REDIRECT_URI
let stateKey = 'spotify_auth_state'

// ------------------------- NECESSARY FUNCTIONS ------------------------

var generateRandomString = function(length) {
	// function to create a a random string for the state
	var text = ''
	var possible = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789'

	for (var i = 0; i < length; i++) {
		text += possible.charAt(Math.floor(Math.random() * possible.length))
	}
	return text
}

// ------------------------- CREATE DATABASES USED ----------------------

// connect to database
let db = new Sequelize( process.env.POSTGRES_SPOTFB, process.env.POSTGRES_USER , process.env.POSTGRES_PASSWORD, {
	server: 'localhost',
	dialect: 'postgres'
})

// Define the models of the database
let Fave_artist = db.define( 'fave_artist', {
	user_ID: Sequelize.STRING,
	name: Sequelize.STRING,
	email: Sequelize.STRING,
	listArtists: Sequelize.ARRAY(Sequelize.STRING)
})

// ------------------------------- ROUTES -------------------------------

// trial route
router.get( '/', ( req, res ) => {
	res.render( 'index' )
})

// after authorization redirect to search
router.get( '/search', ( req, res ) => {
	res.render( 'search' )
})

router.get('/login', function(req, res) {
  var state = generateRandomString(16)
  // request authorization
  var scope = 'user-read-private user-read-email playlist-read-private';
  res.redirect('https://accounts.spotify.com/authorize?' +
    querystring.stringify({
      response_type: 'code',
      client_id: client_id,
      scope: scope,
      redirect_uri: redirect_uri,
      state: state
    }))
})

router.get('/callback', function(req, res) {

  // request refresh and access tokens
  // after checking the state parameter

  var code = req.query.code || null
  var state = req.query.state || null

  if (state === null ){
    res.redirect('/#' +
      querystring.stringify({
        error: 'state_mismatch'
      }));
  } else {
    var authOptions = {
      url: 'https://accounts.spotify.com/api/token',
      form: {
        code: code,
        redirect_uri: redirect_uri,
        grant_type: 'authorization_code'
      },
      headers: {
        'Authorization': 'Basic ' + (new Buffer(client_id + ':' + client_secret).toString('base64'))
      },
      json: true
    };

    request.post(authOptions, function(error, response, body) {
      if (!error && response.statusCode === 200) {

        var access_token = body.access_token,
            refresh_token = body.refresh_token

        var options = {
          url: 'https://api.spotify.com/v1/me',
          headers: { 'Authorization': 'Bearer ' + access_token },
          json: true
        }

        var optionsTwo = {
          url: 'https://api.spotify.com/v1/me/playlists',
          headers: { 'Authorization': 'Bearer ' + access_token },
          json: true
        }

        // use the access token to access the Spotify Web API
        request.get(options, function(error, response, body) {
        	console.log(body)
			let firstProm = Fave_artist.findOne({
				where: {user_ID: body.id}
			})

			let secondProm = firstProm.then( user => {
				// console.log(user)
				// if (user === null) {
				// 	Fave_artist.
				// }

		        request.get(optionsTwo, function(errorTwo, responseTwo, bodyTwo) {

		        	// get all the artists listend to by the user
		        	let artists = []
		        	let ihatepromises = new Promise (( res, rej ) => {
			        	for (var i = 2 - 1; i >= 0; i--) {
			        		let promOne = new Promise ( ( resolve, reject ) => {

			        		// look into playlist only if not empty
				        		if (bodyTwo.items[i].tracks.total !== 0) {
					        		var optionsThree = {
					    				// get the tracks
					      				url: bodyTwo.items[i].tracks.href,
					      				headers: { 'Authorization': 'Bearer ' + access_token },
					      				json: true
					    			}
					    			resolve( optionsThree )
			        			}
			        		})
			        		let promTwo = promOne.then( (opt) => {
			        			request.get(opt, (err, resp, bod) => {
			        			// loop through every track in the playlist
			        				for (var j = bod.items.length - 1; j >= 0; j--) {
			        					for (var k = bod.items[j].track.artists.length - 1; k >= 0; k--) {
			        						artists.push(bod.items[j].track.artists[k].name)
			        					}
			        				}
			        				setTimeout( () => { 
			        					res( artists )
			        				}, 1000)
			        			})
			        		})
			        	}
			        })
			        ihatepromises.then( artistArray => {
			        	// only add default information if the user has never used the app yet/ if not in database yet
			        	if (user == null) {
				        	Fave_artist.create({
				        		user_ID: body.id,
								name: body.display_name,
								email: body.email,
								listArtists: artistArray
				        	})
				        }
			        })
		        })
		    })
	    })

        // we can also pass the token to the browser to make requests from there
        res.redirect('/search#' +
          querystring.stringify({
            access_token: access_token,
            refresh_token: refresh_token
          }))
      } else {
        res.redirect('/search#' +
          querystring.stringify({
            error: 'invalid_token'
          }))
      }
    })
  }
})

// router.get('/refresh_token', function(req, res) {

//   // requesting access token from refresh token
//   var refresh_token = req.query.refresh_token;
//   var authOptions = {
//     url: 'https://accounts.spotify.com/api/token',
//     headers: { 'Authorization': 'Basic ' + (new Buffer(client_id + ':' + client_secret).toString('base64')) },
//     form: {
//       grant_type: 'refresh_token',
//       refresh_token: refresh_token
//     },
//     json: true

//   };

//   request.post(authOptions, function(error, response, body) {
//     if (!error && response.statusCode === 200) {
//       var access_token = body.access_token
//       res.send({
//         'access_token': access_token
//       })
//     }
//   })
// })

// ------------------------- SYNC DATABASE ------------------------

// db.sync( {force: true} ).then( db => {
// 	console.log( 'Synced' )

// 	// Create 2 demo users
// 	Fave_artist.create( {
// 		user_ID: '11111111',
// 		name: 'Auguste',
// 		email: 'auguste@nausedaite.lt',
// 		listArtists: ['hello', "it's", 'me']
// 	} )
// 	Fave_artist.create( {
// 		user_ID: '22222222',
// 		name: 'Guga',
// 		email: 'auguste@nausedaite.lt',
// 		listArtists: ['Leonard Cohen', "MOTHXR", 'MO']
// 	} )
// })

db.sync()

// ------------------------- EXPORT ROUTES ------------------------

module.exports = router