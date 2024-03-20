var fs = require('fs-extra')

function getUsersWebsites(user){

    //Scan users Website directory and return the directories

    var websites = fs.readdirSync(testFolder + "/" + user.name + "/Websites/")

    return websites

}

module.exports = {getUsersWebsites}