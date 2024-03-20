var express = require('express');
var router = express.Router()
var fs = require('fs-extra')
var pathFunc = require('path')

var videoFileFormats = ['mov', 'MOV', 'MP4', 'mp4']

router.get("/media/home", function(req,res){

    res.render("./media/mediaHome.ejs");

})

router.get('/media/video', function(req,res){

    res.render('./media/mediaVideo.ejs')

})

router.get('/media/presentation', function(req, res){

    res.render('./media/mediaPresentation.ejs', {path: '/'})

})

router.post('/media/presentation', function(req,res){

    res.render('./media/videoShowPresentation.ejs', {directory: req.body.directory})

})

router.post("/media/getVideoPresentationLinks", function(req, res){


    var filePath = pathFunc.join(testFolder, req.user.name, req.body.directory)

    var files = fs.readdirSync(filePath)

    videoPaths = []

    console.log('directory')
    console.log(req.body.directory)

    for(var file of files){

        //If the file extentions is of the defined video file extensions then add to the list

        if (videoFileFormats.includes(file.split('.')[1])){

            var processedPath = pathFunc.join("$", req.user.name, req.body.directory, file)

            processedPath = processedPath.replace(/\//g, "+")

            videoPaths.push(processedPath)

        }

    }

    res.send(videoPaths)

})

module.exports.router = router