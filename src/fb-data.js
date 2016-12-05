'use strict'

/////////////////////////////////////////////////////////////////////////
//------------------------ MODULES AND VARIABLES ------------------------

// NPM modules
const express = require( 'express' )
const request = require( 'request' )
const Sequelize = require ('sequelize')
const pg = require( 'pg' )
const session = require ('express-session')
const fs = require('fs')

// Create the Express objects
const app = express()
const router = express.Router()

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

// Using the facebook events by location module based on the example in https://github.com/tobilg/facebook-events-by-location/blob/master/README.md
const EventSearch = require("facebook-events-by-location-core")

// Environment variables used
let accToken = process.env.FEBL_ACCESS_TOKEN
let connectionString = 'postgres://' + process.env.POSTGRES_USER + ':' + process.env.POSTGRES_PASSWORD + '@localhost/' + process.env.POSTGRES_SPOTFB
let eventList = []
let strict_filter = 'off'
// let popular_words = ['Jaar', 'R&B', 'music', 'jazz', 'electronic']

// preload strict filtering buzzwords 
let popular_words
fs.readFile( __dirname + '/../static/genres/genres.json', 'utf8', ( err, data ) => {
    popular_words = JSON.parse(data)[0]["buzzwords"]
})

/////////////////////////////////////////////////////////////////////////
// ------------------------- CREATE DATABASES USED ----------------------

// connect to database
let db = new Sequelize( process.env.POSTGRES_SPOTFB, process.env.POSTGRES_USER , process.env.POSTGRES_PASSWORD, {
    server: 'localhost',
    dialect: 'postgres'
})

// Define the modelsof the database

let User = db.define( 'user', {
    user_id: Sequelize.STRING,
    name: Sequelize.STRING,
    email: Sequelize.STRING,
    list_artists: Sequelize.ARRAY(Sequelize.STRING),
    photo: Sequelize.STRING
})

/////////////////////////////////////////////////////////////////////////
//------------------------------ ROUTES ---------------------------------

// route that redirects to search results
router.get("/searchevent", (req, res) => {
    let user = req.session.user
    console.log(req.query.latitude)
    res.redirect('/events?' + "lat=" + req.query.latitude + "&lng=" + req.query.longitude + "&distance=10000&sort=venue&accessToken=" + accToken )
})

// Main route for search
router.get("/events", function(req, res) {

    let usr = req.session.user.user_id

    if (!req.query.lat || !req.query.lng) {
        res.status(500).json({message: "Specify the lat and lng parameters"})
    } else if (!req.query.accessToken && !process.env.FEBL_ACCESS_TOKEN) {
        res.status(500).json({message: "Specify an Access Token"})
    } else {

        var options = {};

        // Add latitude
        if (req.query.lat) {
            options.lat = req.query.lat
        }
        if (req.query.lng) {
            options.lng = req.query.lng
        }
        if (req.query.distance) {
            options.distance = req.query.distance
        }
        if (req.query.accessToken) {
            options.accessToken = req.query.accessToken
        } else {
            options.accessToken = process.env.FEBL_ACCESS_TOKEN || null
        }
        if (req.query.query) {
            options.query = req.query.query
        }
        if (req.query.sort) {
            options.sort = req.query.sort
        }
        if (req.query.version) {
            options.version = req.query.version
        }
        if (req.query.since) {
            options.since = req.query.since
        }
        if (req.query.until) {
            options.until = req.query.until
        }

        // Instantiate EventSearch
        var es = new EventSearch(options)

        // Search and handle results
        es.search().then(function (events) {
            // find user to find events based on their listening tastes
            User.findOne({
                where: {user_id: req.session.user.user_id}
            })
            .then ( usr => {
                eventList = []
                for (var i = events.events.length - 1; i >= 0; i--) {

                    for (var j = usr.list_artists.length - 1; j >= 0; j--) {


                        if (strict_filter === 'on' && events.events[i].description !== null) {
                            for (var k = popular_words.length - 1; k >= 0; k--) {
                                if ( events.events[i].name.toLowerCase().indexOf( usr.list_artists[j].toLowerCase() + ' ') !== -1 && events.events[i].description.indexOf( popular_words[k] ) !==-1 ) {
                                    // find the events for the user
                                    eventList.push(events.events[i])
                                }
                            }
                            
                        } else if (strict_filter === 'off' && events.events[i].description !== null) {
                            if ( events.events[i].name.toLowerCase().indexOf( usr.list_artists[j].toLowerCase() + ' ') !== -1 ) {
                                // find the events for the user
                                eventList.push(events.events[i])
                            }
                        }
                    }
                }
        }).then( () => {
            res.redirect( '/darezult' )
            })
        }).catch(function (error) {
            res.status(500).json(error)
        })
        
    }

})

router.get( '/darezult', ( req, res ) => {
     //console.log( Object.keys(req) )
//     console.log("this is ETFKJFFDKHFJDSFHDSK THE EVENT LIST")
//     console.log( eventList )
    res.send(eventList)
})


/////////////////////////////////////////////////////////////////////////
// ------------------------- SYNC DATABASE ------------------------

db.sync()

/////////////////////////////////////////////////////////////////////////
// ------------------------- EXPORT ROUTES ------------------------

module.exports = router