var express = require('express');
var router = express.Router();
var{createDatabase, putRecord, getRecords, 
    getRecord, deleteRecord, getUsersDatabases, getDatabaseObjectByName, checkDatabaseExists, updateRecord, getDatabase} = require('../database/databaseFunctions');
var fs = require('fs');

//https://stackoverflow.com/questions/43015854/large-dataset-of-markers-or-dots-in-leaflet

router.get("/chart/home", function(req,res){
    res.render("./Chart/chart-home.ejs");
})

router.get("/chart/create/", function(req,res){

    var usersDatabases = getUsersDatabases(req.user)
    res.render("./Chart/map-create.ejs", {usersDatabases: usersDatabases});

})

router.get("/chart/create2/", function(req,res){

    var usersDatabases = getUsersDatabases(req.user)
    res.render("./Chart/chart-create.ejs", {usersDatabases: usersDatabases});

})

router.get("/chart/createTable/", function(req,res){

    var usersDatabases = getUsersDatabases(req.user)
    res.render("./Chart/table-create.ejs", {usersDatabases: usersDatabases});
    
})

router.post("/chart/create/", function(req,res){

    if(checkDatabaseExists(req.user, getDatabaseObjectByName(req.user, 'Charts')[0])){
        
    } else {
    
        var schema = {

            "chartName":"string",
            "chartType":"string",
            "dataSource":"string",
            "dataBase":"string",
            "plotType":"string",
            "xAxis":"string",
            "yAxis":"string",
            "datasetQueries":"object",
            // "queryField":"string",
            // "queryType":"string",
            // "queryString":"string",
            // "queryLower":"string",
            // "queryUpper":"string",
            "mapLayer":"string",
            "latitude":"string",
            "longitude":"string",
            "photoUrlField":"string",
            "popupDisplayField":"string"
    
        }

        createDatabase(req.user, 'Charts', schema);
    }

    var chartsDatabase = getDatabaseObjectByName(req.user, 'Charts')[0]

    putRecord(req.user, chartsDatabase, req.body.config)

    res.sendStatus(200);
})

router.get("/chart/viewAll/", function(req,res){
    
    if(checkIfFileExists(testFolder+req.user.name+"/Database/Charts.json")){

        var charts = getRecords(req.user, getDatabaseObjectByName(req.user, 'Charts')[0])

    } else {
        var charts = []
    }

    res.render("./Chart/chart-view-all.ejs", {charts: charts})

})

router.post("/chart/getCharts", function(req,res){

    if(checkIfFileExists(testFolder+"/"+req.user.name+"/Database/Charts.json")){
        
        var charts = getRecords(req.user, getDatabaseObjectByName(req.user, 'Charts')[0])

    } else {
        var charts = []
    }

    res.send(charts)

})

router.post("/chart/getConfig", function(req, res){

    var chartConfig = getRecord(req.user, getDatabaseObjectByName(req.user, 'Charts')[0], 'recordId', req.body.chartId)

    res.send(chartConfig[0])

})

router.get("/chart/:id/view/:user", function(req,res){

    var chart = getRecord(req.user, getDatabaseObjectByName(req.user, 'Charts')[0], 'recordId', req.params.id)
    
    res.render("./Chart/chart-view.ejs", {chart:chart[0]})

})

router.delete("/chart/:id/delete/:user", function(req,res){

    deleteRecord(req.user, getDatabaseObjectByName(req.user, 'Charts')[0], req.params.id)

    res.sendStatus(200)
})

//Dashboard routes

router.get("/dashboard/create", function(req,res){

    //Get users charts from the charts database
    res.render("./Chart/dashboard-create.ejs");

})

router.get("/dashboard/viewAll/", function(req,res){
    if(checkDatabaseExists(req.user, getDatabaseObjectByName(req.user, 'Dashboards')[0])){
        var dashboards = getRecords(req.user, getDatabaseObjectByName(req.user, 'Dashboards')[0])
    } else {
        var dashboards = []
    }
    res.render("./Chart/dashboard-view-all.ejs", {dashboards: dashboards})
})

//create dashboards in a similar manner to charts.

router.post("/dashboard/create/", function(req,res){

    if(checkDatabaseExists(req.user, getDatabaseObjectByName(req.user, 'Dashboards')[0])){

        putRecord(req.user, getDatabaseObjectByName(req.user, 'Dashboards')[0], req.body.dashboardData)

    } else {

        var schema = {

            'dashboardName':'string',
            'layout':'object',
            'chartValues':'object'

        }

        createDatabase(req.user, 'Dashboards', schema)

        putRecord(req.user, getDatabaseObjectByName(req.user, 'Dashboards')[0], req.body.dashboardData)

    }

    res.send(200)

})

router.get("/dashboard/:dashboardId/view", function(req, res){

    var dashboard = getRecord(req.user, getDatabaseObjectByName(req.user, 'Dashboards')[0], 'recordId', req.params.dashboardId)

    res.render('./Chart/dashboard-view.ejs', {dashboard:dashboard[0], dashboardsDatabaseId:getDatabaseObjectByName(req.user, 'Dashboards')[0].databaseId, chartsDatabaseId:getDatabaseObjectByName(req.user, 'Charts')[0].databaseId})

})

router.get("/dashboard/:dashboardId/update", function(req, res){

    var dashboard = getRecord(req.user, getDatabaseObjectByName(req.user, 'Dashboards')[0], 'recordId', req.params.dashboardId)
    var dashboardDatabaseId = getDatabaseObjectByName(req.user, 'Dashboards')[0].databaseId

    res.render('./Chart/dashboard-update.ejs', {dashboard:dashboard[0], dashboardDatabaseId:dashboardDatabaseId})

})

router.post("/dashboard/update", function(req,res){

    updateRecord(req.user, getDatabaseObjectByName(req.user, 'Dashboards')[0], 'recordId', req.body.dashboardData)

    res.send(200)

})

router.delete("/dashboard/:dashboardId/delete", function(req,res){

    var dashboards = getDatabaseObjectByName(req.user, 'Dashboards')[0]
    
    deleteRecord(req.user,dashboards, req.params.dashboardId)

    res.send(200)

})

function checkIfDirectoryExists(directoryPath){
    try{
        var stat = fs.lstatSync(directoryPath)
        return stat.isDirectory()
    } catch (e) {
        console.log(e)
        return false;
    }
}

function checkIfFileExists(filePath){
    try{
        var stat = fs.lstatSync(filePath)
        return stat.isFile()
    } catch (e) {
        console.log(e)
        return false;
    }
}

module.exports.router = router;