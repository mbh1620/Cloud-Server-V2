//-----------------------------------------------------------------------
//                          Workflow Routes
//-----------------------------------------------------------------------

var schedule = require('node-schedule')
var express = require('express');
var router = express.Router()
var fs = require('fs-extra')
var { PythonShell } = require('python-shell')
var pathFunc = require('path')
var {createLogRecord} = require('../log/logFunctions')
var {deleteWorkflow, cancelJobFromSchedule, createWorkflow, 
    getUsersNotebooks, createNewNotebook, getNotebookData, getUsersScheduledFunctions, 
    getWorkflowLastStatus,
    resheduleJob} = require('./workflowFunctions');
const { getRecord, getRecords, getDatabaseObjectByName, checkDatabaseExists } = require('../database/databaseFunctions');

router.get("/workflow-home", function (req, res) {
    res.render("workflowpage.ejs");
})

router.get("/usersworkflows/:user", function (req, res) {

    if(checkDatabaseExists(req.user, getDatabaseObjectByName(req.user, 'Workflows')[0])){

        var workflows = getRecords(req.user, getDatabaseObjectByName(req.user, 'Workflows')[0])
    
    } else {

        var workflows = []

    }
    
    res.render("usersworkflowpage.ejs", { workflows: workflows });

})

router.get("/workflows/scheduled", function(req,res){

    var scheduledWorkflows = getUsersScheduledFunctions(req.user)
    
    res.render("./Workflows/workflows-scheduled.ejs", {scheduledWorkflows:scheduledWorkflows})

})

router.get("/workflows/create", function (req, res) {
    res.render("workflowscreate.ejs");
})

router.post("/workflows/delete", function (req, res){
    var user = req.user
    var workflowId = req.body.workflowId

    // createLogRecord(user, {
    //     Name: workflowName + "-WORKFLOW-LOG",
    //     status: "SUCCESS",
    //     type:'DELETE'
    // }, "Workflow")

    deleteWorkflow(user, workflowId)

    res.sendStatus(200)
})

router.post("/workflow/cancelSchedule", function(req,res){
    var user = req.body.user;
    var jobName = req.body.jobName;
    
    cancelJobFromSchedule(user, jobName);
    res.send(200)
})

router.post("/workflow/reSchedule", function(req,res){
    var user = req.body.user;
    var jobName = req.body.jobName;
    
    resheduleJob(user.name, jobName)
    res.send(200)
})

router.get("/usersworkflows/:user/show/:workflowId", function (req, res) {
    
    var workflow = getRecord(req.user,getDatabaseObjectByName(req.user, 'Workflows')[0], 'recordId', req.params.workflowId)[0]

    console.log(workflow)

    var workflowData = fs.readFileSync(pathFunc.join(testFolder,workflow.workflowFilePath), 'utf-8')
    
    res.render("workflowsedit.ejs", { data: workflowData, workflow: workflow })

})

router.post("/workflows/save", function (req, res) {

    var envVar = JSON.parse(req.body.envVars)
    var args = []

    createWorkflow(req.body.name, req.body.schedule, req.user, envVar, args, req.body.content)

    res.send(
        200
    )
})

router.get("/workflows/serverlessAPI/:workflowName", function(req, res){

    

})

router.get("/notebooks/showNotebooks", function(req,res){

    //Get the users Notebooks

    var user = req.user

    var notebooks = getUsersNotebooks(user)

    res.render("./Workflows/notebooks-user.ejs", {notebooks: notebooks})

})

router.get("/notebooks/create", function(req,res){

    //Route for displaying the form for creating a new notebook

    res.render("./Workflows/notebooks-create.ejs")

})

router.post("/notebooks/create", function(req,res){
    //Route for creating the new notebook
    var user = req.user

    var notebookName = req.body.notebookName

    createNewNotebook(user, notebookName)

    res.redirect('/notebooks/showNotebooks')

})

router.post("/notebooks/run", function(req,res){

    //Route for actually editing and running the notebook

    //Parse the notebook.json data

    var user = req.user

    var notebookName = req.body.notebookName

    console.log(notebookName)

    var notebookData = getNotebookData(user, notebookName)

    res.render("./Workflows/notebooks-run.ejs", {notebookData: notebookData})
})

router.post("/notebook/runCell", function(req,res){

    //Get the content from the cell

    var cellContent = req.body.cellContent

    var shell = new PythonShell(cellContent, {

    //Shell configs   

    })

    var output = {message:[]}

    var timeStarted = Date.now()

    shell.on('message', function(message){

        //Add messages to the message object

    })

    shell.end(function (err){

        if(err){

            output.status == "Failed"
            output.err = err

        } else {

            output.status == "Success"
        
        }

        res.send(output)

        res.status(200)

    })

})


router.post("/workflows/test", function(req, res){

    var workflowId = req.body.workflowId

    console.log(workflowId)
    
    var workflow = getRecord(req.user, getDatabaseObjectByName(req.user, 'Workflows')[0], 'recordId', workflowId)[0]

    var workflowFilePath = pathFunc.join(testFolder, workflow.workflowFilePath)

    var output = {message:[]}
    var timeStarted = Date.now()

    for(var i = 0; i < Object.keys(workflow['workflowEnvs']).length; i++){

        process.env[Object.keys(workflow['workflowEnvs'])[i]] = workflow['workflowEnvs'][Object.keys(workflow['workflowEnvs'])[i]]

    }
    
    var shell = new PythonShell(workflowFilePath, {
        env: process.env,
        args: workflow['args'],
        timeout: workflow['workflowTimeout']
    })

    shell.on('message', function (message) {

        console.log(message)
        output.message.push(message)

    })

    shell.end(function (err) {
        if (err) {
            console.log(err)
            output.status = "Failed"
            output.err = err
            console.log(output)
            createLogRecord(user, {
                Name: workflowParsed.name + "-WORKFLOW-LOG",
                status: "FAILED",
                type: "RUN",
                output: output
            }, 'Workflow')
            res.send(output)
        } else {
            output.status = "Success"
            var timeFinished = Date.now()
            var timeTaken = timeFinished - timeStarted
            output.timetoExecute =  timeTaken.toString() + " milliseconds"
            console.log(output)
            // createLogRecord(user, {
            //     Name: workflowParsed.name + "-WORKFLOW-LOG",
            //     status: "SUCCESS",
            //     type: "RUN",
            //     output: output
            // }, 'Workflow')
            res.send(output)
            res.status(200)
        }
    })
})

module.exports.router = router;