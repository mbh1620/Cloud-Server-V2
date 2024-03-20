var express = require('express');
var router = express.Router()
var multer = require('multer');
var fs = require('fs-extra');
const { findUserById } = require('../database/databaseRoutes');
var { searchDirectory, newDirectory, deleteFileOrDirectory, renameFileOrDirectory } = require('../storage/storageFunctions');
var videoMiddleWare = require('../../middleware/index').videoMiddleware
var { createLogRecord } = require('../log/logFunctions')
var pathFunc = require("path")

var storage = multer.diskStorage({
    destination: function (req, file, cb) {
        cb(null, './public')
    },
    filename: function (req, file, cb) {
        cb(null, file.originalname)
    }
})

var upload = multer({ storage: storage })

router.get("/storage-home", function (req, res) {
    res.render("./Storage/storage-home.ejs");
})

router.get("/storage/viewFiles", function(req, res){

    var path  = "/";

    res.render("./Storage/viewFiles.ejs", {path:path})

})

router.post("/storage/viewFiles", function(req, res){
    
    //This route is used to customise the starting directory

    var path;

    if( req.body.path == undefined){

        path = "/"

    } else {

        path = req.body.path
        
    }

    res.render("./Storage/viewFiles.ejs", {path:path})

})

router.post("/storage/searchDirectory", function(req,res){

    var fileObjects = searchDirectory(req.user, req.body.path)

    res.send(fileObjects)

})

//Route for creating a new directory
router.post("/newfolder", function (req, res) {
    
    newDirectory(req.user, req.body.currentPath, req.body.name)
    
    res.sendStatus(200)
})

//Route for deleting a directory
router.post("/deletedir", function (req, res) {

    deleteFileOrDirectory(req.user, req.body.currentPath, req.body.name)

    res.sendStatus(200)
})

//Route for File Upload
router.post("/uploadfile", upload.array('fileElem', 5), function (req, res) {
    
    var tempPath = pathFunc.join("./public/", req.body.filename)
    var fullPath = pathFunc.join(testFolder, req.user.name, req.body.currentPath, req.body.filename)
    
    fs.moveSync(tempPath, fullPath, {overwrite:true})

    createLogRecord(req.user, {
        Name: 'File Upload',
        fileName: req.body.filename,
        filePath: req.body.currentPath,
        Status: 'SUCCESS', 
        type:'UPLOAD'
    }, 'Storage')
    res.sendStatus(200);
    
})

//Route for File Download 
router.post("/downloadfile", function (req, res) {

    var fullPath = pathFunc.join(testFolder, req.user.name, req.body.path)
    
    res.download(fullPath);
})

//Route for renaming a file
router.post("/rename", function (req, res) {

    renameFileOrDirectory(req.user, req.body.currentPath, req.body.oldname, req.body.newname)

    res.sendStatus(200)
})

//Route for moving an item into a different directory

router.post("/move", function(req, res) {
    var path = req.body.currentPath
    var filename = req.body.fileName
    var fullPath = pathFunc.join(testFolder, req.user.name, req.body.currentPath)
    var files = fs.readdirSync(fullPath)
    res.render("moveFile.ejs", {path: path, fileName: filename, files: files})
})

//Route for moving files and folders to different directories

router.post("/move/file", function(req,res){
    var oldFullPath = pathFunc.join(testFolder, req.user.name, req.body.oldPath)
    var newFullPath = pathFunc.join(testFolder, req.user.name, req.body.newPath)

    fs.moveSync(oldFullPath, newFullPath)
    res.sendStatus(200)
})

//Route for creating a new rtf or .txt file
router.post("/text/create", function(req, res){
    var path = req.body.currentPath
    res.render("textcreate.ejs", {path: path})
})  

//Route for editing a rtf or .txt file
router.post("/text/edit", function(req, res){
    
    var path = req.body.currentPath
    var name = req.body.fileName

    var fullPath = pathFunc.join(testFolder, req.user.name, path, name)
    var data = fs.readFileSync(fullPath, 'utf-8')
    res.render("textedit.ejs", {textcontent:data, fileName: name, path:path})

})

router.post("/text/save", function(req, res){
    var filename = req.body.name
    var path = req.body.currentPath
    var content = req.body.content

    var fullPath = pathFunc.join(testFolder, req.user.name, path, filename)
    fs.writeFileSync(fullPath, content)
    res.sendStatus(200)
})

//Route For viewing JPGs, jpegs, etc... 
router.post("/view/photo", function(req, res){
    var path = req.body.currentPath
    var filename = req.body.fileName
    var currentUser = req.body.currentUser

    var fullPath = pathFunc.join(testFolder, req.user.name, path)
   
    var files = fs.readdirSync(fullPath)
    var images = []
    var fileExtensions = ['jpg', 'jpeg', 'gif', 'png']

    for(var i = 0; i < files.length; i++){
        fileExtension = files[i].split(".")[1]
        if(fileExtension){
            if(fileExtensions.includes(fileExtension.toLowerCase())){
                images.push(files[i])
            }
        }
    }
 
    var indexOfFile = images.indexOf(filename)
    var next = indexOfFile + 1;
    var previous = indexOfFile - 1;

    if(next > images.length - 1){
        next = next - (images.length)
    }
    if(previous < 0){
        previous = previous + (images.length)
    }

    finalPath = "../"
    finalPath = pathFunc.join(finalPath, currentUser, path, filename)
        
    var nextFileName = images[next]
    var prevFileName = images[previous]

    res.render("showPhoto.ejs", {photoPath: finalPath, filename: filename, currentPath: req.body.currentPath, next: nextFileName, prev:prevFileName });  
})

//--------------------------------------------------------------------
//                  ROUTES FOR STREAMING VIDEO
//--------------------------------------------------------------------

router.get("/video/play/:path", function (req, res) {

    var path = req.params.path;
    path = path.replace(/\+/g, "/")
    path = path.substring(path.indexOf('/')+1)
    path = pathFunc.join(testFolder, path)

    const stat = fs.statSync(path);
    const fileSize = stat.size;
    const range = req.headers.range;
    if (range) {
        
        const parts = range.replace(/bytes=/, "").split("-")
        const start = parseInt(parts[0], 10)
        const end = parts[1]
            ? parseInt(parts[1], 10)
            : fileSize - 1
        const chunksize = (end - start) + 1
        const file = fs.createReadStream(path, { start, end })
        const head = {
            'Content-Range': `bytes ${start}-${end}/${fileSize}`,
            'Accept-Ranges': 'bytes',
            'Content-Length': chunksize,
            'Content-Type': 'video/quicktime'
        }
        res.writeHead(206, head);
        file.pipe(res);
    } else {
        const head = {
            'Content-Length': fileSize,
            'Content-Type': 'video/quicktime',
        }
        res.writeHead(206, head)
        fs.createReadStream(path).pipe(res)
    }
})

router.post("/video/page/", function (req, res) {
    
    const currentPath = req.body.currentPath
    const filename = req.body.fileName;

    var processedPath = pathFunc.join("$", req.user.name, currentPath, filename)

    processedPath = processedPath.replace(/\//g, "+")
    
    res.render("videotest.ejs", { path: processedPath });
})

module.exports.router = router;