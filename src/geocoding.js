'use strict'

const express = require ('express')
const session = require ('express-session')
const bodyParser = require('body-parser')
const router = express.Router()
const app = express()

// For logged in user start session
app.use(
	express.static( __dirname + '/../static' ),
	session ({
		secret: 'this is some secret',
		resave: true,
		saveUninitialized: true,
		cookie: {
			secure: false,
			maxage: 3600
		}
	})
)

router.get("/search", (req, res) => {
	let user = req.session.user
	if (user == undefined) {
		res.redirect('/')
	} else {
	  res.render('search', {
			user: req.session.user
		})
	}
})


module.exports = router