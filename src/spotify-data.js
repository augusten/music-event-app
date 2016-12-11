'use strict'

/////////////////////////////////////////////////////////////////////////
// ------------ NECESSARY MODULES AND GLOBAL VARIABLES ------------------

const Sequelize = require ('sequelize')
const express = require ('express')
const session = require ('express-session')
const bodyParser = require('body-parser')
const request = require('request')
// const Promise = require('promise')
const querystring = require('querystring')
const router = express.Router()
const app = express()
const async = require ( 'async' )
const Spotify = require('spotify-web-api-node' )

// load database module and the model
const database = require( __dirname + '/database' )
let db = database.DB()
let User = database.User( db )

// some helper functions form module
const helpers = require( __dirname + '/helpers' )

// For logged in user use session
app.use(
  express.static( __dirname + '/../static' ),
  session ({
    secret: 'this is some secret',
    resave: true,
    saveUninitialized: false,
    cookie: {
      secure: false,
      maxage: 36000
    }
  })
)

// User authorization based on Spotify tutorial from https://github.com/spotify/web-api-auth-examples
let CLIENT_ID = process.env.SPOT_CLIENT_ID // Your client id
let CLIENT_SECRET = process.env.SPOT_CLIENT_SECRET // Your secret
let REDIRECT_URI = process.env.SPOT_REDIRECT_URI // Your redirect uri
let STATE_KEY = 'spotify_auth_state'

// call to Spotify API
const spotifyApi = new Spotify ({
  clientId: CLIENT_ID,
  clientSecret: CLIENT_SECRET,
  redirectUri: REDIRECT_URI
})

/////////////////////////////////////////////////////////////////////////
// ------------------------------- ROUTES -------------------------------

// trial route
router.get( '/', ( req, res ) => {
	let usr = req.session.user
	res.render( 'index' , {
		user: req.session.user
	})
})

// after authorization redirect to search
router.get( '/spot', ( req, res ) => {
	let usr = req.session.user
	res.redirect( '/search')
})

// login get request
router.get('/login', function(req, res) {
	let state = helpers.generateRandomString(16)
	let scopes = ['user-read-private', 'user-read-email', 'playlist-read-private']
	// request authorization
	res.redirect( spotifyApi.createAuthorizeURL( scopes, state ) )
})

// callback request after authorization
router.get('/callback', ( req, res ) => {
  const { code, state } = req.query // get the code and state returned from authURL
  // authorization codeto set up tokens necessary
  if (state === null) {
    res.redirect('#state_mismatch')
  } else {
    spotifyApi.authorizationCodeGrant( code )
    
    .then( data => {
      // assign access and refresh tokens for session
      spotifyApi.setAccessToken( data.body.access_token )
      spotifyApi.setRefreshToken( data.body.refresh_token )

      // get user personal information/authorization
      spotifyApi.getMe()

      .then( profile => {
        User.findOne({
          where: { user_id: profile.body.id }
        })

        .then( user => {
            // create new user in database if they do not exist yet
            if (user === null) {
              User.create({
                user_id: profile.body.id,
                name: profile.body.display_name,
                email: profile.body.email,
                list_artists: [],
                photo: profile.body.images[0].url
              })
            }
            // based on the profile retriece their playlists; output will be an array of playlist objects
            spotifyApi.getUserPlaylists(profile.body.id)
            
            .then( playlists => {
              req.session.user = user

              // function that updates the database with all the artists listened to in the playlist
              helpers.getTracks ( playlists.body.items, data.body.access_token, ( artistArray ) => {
                User.update(
                  {list_artists: Array.from(new Set(artistArray)) }, // Array.from(new Set(artistArray))
                  {where: {user_id: profile.body.id}
                })
              })
              res.redirect('/spot#' + 
                querystring.stringify({
                  access_token: data.body.access_token,
                  refresh_token: data.body.refresh_token
                }))
            })
          })
      } )
    }, err => {
      console.log( 'uh oh, something went wrong!')
    })
  }
})

// route to log user out from their Spotify account - has to be implemented still/frontend doesn't have the button
router.get( '/out', ( req, res ) => {
	AuthenticationClient.clearCookies(getApplication());
	res.send( 'logged out? ')
})

/////////////////////////////////////////////////////////////////////////
// ------------------------- SYNC DATABASE ------------------------

db.sync()

/////////////////////////////////////////////////////////////////////////
// ------------------------- EXPORT ROUTES ------------------------

module.exports = router