//Crawler routes

//File Crawler and Web Crawler

var express = require('express');
var router = express.Router();
var fs = require("fs-extra");
var pathFunc = require('path')
const {createDatabase, checkDatabaseExists, getDatabaseObjectByName, putRecord, getRecord, getDatabase} = require('../database/databaseFunctions')
const {createFileCrawler, createWebCrawler, getUsersCrawlers, updateCrawler, deleteCrawler, runCrawler, createWebPhotoCrawler} = require("../crawler/crawlerFunctions")

router.get("/crawlers/home", function(req, res){
    res.render("./Crawlers/crawler-home.ejs");
})

router.get("/crawlers/users-crawlers", function(req,res){

    if(checkDatabaseExists(req.user, getDatabaseObjectByName(req.user, 'Crawlers')[0])){

        var crawlers = getUsersCrawlers(req.user)
    
    } else {

        var crawlers = []

    }
    
    res.render("./Crawlers/crawler-user.ejs", {crawlers: crawlers})
    
})

router.get("/crawlers/create", function(req,res){

    res.render("./crawlers/crawler-create.ejs")

})

router.post("/crawlers/create", function(req,res){

    var crawlerObject = {
        'crawlerType':req.body.crawlerType,
        'crawlerName':req.body.crawlerName,
        'startingUrl':req.body.startingUrl,
        'maxNumberOfLevels':req.body.maxNumberOfLevels,
        'outputType':'NA',
        // 'outputType':req.body.outputObject, //Could be Database, file etc..
        'codeBlock':req.body.codeBlock
    }

    var envVars = {
        'PASS':req.body.password
    }

    var args = []

    var workflow;

    if(req.body.crawlerType == 'fileCrawler'){
        workflow = createFileCrawler(req.user, req.body.crawlerName, req.body.startingUrl, req.body.codeBlock)
    } else if(req.body.crawlerType == 'webCrawler'){
        [workflow, database] = createWebCrawler(req.user, req.body.crawlerName, req.body.startingUrl, req.body.codeBlock, envVars)
    } else if(req.body.crawlerType == 'webPhotoCrawler'){
        workflow = createWebPhotoCrawler(req.user, req.body.crawlerName, req.body.startingUrl, req.body.codeBlcok, envVars)
    }

    crawlerObject['workflowId'] = workflow.recordId
    crawlerObject['databaseId'] = database.databaseId

    //Check and create a new database if needed 
    if(checkDatabaseExists(req.user, getDatabaseObjectByName(req.user, 'Crawlers')[0]) == true){

        putRecord(req.user, getDatabaseObjectByName(req.user, 'Crawlers')[0], JSON.stringify(crawlerObject))

    } else {

        var schemaDefinition = {
            'crawlerType': 'string',
            'crawlerName': 'string',
            'startingUrl': 'fileLink',
            'maxNumberOfLevels': 'string',
            'workflowId': 'string', //This could be a query link to the workflow object
            'databaseId': 'string',
            'outputType':'string',            
            'codeBlock': 'string'
        }

        createDatabase(req.user, 'Crawlers', schemaDefinition)

        putRecord(req.user, getDatabaseObjectByName(req.user, 'Crawlers')[0], JSON.stringify(crawlerObject))

    }

    res.redirect("/crawlers/users-crawlers");

})

router.post("/crawlers/run", function(req,res){

    runCrawler(req.user, req.body.crawlerName)

    res.send(200)

})

router.get("/crawlers/edit/:crawlerId", function(req, res){

    var crawler = getRecord(req.user, getDatabaseObjectByName(req.user, 'Crawlers')[0], 'recordId', req.params.crawlerId)[0]

    res.render("./Crawlers/crawler-edit.ejs", {crawler:crawler})

})

router.post("/crawlers/edit/", function(req,res){

    var crawlerObject = {
        'crawlerType':req.body.crawlerType,
        'crawlerName':req.body.crawlerName,
        'startingUrl':req.body.startingUrl,
        'maxNumberOfLevels':req.body.maxNumberOfLevels,
        // 'outputType':req.body.outputType,
        'outputType':req.body.outputObject, //Could be Database, file etc..
        'codeBlock':req.body.codeBlock,
        'recordId':req.body.crawlerId
    }

    updateCrawler(req.user,req.body.crawlerId, crawlerObject)
    
    res.redirect("/crawlers/users-crawlers");
})

router.post("/crawlers/delete", function(req, res){

    deleteCrawler(req.user, req.body.crawlerId)

    res.send(200)

})

module.exports.router = router;