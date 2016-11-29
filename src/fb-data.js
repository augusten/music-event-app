'use strict'

/////////////////////////////////////////////////////////////////////////
//------------------------ MODULES AND VARIABLES ------------------------

// NPM modules
const express = require( 'express' )
const request = require( 'request' )
const Sequelize = require ('sequelize')
const pg = require( 'pg' )
const session = require ('express-session')

// Create the Express objects
const app = express()
const router = express.Router()

// Using the facebook events by location module based on the example in https://github.com/tobilg/facebook-events-by-location/blob/master/README.md
const EventSearch = require("facebook-events-by-location-core")

// Environment variables used
let accToken = process.env.FEBL_ACCESS_TOKEN
let connectionString = 'postgres://' + process.env.POSTGRES_USER + ':' + process.env.POSTGRES_PASSWORD + '@localhost/' + process.env.POSTGRES_SPOTFB

/////////////////////////////////////////////////////////////////////////
// ------------------------- CREATE DATABASES USED ----------------------

// connect to database
let db = new Sequelize( process.env.POSTGRES_SPOTFB, process.env.POSTGRES_USER , process.env.POSTGRES_PASSWORD, {
    server: 'localhost',
    dialect: 'postgres'
})

// Define the models of the database
let Fb_event = db.define( 'fb_event', {
    event_url: Sequelize.STRING,
    e_name: Sequelize.STRING,
    city: Sequelize.STRING,
    venue: Sequelize.STRING,
    latitude: Sequelize.STRING,
    longitude: Sequelize.STRING,
    coverphoto: Sequelize.STRING
})

let User = db.define( 'user', {
    user_id: Sequelize.STRING,
    name: Sequelize.STRING,
    email: Sequelize.STRING,
    list_artists: Sequelize.ARRAY(Sequelize.STRING)
})

let UserProject = db.define('user_project', {
  role: Sequelize.STRING
});

// Define database relations
User.hasMany( Fb_event )
Fb_event.belongsToMany( User, { through: UserProject } )

// variables of Amsterdam coordinates for development stage until we add the possibility to choose the city, and thus, the longitude and latitude
// let lat 
// let lng  

/////////////////////////////////////////////////////////////////////////
//------------------------------ ROUTES ---------------------------------

// route that redirects to search results
router.get("/searchevent", (req, res) => {
    let user = req.session.user
    res.redirect('/events?' + "lat=" + req.query.latitude + "&lng=" + req.query.longitude + "&distance=10000&sort=venue&accessToken=" + accToken )
})

// Main route for search
router.get("/events", function(req, res) {
    let usr = req.session.user.user_id
    let eventList = []

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
            // find user 


            // pg.connect( connectionString, (err, client, done ) => {
            //     if ( err ) throw err
            //     let queryText = "select * from users"
            //     client.query( queryText, ( err, result ) => {
            //         if ( err ) throw err
            //         done()
            //         pg.end()
            //         console.log( result.rows )
            //     })
            // })
            User.findOne({
                where: {user_id: req.session.user.user_id}
            })
            .then ( usr => {
                for (var i = events.events.length - 1; i >= 0; i--) {
                    for (var j = usr.list_artists.length - 1; j >= 0; j--) {
                        // console.log( events.events[i].name.toLowerCase() )
                        if ( events.events[i].name.toLowerCase().indexOf( usr.list_artists[j].toLowerCase() + ' ') !== -1 ) {

                            // console.log( usr.list_artists[j] )
                            eventList.push(events.events[i].name)
                            Fb_event.findOne({
                                where: {event_url:'https://www.facebook.com/events/' + events.events[i].id}
                            }).then ( ev => {
                                if ( ev === null ) {
                                    Fb_event.create( {
                                        event_url: 'https://www.facebook.com/events/' + events.events[i].id,
                                        e_name: events.events[i].name,
                                        city: events.events[i].venue.location.city,
                                        venue: events.events[i].venue.name,
                                        latitude: events.events[i].venue.location.latitude,
                                        longitude: events.events[i].venue.location.longitude,
                                        coverphoto: events.events[i].coverPicture
                                    })
                                    .then( evn => {
                                        evn.addUser( usr )
                                    })                              
                                } else {
                                    ev.addUser ( usr )
                                }
                            })
                        }
                    }
                }
            })
            .then( () => {
                res.send( 'results' )
            })
        }).catch(function (error) {
            res.status(500).json(error)
        })
        
    }

})

/////////////////////////////////////////////////////////////////////////
// ------------------------- SYNC DATABASE ------------------------

// db.sync( {force: true} ).then( db => {
//  console.log( 'Synced' )

//  // Create 1 demo event
//     Fb_event.create( {
//         event_url: 'https://www.facebook.com/events/' + '1667110543580518',
//         e_name: 'LIVE: Psichodelinis Šuo + Lukas Norkūnas',
//         city: 'Vilnius',
//         venue: 'Liverpool Indie/Rock Bar',
//         latitude: '54.6872',
//         longitude: '25.2797',
//     })
// })

db.sync()

/////////////////////////////////////////////////////////////////////////
// ------------------------- EXPORT ROUTES ------------------------

module.exports = router