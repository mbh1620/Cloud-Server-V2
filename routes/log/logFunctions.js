//-----------------------------------------------------------------------
//                          Log Functions 
//-----------------------------------------------------------------------

var pathFunc = require("path")
var fs = require('fs-extra')
var {getUsersDatabases, getRecords, getRecord, putRecord, createDatabase, getDatabaseObjectByName} = require('../database/databaseFunctions')
var {storageLogSchema, workflowLogSchema, databaseLogSchema} = require('./logSchemas')

function createLogGroup(user, service){

    var schemaDefinition;

    switch(service){

        case 'Storage':
            schemaDefinition = storageLogSchema;
            break;
        case 'Workflow':
            schemaDefinition = workflowLogSchema;
            break;
        case 'Database':
            schemaDefinition = databaseLogSchema;
            break;
        default:
            break

    }    

    createDatabase(user, `Log-${service}`, schemaDefinition)

}

function createLogRecord(user, logObject, service){
    
    var tableName = 'Log-'+service

    var date = new Date()
    var timeStamp = date.getHours() + ":" + date.getMinutes() + ":" + date.getSeconds()
    
    logObject['timeStamp'] = timeStamp
    
    var logObjectString = JSON.stringify(logObject)
    var filePath = pathFunc.join(testFolder, user.name, "Database", tableName+".json")
    
    if (fs.existsSync(filePath) == true){
        
        putRecord(tableName, logObjectString, user)

    } else {
        
        createLogGroup(user, service, logObject)
        putRecord(tableName, logObjectString, user)

    } 
}

function getUsersLogs(user){

    var usersDatabases = getUsersDatabases(user)
    var Logs = []

    for(var i = 0; i < usersDatabases.length; i++){

        if(usersDatabases[i].dbName.split('-')[0] == "Log"){

            Logs.push(usersDatabases[i])

        }
    }

    return Logs;

}

function getLog(user, logRecordId){

    var databaseObject = getRecord(user, getDatabaseObjectByName(user, 'BASEDB')[0], 'databaseId', logRecordId)[0]

    var records = getRecords(user, databaseObject)

    return records
}

module.exports = {createLogRecord, createLogGroup, getUsersLogs, getLog};