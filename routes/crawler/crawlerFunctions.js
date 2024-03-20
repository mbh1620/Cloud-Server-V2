
var {createWorkflow, deleteWorkflow} = require('../workflow/workflowFunctions')
const {getRecords, getDatabaseObjectByName, updateRecord, createDatabase, deleteRecord, deleteDatabase, getRecord, getDatabase} = require('../database/databaseFunctions')

var {run, }  = require('../workflow/workflowFunctions')
var fs = require('fs-extra');

function createFileCrawler(user, crawlerName, userStartingUrl, userElementCustomisation){

    var scriptContent = eval(fs.readFileSync('./routes/crawler/webCrawlerScript.py', 'utf-8'))

    createWorkflow('.crawler-'+crawlerName, '', user, scriptContent) 

}

function createWebCrawler(user, crawlerName, startingURL, userElementCustomization, environmentVariables={}, arguments=[]){

    var scriptContent = eval(fs.readFileSync('./routes/crawler/webCrawlerScript.py', 'utf8'))

    var workflow = createWorkflow('crawler-'+crawlerName, '', user, environmentVariables, arguments, scriptContent)

    var schemaDefinition = {
    
        'webLink':'fileLink',
        'linkLevel':'string'

    }

    var database = createDatabase(user, 'crawlerDB-'+crawlerName, schemaDefinition)

    return [workflow, database]

}

function createWebPhotoCrawler(user, crawlerName, startingURL, userElementCustomization, environmentVariables={}, args=[]){
    
    var envVars;
    var arguments;
        
    var scriptContent = eval(fs.readFileSync('./routes/crawler/webPhotoCrawlerScript.py', 'utf8'))
    
    createWorkflow('crawler-'+crawlerName, '', user, envVars, arguments, scriptContent)
    
    //If create database or connect database is selected then perform required actions
    
    var schemaDefinition = {
        
        'webLink':'photo',
        'linkLevel':'string'
    
    }
    
    createDatabase(user, 'crawlerDB-'+crawlerName, schemaDefinition)
    
}

//Get all crawlers for user and display in crawlers

function getUsersCrawlers(user){

    return getRecords(user, getDatabaseObjectByName(user, 'Crawlers')[0]);

}

//Run Crawler

function runCrawler(user, crawlerName){

    run(user, crawlerName);

}

//Update Crawler

function updateCrawler(user, crawlerId, newCrawlerConfiguration){

    updateRecord(user, getDatabaseObjectByName(user, 'Crawlers')[0], crawlerId, newCrawlerConfiguration)

}

//Delete Crawler

function deleteCrawler(user, crawlerId){

    var crawlerObject = getRecord(user, getDatabaseObjectByName(user, 'Crawlers')[0], 'recordId', crawlerId)[0]

    deleteRecord(user, getDatabaseObjectByName(user, 'Crawlers')[0], crawlerId)

    deleteWorkflow(user, crawlerObject.workflowId)

    var databaseObject = {
        databaseId: crawlerObject.databaseId
    }

    deleteDatabase(user, getDatabase(user, databaseObject)) 

}

module.exports = {createFileCrawler, createWebCrawler, createWebPhotoCrawler, getUsersCrawlers, runCrawler, updateCrawler, deleteCrawler}
