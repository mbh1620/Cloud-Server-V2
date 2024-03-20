//IOT Device Routes

var express = require('express');
var router = express.Router();
var createWorkflow = require("../workflow/workflowRoutes").createWorkflow

router.get("/iot/home", function(req, res){
    res.render("./IOT/iot-home.ejs");
})

router.get("/iot/devices/:user", function(req,res){
    res.render("./IOT/iot-devices.ejs");
})

router.get("/iot/create", function(req, res){
    res.render("./IOT/iot-create.ejs")
})

router.post("/iot/create", function(req, res){
    //Code here for creating a new IOT Device
    console.log(req.body)

    var deviceIP

    var scriptContent = `
    #Python Script
    import requests
    ip_Address = ${deviceIP}

    


    `

    createWorkflow('iot-device-'+req.body.deviceName, req.body.deviceSchedule, req.user.name, scriptContent)
    
    /*

    Setup a Workflow Function to connect to the Device that is triggered on the schedule supplied.

    Setup a NoSQL Database to store the Data Received back from the device.

    (Code for the Device will be a server setup that once it is requested, sends data to the 
        main IOT server)

    */
   res.redirect("/iot/devices/" + req.user.userId)

})


module.exports.router = router;