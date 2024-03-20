var {getRecord, getDatabaseObjectByName} = require('../routes/database/databaseFunctions')
//Functions for securing the various services of the application

function serviceMiddleware(service, req, res, next){

    switch(service){

        case 'database':
            databaseMiddleware(req, res, next)
            break;
        case 'default':
            return 0

    }

}

function databaseMiddleware(req, res, next){
    
    var requestingUrl = req.url.split('/')

    //Operation is second in the url for the following

    //Create - yes
    //Read - yes
    //Update - No is the 3rd 
    //Delete - yes

    //Check the request to see which database operation is being used and on which database ie CREATE, READ, UPDATE and DELETE

    //When is the databaseId in the url and when is it in the body?

    //Check the users BASEDB to see if this database is in this database, if not then check the global REF database

    var userCheckingObject = req.user

    // console.log(req.url)
    // console.log(req.headers)

    // var databaseId = ''

    // if(getRecord(userCheckingObject, getDatabaseObjectByName(userCheckingObject, 'BASEDB')[0], 'databaseId', databaseId).length > 0){

    //     //We know that the requesting user has this database in their BASEDB so we can next

    //     next()

    // } else if (databaseId == ''){

        

    // } else {

    //     console.log('Does not belong to the requesting user')

    //     var validOperations = ['create', 'query', 'update', 'delete']
    //     operation = req.url.split('/')[2]

    //     console.log(operation)

    //     if(validOperations.includes(operation)){

    //         console.log("testing")
            

    //     } else {

    //         res.redirect('/unauthorised')

    //     }

        //we know that the database does not belong to the requesting user

        //Check the global REFDB to see what the permissions are etc..

    // }

}

module.exports = {serviceMiddleware, databaseMiddleware}