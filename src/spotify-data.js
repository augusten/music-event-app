// import  modules
const Sequelize = require ('sequelize')
const express = require ('express')
const session = require ('express-session')
const bodyParser = require('body-parser')
const request = require('request')
const querystring = require('querystring')
// const cookieParser = require('cookie-parser')
const router = express.Router()
const app = express()

// User authorization based on Spotify tutorial from https://github.com/spotify/web-api-auth-examples
let client_id = process.env.SPOT_CLIENT_ID
let client_secret = process.env.SPOT_CLIENT_SECRET
let redirect_uri = process.env.SPOT_REDIRECT_URI

// trial route
router.get( '/', ( req, res ) => {
	res.render( 'index' )
})

router.get( '/search', ( req, res ) => {
	res.render( 'search' )
})

var generateRandomString = function(length) {
	// function to create a a random string for the state
	var text = ''
	var possible = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789'

	for (var i = 0; i < length; i++) {
		text += possible.charAt(Math.floor(Math.random() * possible.length))
	}
	return text
}

let stateKey = 'spotify_auth_state'

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

        // use the access token to access the Spotify Web API
        request.get(options, function(error, response, body) {

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

module.exports = router