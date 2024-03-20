var express = require('express');
var router = express.Router()
var fs = require("fs-extra");
var {checkDatabaseExists, createDatabase, getDatabaseObjectByName, putRecord, getRecords} = require('../database/databaseFunctions');
var pathFunc = require("path")

router.get("/code-home", function (req, res) {
    res.render("codepage.ejs");
})

router.get("/userscode", function (req, res) {
    res.render("userscode.ejs");
})

router.get("/userscode/show", function (req, res) {
    var user = req.user
    var fullPath = pathFunc.join(testFolder, user.name, 'database', 'projects.json')

    if(checkDatabaseExists(req.user, getDatabaseObjectByName(req.user, 'Projects')[0]) == true){

        var projects = getRecords(req.user, getDatabaseObjectByName(req.user, 'Projects')[0])

    } else {

        createDatabase(req.user, 'Projects', {
            'projectName':'string',
            'projectLanguage':'string',
            'projectDetail':'string',
            'testCommand':'string',
            'buildCommand':'string'
        });

        var projects = getRecords(req.user, getDatabaseObjectByName(req.user, 'Projects')[0])

    }

    console.log(projects)

    res.render("usersCode.ejs", { projects: projects});
})

router.get("/userscode/create", function(req,res){
    res.render('./Code/createNew.ejs');
})

router.post("/userscode/create", function(req,res){
    //Create a new db if one does not exist to input project details
    //input details and files

    console.log(req.body.projectName)
    console.log(req.body.projectLanguage)
    console.log(req.body.projectDetail)

    var projectObject = {
        'projectName':req.body.projectName,
        'projectLanguage':req.body.projectLanguage,
        'projectDetail':req.body.projectDetail,
        'testCommand':'',
        'buildCommand':''
    }

    if(checkDbExists(req.user) == true){
        
        putRecord(req.user, getDatabaseObjectByName(req.user, 'Projects')[0], JSON.stringify(projectObject))

    } else {

        createDatabase(req.user, 'Projects', {
            
            'projectName':'string',
            'projectLanguage':'string',
            'projectDetail':'string',
            'testCommand':'string',
            'buildCommand':'string'

        });

        putRecord(req.user, getDatabaseObjectByName(req.user, 'Projects')[0], JSON.stringify(projectObject))

    }

    //Mk a new directory with project name in code directory

    fs.mkdirSync(testFolder+req.user.name+"/Code/"+req.body.projectName);

    res.redirect("/userscode/show");

})

function checkDbExists(user){
    var tableName = 'projects'
    var filePath = testFolder + user.name+"/Database/"+tableName+".json"

    if(fs.existsSync(filePath) == true){
        return true
    } else {
        return false
    }

}

module.exports.router = router;