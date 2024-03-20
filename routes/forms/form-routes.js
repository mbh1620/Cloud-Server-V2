
//-----------------------------------------------------------------------
//                      Form Routes - Backend
//-----------------------------------------------------------------------

var express = require('express')
var router = express.Router()

const { getDatabase, getDatabaseObjectByName, createDatabase, checkDatabaseExists, putRecord, getRecords, getRecord} = require("../database/databaseFunctions")

router.get('/forms/home', function(req, res){

    res.render("./Forms/forms-home.ejs")

})

router.get('/forms/usersForms/', function(req,res){

    if(checkDatabaseExists(req.user, getDatabaseObjectByName(req.user, 'Forms')[0])){

        var forms = getRecords(req.user, getDatabase(req.user, getDatabaseObjectByName(req.user, 'Forms')[0]))
    
    } else {

        var formSchemaDefinition = {

            'databaseId': 'string',
            'formName':'string',
            'questionArray':'object'

        }

        createDatabase(req.user, 'Forms', formSchemaDefinition)

        var forms = []

    }

    res.render('./Forms/forms-user.ejs', {forms:forms})

})

router.get('/forms/create/', function(req,res){

    res.render("./Forms/forms-create.ejs")

})

router.post('/forms/create', function(req,res){

    var formRecord = {
        databaseId: req.body.databaseId,
        formName: req.body.formName,
        questionArray: JSON.parse(req.body.questionArray)
    }
    
    putRecord(req.user, getDatabaseObjectByName(req.user, 'Forms')[0], JSON.stringify(formRecord))

    res.send(200)

})

router.get('/forms/:formId/view', function(req,res){

    var form = getRecord(req.user, getDatabaseObjectByName(req.user, 'Forms')[0], 'recordId', req.params.formId)[0]

    res.render('./Forms/forms-view.ejs', {form:form})

})

router.post('/forms/get', function(req,res){

    var form = getRecord(req.user, getDatabaseObjectByName(req.user, 'Forms')[0], 'recordId', req.body.formId)[0]

    res.send(form)

})

router.get("/forms/:formId/update", function(req,res){



})

router.post("/forms/update", function(req,res){



})

router.delete("/forms/:formId/delete", function(req,res){



})

router.post('/forms/submit', function(req,res){
     
    var database = getRecord(req.user, getDatabaseObjectByName(req.user, 'BASEDB')[0], 'databaseId', req.body.databaseId)[0]

    putRecord(req.user, database, req.body.formSubmission)

    res.send(200)
    
})

router.get('/forms/success', function(req,res){

    res.render('./Forms/forms-success.ejs')

})

module.exports.router = router;
