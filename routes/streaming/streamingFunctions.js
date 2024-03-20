
//-----------------------------------------------------------------------
//                      Streaming Functions - Backend
//-----------------------------------------------------------------------

var {getRecords, getDatabaseObjectByName, checkDatabaseExists, createDatabase} = require('../database/databaseFunctions')

function getUsersStreams(user){

    //Fill out code here

    if(checkDatabaseExists(user, getDatabaseObjectByName(user, 'usersStreams')[0])){
        
        var usersStreams = getRecords(user, getDatabaseObjectByName(user, 'usersStreams')[0])

    } else {

        createDatabase(user, 'usersStreams', {      //Not 100% sure on the stream schema yet however will decide this in a bit.

            'streamName':'string',
            'connectedDatabaseId':'string',         //NA if there is no connected database.
            'eventDataSourceId':'string'            //(queryObject) EventId which is used to pass data to the stream.

        })

        var usersStreams = []

    }

    return usersStreams

}

function activateDataStream(){

    //Add a room to the global socket.io object and start emitting data to this room

}

function deactivateDataStream(){

    //Remove the room from the global socket.io object

}

module.exports = {getUsersStreams}