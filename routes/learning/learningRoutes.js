var express = require('express');
var router = express.Router()

router.get("/learning/home", function(req,res){

    res.render("./learning/learningHome.ejs");

})

module.exports.router = router