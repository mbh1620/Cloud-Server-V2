
//-----------------------------------------------------------------------
//                         Data streaming routes
//-----------------------------------------------------------------------

var express = require('express')
var router = express.Router()
var {getUsersStreams} = require('./streamingFunctions')

router.get('/data-streaming/home', function(req, res){

    res.render("./Data-Streaming/streaming-home.ejs")

})

router.get('/data-streaming/usersStreams', function(req,res){

    var usersStreams = getUsersStreams(req.user) //Active and non-active streams (stored in a database)

    res.render("./Data-Streaming/users-streams.ejs", {usersStreams: usersStreams})

})

module.exports.router = router