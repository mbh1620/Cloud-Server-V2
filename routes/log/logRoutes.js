//Logging routes

var {createLogGroup, createLogRecord, getUsersLogs, getLog} = require('../log/logFunctions')
var express = require('express');
var router = express.Router()

router.get("/logs/home", function(req,res){

    res.render("./Logs/logs-home.ejs");

})

router.get("/logs/usersLogs/", function(req,res){

    var usersLogs = getUsersLogs(req.user)

    res.render("./Logs/logs-multiple-view.ejs", {usersLogs:usersLogs})

})

router.post("/logs/viewLog", function(req, res){

    var logRecords = getLog( req.user, req.body.databaseId)

    res.render("./Logs/logs-view.ejs", {logRecords:logRecords})

})

module.exports.router = router;
