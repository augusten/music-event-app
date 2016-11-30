/////////////////////////////////////////////////////////////////////////
//------------------------ MODULES AND VARIABLES ------------------------

// NPM modules
const express = require("express")
// Create the Express objects
const app = express()
const router = express.Router()

// Using the facebook events by location module based on the example in https://github.com/tobilg/facebook-events-by-location/blob/master/README.md
const EventSearch = require("facebook-events-by-location-core")

// Environment variables used
let accToken = process.env.FEBL_ACCESS_TOKEN

// variables of Amsterdam coordinates for development stage until we add the possibility to choose the city, and thus, the longitude and latitude
let lat = 52.379189
let lng = 4.8952

/////////////////////////////////////////////////////////////////////////
//------------------------------ ROUTES ---------------------------------

// route that redirects to search results
router.get("/searchevent", (req, res) => {
    res.redirect('/events?' + "lat=" + lat + "&lng=" + lng + "&distance=10000&sort=venue&accessToken=" + accToken )
})

// Main route for search
router.get("/events", function(req, res) {

    if (!req.query.lat || !req.query.lng) {
        res.status(500).json({message: "Specify the lat and lng parameters"});
    } else if (!req.query.accessToken && !process.env.FEBL_ACCESS_TOKEN) {
        res.status(500).json({message: "Specify an Access Token"});
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
            // res.send(JSON.strigify(events))
            // console.log(typeof(events))
            // console.log(json(events))
            // console.log( events.events[0] )
            console.log( events.events.length )
            // console.log( Object.keys(events) )
            // res.render( 'search' )
            res.json(events)
        }).catch(function (error) {
            res.status(500).json(error)
        })
        
    }

})

/////////////////////////////////////////////////////////////////////////
// ------------------------- EXPORT ROUTES ------------------------

module.exports = router