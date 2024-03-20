
//-----------------------------------------------------------------------
//                          Workflow Functions 
//-----------------------------------------------------------------------

var schedule = require('node-schedule')
var {createDatabase, putRecord, getRecord, updateRecord, getRecordContaining, deleteRecord, getDatabaseObjectByName, checkDatabaseExists, getDatabase} = require('../database/databaseFunctions')
var fs = require('fs-extra')
var { PythonShell } = require('python-shell')
var {createLogRecord} = require('../log/logFunctions')
var pathFunc = require("path")
const { get } = require('systeminformation')

function addScheduledWorkflowFromFile() {
    for (var i = 0; i < users.length-1; i++) {

        var fullPath = pathFunc.join(testFolder, users[i].name, 'Workflows')

        var workflows = fs.readdirSync(fullPath)
        if (workflows.includes("workflow.json") == true) {
            var data = JSON.parse(fs.readFileSync(testFolder + users[i].name + "/" + "Workflows/workflow.json"))
            for (var z = 0; z < data.workflows.length; z++) {
                if (data.workflows[i].Schedule != "" || data.workflows[i].Schedule != 0) {
                    addScheduledWorkflow(testFolder + users[i].name + "/" + "Workflows/" + data.workflows[i].name, data.workflows[i].Schedule, users[i].name, data.workflows[i].name)
                }
            }
        }
    }
}

function startScheduleForWorkflow(user, workflowObject){

    //Add workflow schedule manually

    var scheduleString = `*/${workflowObject.schedule} * * * *`

    var workflowPath = pathFunc.join(testFolder, workflowObject.workflowFilePath)

    //Get EnvVars for function

    var workflow = getRecord(user, getDatabaseObjectByName(user, 'Workflows')[0], 'recordId', workflowObject.recordId)

    for(var i = 0; i < Object.keys(workflow[0]['workflowEnvs']).length; i++){

        process.env[Object.keys(workflow[0]['workflowEnvs'])[i]] = workflow[0]['workflowEnvs'][Object.keys(workflow[0]['workflowEnvs'])[i]]

    }

    var scheduledFunction = new schedule.scheduleJob(scheduleString, function(){

        var consoleOutput = []

        var shell = new PythonShell(workflowPath, {
            env: process.env,
            args: workflow['args'],
        })

        shell.on('message', function (message) {
            //This is the equivalent to the console log of the script. Might be handy to append this to the logs too.
            consoleOutput.push(message)
        })

        shell.end(function (err) {
            if (err){
                //Need to update or put a record in the logs with the error
                consoleOutput.push(err)
                status = 'FAILED'
                
            } else {
                //Put in a record to the workflow logs with the output
                status = 'SUCCESS'


            }
            
            console.log(consoleOutput)

            // createLogRecord(user, {
            //     Name: workflowName+'-[SCHEDULED]-WORKFLOW-LOG',
            //     lastStatus: "",
            //     consoleOutput: consoleOutput,
            //     status: status,
            //     type: 'RUN'
            // }, 'Workflow')

        })

    })

    scheduledFunction.user = {
        id:user.id
    }

    scheduledFunction.jobName = user.name + "-" + workflowObject.workflowName;
    scheduledFunction.workflowName = workflowObject.workflowName
    scheduledFunction.scheduled = workflowObject.schedule
    scheduledWorkflows.push(scheduledFunction)

}

function getUsersScheduledFunctions(user){

    //return users scheduled functions

    var usersScheduledFunctions = []

    for(var i = 0; i < scheduledWorkflows.length; i++){
        if(scheduledWorkflows[i].user.id == user.id){
            usersScheduledFunctions.push(scheduledWorkflows[i])
        }
    }

    return usersScheduledFunctions
}

function createWorkflow(fileName, schedule, user, workflowEnvironmentVariables, workflowArguments, content){
    
    var workflowObject = {
        'workflowName': fileName,
        'workflowEnvs': workflowEnvironmentVariables,
        'workflowArgs': workflowArguments,
        'workflowTimeout': '60',
        'workflowLanguage': 'Python',
        'workflowFilePath': pathFunc.join( user.name, 'Workflows', fileName),
        'schedule':schedule
    }

    var workflow = createWorkflowJson(user, workflowObject)

    createWorkflowScript(user.name, fileName, content)

    checkAndAddSchedule(user, workflow)

    // createLogRecord(user, {
    //     Name: fileName+'-WORKFLOW-LOG',
    //     lastStatus: "",
    //     schedule: schedule,
    //     status: 'SUCCESS',
    //     type: 'CREATE'
    // }, 'Workflow')

    return workflow

}

function createWorkflowJson(user, workflowObject){

    var outputWorkflowObject;
        
    if(checkDatabaseExists(user, getDatabaseObjectByName(user, 'Workflows')[0])){
        
        var workflowDatabase = getDatabaseObjectByName(user, 'Workflows')[0]
        outputWorkflowObject = putRecord(user, workflowDatabase, JSON.stringify(workflowObject))
        
    } else {

        var schemaDefinition = {
            'workflowName': 'string',
            'workflowEnvs': 'object',
            'workflowArgs': 'object',
            'workflowTimeout': 'string',
            'workflowLanguage': 'string',
            'workflowFilePath':'fileLink',
            'schedule':'string'
        }

        createDatabase(user, 'Workflows', schemaDefinition)

        var workflowDatabase = getDatabaseObjectByName(user, 'Workflows')[0]
        outputWorkflowObject = putRecord(user, workflowDatabase, JSON.stringify(workflowObject))

    }

    return outputWorkflowObject;
}

function checkAndAddSchedule(user, workflowObject){

    if (schedule != "" && schedule != 0 && typeof schedule !== 'undefined') {
        
        var fullPath = pathFunc.join(testFolder, workflowObject.workflowFilePath)

        startScheduleForWorkflow(user, workflowObject)

        console.log("Adding Schedule")
    }
}

function createWorkflowScript(user, fileName, content){
    
    fs.writeFileSync(testFolder + user + "/" + "Workflows/" + fileName, content);

}

function cancelJobFromSchedule(userName, jobName){

    // console.log(userName + "-" + jobName)

    var job = scheduledWorkflows.find(item => item.jobName === userName + "-" + jobName);
    var index = scheduledWorkflows.findIndex(item => item.jobName === userName + "-" + jobName);
        
    job.cancel();
    job.deleteFromSchedule();

    scheduledWorkflows.splice(index, 1)    
}

function resheduleJob(userName, jobName){

    var job = scheduledWorkflows.find(item => item.jobName === userName + "-" + jobName);

    console.log(scheduledWorkflows);
    
    job.resheduleJob(`*/${scheduleTime} * * * *`);

}

function deleteWorkflow(user, workflowId){

    var workflow = getRecord(user, getDatabaseObjectByName(user, 'Workflows')[0], 'recordId', workflowId)

    let obj = scheduledWorkflows.find((o, i) => {
        if(o.jobName == user.name + "-" + workflow.workflowName){
            scheduledWorkflows.splice(i)
            schedule.cancelJob(o.name)
        }
    })

    deleteRecord(user, getDatabaseObjectByName(user, 'Workflows')[0], workflowId)

    fs.removeSync(testFolder + "/" + user.name + "/Workflows/" + workflow.workflowName)

}

function run(user, workflowId){

    var workflow = getRecord(user, getDatabaseObjectByName(user, 'Workflows')[0], 'recordId', workflowId)

    var filePath = pathFunc.join(testFolder, workflow.workflowFilePath)

    var output;

    PythonShell.run(filePath, options, function(messages){
        console.log('results: %j', results);
        output = results;
    })

    return output;

}

function getUsersNotebooks(user){

    fullPath = pathFunc.join(testFolder, user.name, "Notebooks")
    var Notebooks = fs.readdirSync(fullPath);

    return Notebooks

}

function createNewNotebook(user, notebookName){

    //Note book is a JSON file which is used to contain the text, and code etc..

    //To create the notebook only the name is needed to create the file in the directory

    var fullPath = pathFunc.join(testFolder, user.name, "Notebooks", notebookName + ".json")

    fs.createFileSync(fullPath)

    fs.writeFileSync(fullPath, '{"notebookData":{"notebookName":"'+ notebookName +'"}}')

}

function getNotebookData(user, notebookName){

    var fullPath = pathFunc.join(testFolder, user.name, "Notebooks", notebookName)

    var data = JSON.parse(fs.readFileSync(fullPath))

    return data

}

function getWorkflowLastStatus(user, workflowName){ //Remove this in a later update

    //Get the last RUN item in the log for the workflow and return

    var record = getRecordContaining(user.name, 'Log-Workflow', 'Name', workflowName)

    if(record.length > 0){

        var lastRecord = record.slice(-1)

        outputObject = {
            status: lastRecord[0].status,
            timeStamp: lastRecord[0].timeStamp
        }

    } else {

        outputObject = {
            status: '',
            timeStamp: ''
        }

    }

   

    return outputObject

}

module.exports = {addScheduledWorkflowFromFile, startScheduleForWorkflow, getUsersScheduledFunctions, createWorkflow, createWorkflowJson,
     checkAndAddSchedule, createWorkflowScript, cancelJobFromSchedule, resheduleJob, deleteWorkflow, run,
    getUsersNotebooks, createNewNotebook, getNotebookData, getWorkflowLastStatus}