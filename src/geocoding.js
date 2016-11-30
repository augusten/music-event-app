'use strict'

const express = require ('express')
const session = require ('express-session')
const bodyParser = require('body-parser')
const router = express.Router()
const app = express()


router.get("/search", (req, res) => {
  res.render('search')
})


module.exports = router