//-----------------------------------------------------------------------
//                          Event Trigger Routes
//-----------------------------------------------------------------------

//Event routes for processing and creating events and triggers

var express = require('express');
const { resourceLimits } = require('worker_threads');
var router = express.Router()
var fs = require("fs-extra");
const { } = require('../event-triggers/eventTriggerFunctions')

router.get("/events/home", function(req,res){
    res.render("./Event-Triggers/eventsHome.ejs");
})

router.get("/events/usersEvents", function(req,res){
    res.render("./Event-Triggers/usersEvents.ejs");
})

router.get("/events/create", function(req,res){
    res.render("./Event-Triggers/createEvent.ejs")
})

router.post("/events/create", function(req,res){

    var eventObject = {
    
        eventName: req.body.eventName,
        eventSource: req.body.eventSource,
        eventDestination: req.body.eventDestination,
    
    }

    //Check to see if a db has been created,
    if(checkDbExists(req.user) == true){
        //putRecord
        putRecord('events',JSON.stringify(eventObject), req.user.name)
    } else {
        
    }
    //put new events record.
})

function checkDbExists(user){
    var tableName = 'events'
    var filePath = testFolder + user.name+"/Database/"+tableName+".json"

    if(fs.existsSync(filePath) == true){
        return true
    } else {
        return false
    }

}

//https://www.w3schools.com/nodejs/nodejs_events.asp

module.exports.router = router;
