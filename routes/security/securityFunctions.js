var { createDatabase, getRecord, putRecord, updateRecord, checkDatabaseExists, getDatabaseObjectByName, setDbPublic, setDbPrivate, setDbLimited}= require('../database/databaseFunctions')

function getDirectoriesPermissions(user, path){

    if( getDatabaseObjectByName(user, 'Security')[0] == undefined){

        createDatabase(user, 'Security', {
            'path':'string',
            'securityType':'string',
            'permissions': 'object',
            'userList': 'object'
        })

    } 
    
    var record = getRecord(user, getDatabaseObjectByName(user, 'Security')[0], 'path',  path)[0];

    return record

}

function updateDatabasePermissions(userObject, databaseObject, securityType, userList, permissionsList){

    //Code used to invoke the database functions

    switch(securityType){

        case 'private':
            setDbPrivate(userObject, databaseObject)
            break;

        case 'limited':
            setDbLimited(userObject, databaseObject, userList, permissionsList)
            break;

        case 'public':
            setDbPublic(userObject, databaseObject, permissionsList)
            break
    }

}

function updateFilePermissions(user, path, securityType, userList, permissionsList){

    //Check if the path is a file or a 

    //First Check if the Security database exists

    if(checkDatabaseExists(user, 'Security') == false){

        createDatabase(user, 'Security', {
            'path':'string',
            'securityType':'string',
            'permissions': 'object',
            'userList': 'object'
        })

    }

    //Add or edit an existing record

    if(getRecord(user.name, getDatabaseObjectByName(user, 'Security')[0], 'path', path).length == 1){

        //update record
        var record = getRecord(user.name, 'Security', 'path', path)[0]
        var updatedRecord = {
            'path':path,
            'securityType':securityType,
            'permissions':permissionsList,
            'userList':userList
        }

        console.log(updatedRecord)

        updateRecord(user.name, 'Security', record.recordId, updatedRecord)

    } else {

        //create new record

       var securityObject = {
            'path':path,
            'securityType':securityType,
            'permissions':permissionsList,
            'userList':userList
        }

        securityObject = JSON.stringify(securityObject)
        putRecord('Security', securityObject, user)

    }

}

module.exports = {getDirectoriesPermissions, updateFilePermissions, updateDatabasePermissions}