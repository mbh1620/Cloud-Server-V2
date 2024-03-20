var fs = require("fs-extra")
var pathFunc = require("path")
var {createLogRecord}= require('../log/logFunctions')

//Functions for storage routes

function searchDirectory(user, directory){

    //Returns a set of files in the searched Directory

    var fullPath = pathFunc.join(testFolder, user.name, directory)
    var files = fs.readdirSync(fullPath)

    var fileObjects = []

    files.forEach(function(filename){

        var fileObject = new Object();

        fileObject.filename = filename
        fileObject.stats = fs.statSync(testFolder + user.name + "/" + directory + "/" + filename)
        
        if( fileObject.stats.isFile()) {
            fileObject.fileType = "File";
        } else {
            fileObject.fileType = "Directory";
        }

        fileObjects.push(fileObject)

    })

    return fileObjects

}

function uploadFile(){
    
    //Uploads a file 

    //This is currently done through multer so not sure how this would work

}

function newDirectory(user, path, nameOfNewDirectory){

    var fullPath = pathFunc.join(testFolder, user.name, path, nameOfNewDirectory)
    fs.mkdirSync(fullPath);

    createLogRecord(user, {
        Name: "New Directory Created",
        Status: 'SUCCESS',
        DirectoryName: nameOfNewDirectory,
        Type: "CREATE"
    }, 'Storage')

}

function renameFileOrDirectory(user, path, oldName, newName){

    var basePath = pathFunc.join(testFolder, user.name, path)

    var oldFullPath =  pathFunc.join(basePath, oldName)
    var newFullPath = pathFunc.join(basePath, newName)

    fs.renameSync(oldFullPath, newFullPath);

}

function moveFileOrDirectory(){


}

function deleteFileOrDirectory(user, path, name){

    var fullPath = pathFunc.join(testFolder, user.name, path, name)
    
    fs.removeSync(fullPath)

}

function readTextFile(){

}

function writeTextFile(){


}

module.exports = {searchDirectory, newDirectory, deleteFileOrDirectory, renameFileOrDirectory}