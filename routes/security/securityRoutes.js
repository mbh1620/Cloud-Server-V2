var express = require('express');
const { resourceLimits } = require('worker_threads');
var router = express.Router()
var fs = require("fs-extra")
var lockfile = require('proper-lockfile');
var {updateDatabasePermissions, getDirectoriesPermissions, updateFilePermissions} = require('./securityFunctions')
var {getUsersDatabases, getRecord} = require("../database/databaseFunctions")
var pathFunc = require('path')

router.get("/security/home", function(req,res){
    res.render("./Security/security-home.ejs")
})

//To set security for a file or directory, a DB can be used which the middleware can then lookup

router.get("/security/users-files", function(req,res){

    res.render("./Security/security-files.ejs", {path:'/'});

})

router.get("/security/databases", function(req,res){

    var usersDatabases = getUsersDatabases(req.user)

    res.render("./Security/security-databases.ejs", {databases:usersDatabases});

})

router.post("/security/database", function(req,res){

    var baseDatabaseObject = {

        'databaseId': 'BASEDBID',
        'userId': req.user.id,
        'dbName': 'BASEDB',
        'securityType': 'private',
        'allowList': [],
        'dataFile': `/${req.user.name}/Database/BASEDB.json`,
        'schemaFile': `/${req.user.name}/Database/TableSchemas/BASEDBSchema.json`

    }

    var database = getRecord(req.user, baseDatabaseObject,'databaseId', req.body.databaseId)[0]

    res.render("./Security/security-database-edit.ejs", {database:database})

})

router.post("/security/database/update", function(req,res){

    var baseDatabaseObject = {

        'databaseId': 'BASEDBID',
        'userId': req.user.id,
        'dbName': 'BASEDB',
        'securityType': 'private',
        'allowList': [],
        'dataFile': `/${req.user.name}/Database/BASEDB.json`,
        'schemaFile': `/${req.user.name}/Database/TableSchemas/BASEDBSchema.json`

    }

    var database = getRecord(req.user, baseDatabaseObject,'databaseId', req.body.databaseId)[0]

    updateDatabasePermissions(req.user, database, req.body.securityType, req.body.userList, req.body.permissionsList)

    res.send(200)

})

router.get("/security/charts-and-dashboards", function(req,res){
    res.render("./Security/charts-and-dashboards.ejs", {});
})

router.post("/security/editFilePermissions", function(req,res){

    var path = req.body.path;
    var file = req.body.file;
    var fullPath = pathFunc.join("/",req.user.name, req.body.path, req.body.file)
    var permissions = getDirectoriesPermissions(req.user,fullPath)

    if(permissions == undefined){
        permissions = {
            path:fullPath,
            securityType:'private',
            permissions:[],
            userList:[]
        }
    }

    res.render("./Security/security-editPermissions.ejs", {permissions:permissions, path:path, file:file})
})

router.post("/security/update", function(req, res){

    path = pathFunc.join("/",req.user.name, req.body.path, req.body.file)

    var permissionsList = [];

    usersList = req.body.userList.split(',')

    updateFilePermissions(req.user, path, req.body.securityType, usersList, permissionsList)

    res.redirect('/security/users-files')

})


module.exports.router = router;