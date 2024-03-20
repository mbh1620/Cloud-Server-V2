//-----------------------------------------------------------------------
//                          Website Routes
//-----------------------------------------------------------------------

//Website routes are used to host static sites

var express = require('express');
var router = express.Router()
var {getUsersWebsites} = require("../websites/websiteFunctions")

router.get("/websites/home", function(req,res){

    res.render("./Websites/websites-home.ejs")
    
})

router.get("/websites/users-websites", function(req, res){

    var websites = getUsersWebsites(req.user)

    res.render("./Websites/websites-user.ejs", {websites:websites})

})

module.exports.router = router;