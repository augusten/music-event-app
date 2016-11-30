'use strict'

// import  modules
const Sequelize = require ('sequelize')
const express = require ('express')
const session = require ('express-session')
const bodyParser = require('body-parser')
const fbData = require( __dirname + '/fb-data')
let spotifyData = require( __dirname + '/spotify-data' )
let geocoding = require(__dirname + '/geocoding')

const app = express()

// set up the views engine
app.set('views', './views')
app.set('view engine', 'pug')

// For logged in user start session
// app.use(
// 	express.static( 'static' ),
// 	session ({
// 		secret: 'this is some secret',
// 		resave: true,
// 		saveUninitialized: false
// 	})
// )


/////////////////////////////////////////////////////////////////////////
//-------------------------- LOAD PUG FILES -----------------------------

app.use(express.static(__dirname + '/../static'))

/////////////////////////////////////////////////////////////////////////
//----------------------------- USE ROUTES ------------------------------
app.use('/', spotifyData)
app.use('/', fbData)
app.use('/', geocoding)

/////////////////////////////////////////////////////////////////////////
//---------------------------- START SERVER -----------------------------
app.listen( 8000, () => {
    console.log( "Running on port 8000" )
})
