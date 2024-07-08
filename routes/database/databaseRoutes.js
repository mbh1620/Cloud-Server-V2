//-----------------------------------------------------------------------
//                          Database Routes
//-----------------------------------------------------------------------

var express = require('express');
var router = express.Router()

var { getUsersDatabases, createDatabase, putRecord, getSchemaFields,
    getDatabase, getSchema, getRecord, getRecords, updateRecord, deleteRecord,
    getRecordContaining, getRecordInbetween, updateSchema, deleteDatabase} = require("./databaseFunctions");


//Index routes

router.get("/database/home", function(req,res){
    res.render("./Database/database-home.ejs")
})

router.get("/database/usersdb/", function(req,res){
    
    var databases = getUsersDatabases(req.user)
    res.render("./Database/database-user.ejs", {databases: databases})

})

router.post("/database/usersDatabases", function(req,res){

    var databases = getUsersDatabases(req.user)

    res.send(databases)

})

//Create routes

router.get("/database/create", function(req,res){
    
    res.render("./Database/database-create.ejs")
    
})

router.post("/database/create", function(req,res){

    var schemaDefinition;

    try{
        schemaDefinition = JSON.parse(req.body.schemaDefinition)
    } catch (e){
        console.log(e);
        schemaDefinition = undefined;
    }
    
    createDatabase(req.user, req.body.tableName, schemaDefinition)
    res.redirect('/database/usersdb/')
})

router.get("/database/put/:databaseId", function(req,res){

    var databaseObject = {};
    databaseObject['databaseId'] = req.params.databaseId

    var database = getDatabase(req.user, databaseObject)
    var databaseFields = getSchemaFields(req.user, databaseObject);

    res.render("./Database/database-input.ejs", {database: database, databaseFields: databaseFields});
})

router.post("/database/put/:databaseId", function(req,res){
    
    var record = req.body.data;

    var databaseObject = {};
    databaseObject['databaseId'] = req.params.databaseId

    var database = getDatabase(req.user, databaseObject)

    putRecord(req.user, database, record)
    
    res.sendStatus(200);
})

router.post("/database/put-batch/:databaseName", function(req,res){

})

//Read Routes

router.get("/database/query/:databaseId", function(req,res){

    var database = {};
    database['databaseId'] = req.params.databaseId

    var database = getDatabase(req.user, database)

    res.render("./Database/database-query.ejs", {database: database})

})

router.post("/database/query/getFieldsFromSchema", function(req,res){

    var database = {};
    database['databaseId'] = req.body.databaseId

    var fields = getSchemaFields(req.user, database)

    res.send(fields)
})

router.post("/database/query/getSchema", function(req,res){

    var database = {};
    database['databaseId'] = req.body.databaseId
    
    database = getDatabase(req.user, database)
    var schemaData = getSchema(req.user, database)

    res.send(schemaData);
})

router.post("/database/query/:databaseId", function(req,res){
    var starttime = new Date().getTime()

    var database = {};
    database['databaseId'] = req.params.databaseId

    database = getDatabase(req.user, database)

    var record;

    switch(req.body.queryType){
        case "String Match":
            record = getRecord(req.user, database, req.body.queryField, req.body.queryString)
            break;
        case "String Contains":
            record = getRecordContaining(req.user, database, req.body.queryField, req.body.queryString)
            break;
        case "Inbetween":
            console.log(req.body)
            record = getRecordInbetween(req.user, database, req.body.queryField, req.body.upperQueryString, req.body.lowerQueryString) //Not yet implemented
            break;
    }
    
    if (typeof record == 'undefined'){
        console.log('Record not found')
        res.send({
            status: 200,
            body: 'Record Not Found'
        })
    } else {
        var endtime = new Date().getTime()
        var queryTime = ((endtime - starttime)/1000).toFixed(3)
        data = {
            status:200,
            record:record,
            recordCount: record.length,
            queryTime: queryTime
        }
        res.send(data)
    }
})

router.post("/database/view/:databaseId", function(req,res){

    var database = {};
    database['databaseId'] = req.params.databaseId

    database = getDatabase(req.user, database)
    var records = getRecords(req.user, database)
    
    res.render('./Database/database-view.ejs', {records:records, database:database})

})

router.post("/database/:databaseId/viewRecord/:recordId", function(req,res){

    var database = {};
    database['databaseId'] = req.params.databaseId
    
    database = getDatabase(req.user, database)
    var record = getRecord(req.user, database, "recordId", req.params.recordId)

    res.render("./Database/database-viewRecord.ejs", {record:record, databaseId: database.databaseId})

})

//Update Routes

router.get("/database/edit/:databaseId", function(req,res){

    var database = {};
    database['databaseId'] = req.params.databaseId
    
    database = getDatabase(req.user, database)
    var databaseSchema = getSchema(req.user, database)

    res.render("./Database/database-edit.ejs", {databaseSchema: databaseSchema, database: database});

})

router.post("/database/edit/", function(req, res){

    var database = {};
    database['databaseId'] = req.body.databaseId
    
    database = getDatabase(req.user, database)
    updateSchema(req.user, database, req.body.schemaDefinition)
      
    res.redirect("/database/usersdb/")

})

router.get("/database/:databaseId/updateRecord/:recordId", function(req,res){

    var database = {};
    database['databaseId'] = req.params.databaseId
    
    database = getDatabase(req.user, database)    
    var record = getRecord(req.user, database, "recordId", req.params.recordId)[0]

    res.render("./Database/database-edit-record.ejs", {record:record, database:database})

})

router.post("/database/:databaseId/updateRecord/:recordId", function(req,res){
    
    var record = req.body.data

    var database = {};
    database['databaseId'] = req.params.databaseId
    
    database = getDatabase(req.user, database)
    updateRecord(req.user, database, req.params.recordId, record)
    
    res.send(200)
})

//Delete Routes

router.post("/database/deleteRecord/:recordId", function(req,res){
    
    var database = {};
    database['databaseId'] = req.body.databaseId

    database = getDatabase(req.user, database)
    deleteRecord(req.user, database, req.params.recordId)

    res.sendStatus(200)

})

router.post("/database/delete", function(req,res){

    var database = {};
    database['databaseId'] = req.body.databaseId
    
    deleteDatabase(req.user, database)
    
    res.sendStatus(200);

})

router.get("/database/gis", function(req,res){

    res.render("./Database/database-gis-tool.ejs")

})

router.get("/database/latlong", function(req,res){

    res.render("./Database/database-coordinate.ejs")

})

module.exports.router = router;