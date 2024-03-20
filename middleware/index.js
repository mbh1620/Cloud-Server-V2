const { getRecord, getUsersDatabases, getDatabaseObjectByName } = require('../routes/database/databaseFunctions');

const { serviceMiddleware } = require('../middleware/middlewareFunctions')

function checkUser(req, res, next) {

    //May need to refactor this as this is working but a bit hacky using req.originalURl etc

    if (req.url.split("/").length >= 3) {
        if (req.url.split("/")[1] == "video" && req.url.split("/")[2] == "play") {
            if (videoMiddleware(req) == true){
                return next();
            } else {
                res.render('unauthorised.ejs')
            }
        }
    }

    var user = req.originalUrl.split("/")[1];
    var user = user.replace("%20", " ");

    var urlPath = req.url.replace("%20", " ");

    // console.log(req.url)

    var service = req.url.split('/')[1]

    serviceMiddleware(service, req, res, next)

    if (req.isAuthenticated()) {
        if (req.originalUrl.includes('.') && req.originalUrl != "/style.css" && req.originalUrl != "/prism.css" && req.originalUrl != "/prism.js") {
            if (user == req.user.name) {
                console.log("USER " + user + " AUTHORISED FOR " + req.body.currentPath + " DIRECTORY")
                return next()
            } else {
                res.render('unauthorised.ejs')
            }
        } else {
            return next();
        }
    } else if (req.url != "/login" && req.url != "/register" && req.url != "/register?" && req.originalUrl != "/register?") {
        res.redirect('/login');
    } else if (req.url === "/login" || req.url === "/register" || req.url === "/register?" || req.originalUrl === "register") {
        return next()
    }
}

function videoMiddleware(req) {

    var user = req.url.split("$+")[1];
    var user = user.split("+")[0];
    var user = user.replace("%20", " ");

    if (req.originalUrl.includes('.')) {
        if (user == req.user.name) {
            console.log("USER " + user + " AUTHORISED FOR VIDEO " + req.body.currentPath + " DIRECTORY")
            return true;
        } else {
            return false;
        }
    } else {
        return true;
    }

}

function checkRoutePermissions() {

    // console.log(requestUrl);
}

function storageMiddleware(){

    //Function used to check the security of files


}

function databaseMiddleware(){

    //Function used to check the security of Databases

    //Which routes does this middleware work on?

    //http://localhost:8080/database/query/49992e92-a84f-4ab3-abb1-88a717f76859

    //Works on the /database routes

    //If the user is not logged in, then this middleware would check for the database in the global references database and check whether the database is 'public'

    //The middleware would then serve this route 

}

exports.checkUser = checkUser;