//------------------------------------------------------
//                 STORAGE SITE SERVER SIDE
//------------------------------------------------------
// Matthew Haywood

var express = require("express");
var app = express();
var bodyParser = require("body-parser");
var fs = require("fs-extra");
var methodOverride = require("method-override");
var passport = require("passport");
var session = require('express-session')
var flash = require('express-flash');
var bcrypt = require('bcryptjs');
var schedule = require('node-schedule');
const { exec } = require('child_process');
var checkUserMiddleware = require("./middleware/index").checkUser;
var EventEmitter = require("events")

var workflowRoutes = require('./routes/workflow/workflowRoutes').router;
var storageRoutes = require('./routes/storage/storageRoutes').router;
var codeRoutes = require('./routes/code/codeRoutes').router;
var websiteRoutes = require('./routes/websites/websiteRoutes').router;
var databaseRoutes = require('./routes/database/databaseRoutes').router;
var crawlerRoutes = require('./routes/crawler/crawlerRoutes').router;
var streamingRoutes = require('./routes/data-streaming/streamingRoutes').router
var iotRoutes = require('./routes/iot/iotRoutes').router;
var learningRoutes = require('./routes/learning/learningRoutes').router;
var formsRoutes = require('./routes/forms/form-routes').router;
var chartRoutes = require('./routes/chart/chartRoutes').router;
var logRoutes = require('./routes/log/logRoutes').router;
var mediaRoutes = require('./routes/media/mediaRoutes').router;
var ticketRoutes = require('./routes/tickets/ticketRoutes').router;
var eventsRoutes = require('./routes/event-triggers/eventTriggerRoutes').router;
var securityRoutes = require('./routes/security/securityRoutes').router;

global.testFolder;
global.eventEmitter = new EventEmitter();

//Configure the app based on whether its development, production or testing for github

/*

Look into vhost for setting sub domains for users hosted applications and statically hosted pages etc..
https://www.npmjs.com/package/vhost

*/

if (process.env.NODE_ENV === 'production') {
    testFolder = '/media/pi/ELEMENTS\ B/';
    string_len = 22;
    production_flag = true
}

if (process.env.NODE_ENV === 'appleProduction') {
    testFolder = '/Volumes/ELEMENTS\ B/';
    string_len = 21;
    production_flag = true
}

if (process.env.NODE_ENV === 'development') {
    testFolder = '/Users/matthaywood/Desktop/StorageSite/StorageSite/public/'
    string_len = 59;
}

if (process.env.NODE_ENV === 'github'){
    testFolder = __dirname + '/public/'
    string_len = testFolder.length+1;
}

//PASSPORT SETUP
const initializePassport = require('./passport-config');

initializePassport(
    passport,
    email => users.find(user => user.email === email),
    id => users.find(user => user.id === id)
)

app.use(bodyParser.json())
app.use(bodyParser.urlencoded({ extended: false }))
app.use(flash())
app.use(session({
    secret: "Once again rusty is the cutest dog",
    // resave: false,
    // saveUninitialized: false
}))
app.use(passport.initialize());
app.use(passport.session());

app.use(methodOverride("_method"));

app.use(function (req, res, next) {
    res.locals.currentUser = req.user;
    next();
});

global.users = [];
global.scheduledWorkflows = []

//LOAD USERS IN FROM JSON FILE
var loadedData = JSON.parse(fs.readFileSync("users.json"))
console.log(loadedData.Users)
users = loadedData.Users

app.use('/modules', express.static("modules"));
app.use(checkUserMiddleware, express.static(testFolder));

app.use("/", storageRoutes);
app.use("/", workflowRoutes);
app.use("/", websiteRoutes);
app.use("/", databaseRoutes);
app.use("/", crawlerRoutes);
app.use("/", streamingRoutes);
app.use("/", iotRoutes);
app.use("/", learningRoutes);
app.use("/", formsRoutes);
app.use("/", chartRoutes);
app.use("/", logRoutes);
app.use("/", mediaRoutes);
app.use("/", ticketRoutes);
app.use("/", eventsRoutes);
app.use("/", securityRoutes);
app.use("/", codeRoutes);
    
//----------------------------------------------------------
//                          ROUTES
//----------------------------------------------------------

app.get("/", function (req, res) {
    res.render("clusterHome.ejs");
})

//Settings Route for displaying current connected HDD
app.get("/settings", function (req, res) {
    res.render("settings.ejs");
})

//--------------------------------------------------------------------
//                  ROUTES FOR USERS AND LOGIN 
//--------------------------------------------------------------------

//Register 
app.get("/register", function (req, res) {
    res.render("register.ejs");
})

app.post("/register", function (req, res) {
    var password = req.body.password;
    // var name = sanitizer.value(req.body.name,String);
    var name = req.body.name;
    // var email = sanitizer.value(req.body.email,String);
    var email = req.body.email;

    bcrypt.hash(password, 10, function (err, hash) {

        the_id = Date.now().toString(); //Change this to a unique id 
        users.push({
            id: the_id,
            name: name,
            email: email,
            password: hash
        })

        fs.mkdirSync(testFolder + name);
        fs.mkdirSync(testFolder + name + "/Code");
        fs.mkdirSync(testFolder + name + "/Websites");
        fs.mkdirSync(testFolder + name + "/Database" );
        fs.mkdirSync(testFolder + name + "/" + "Workflows");
        fs.mkdirSync(testFolder + name + "/Workflows/Logs" );
        fs.writeFileSync(testFolder + name + "/Workflows/workflow.json", '{"workflows":[]}')

        var data = JSON.parse(fs.readFileSync("users.json"))

        data.Users.push({
            id: the_id,
            name: name,
            email: email,
            password: hash
        })

        data = JSON.stringify(data, null, 2)
        fs.writeFileSync("users.json", data)

        passport.authenticate('local')(req, res, function () {
            res.redirect("/");
        })

        if (err) {
            console.log(err)
            res.redirect('/register');
        } 
    })
})

app.post("/delete-account", function(req,res){
    var name = req.body.userName

    var data = JSON.parse(fs.readFileSync("users.json"))
    var recordToBeDeleted;
    var index;
    let obj2 = data.Users.filter((o, i) => {
        if(o['name'] == name){
            recordToBeDeleted = o
            index = i
        }
    })

    data.Users.splice(index, 1)
    data = JSON.stringify(data, null, 2)
    fs.writeFileSync("users.json", data)

    fs.rmdirSync(testFolder + name,{recursive:true})
    res.redirect("/")
})

//----------------------------------------------------------
//                   LOGIN/LOGOUT ROUTES
//----------------------------------------------------------

app.get("/login", function (req, res) {
    res.render("login.ejs");
})

app.post("/login", passport.authenticate('local'), function (req, res) {
    res.redirect("/");
})

//Logout
app.delete("/logout", function (req, res) {
    req.logOut();
    res.redirect('/login')
})

//Unauthorised Route
app.get("/unauthorised", function(req, res){
    res.render("unauthorised.ejs");
})

//----------------------------------------------------------
//                  AUTO GIT PULL SCHEDULE
//----------------------------------------------------------

//Only run this job if in production to pull from github

if (process.env.NODE_ENV === 'production' || process.env.NODE_ENV == 'appleProduction') {
    const job = schedule.scheduleJob('*/5 * * * *', function () {
        exec('git pull', (err, stdout, stderr) => {
            if (err) {
                console.log(err);
            } else {
                console.log("Pulling from git repository")
                console.log(stdout)
                //Restart server if git has pulled changes
                if(!stdout.includes("Already up to date.")){
                    process.exit(1)
                }
            }
        })
    })
}

app.listen("8080");

module.exports = app; //Export app for testing