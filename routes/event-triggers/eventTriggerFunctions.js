var events = require('events')

function createEvent(eventName){

    //First off create an object in a database which is linked to the eventEmitter Id

    var eventEmitter = new events.EventEmitter()

    //If for example we wanted to create an event for every time a file is uploaded or a record is put into a database

    return eventEmitter

}

function createEventHandler(eventEmitter, eventType, eventHandler){

    return eventEmitter.on(eventType, eventHandler)

}

function createEventEmitter(eventEmitter, eventType){

    // return eventEmitter.emit(eventType)

}

function callAssociatedEmitters(eventType){

    

}

function readEvent(eventName){


}

function updateEvent(eventName){


}

function deleteEvent(eventName){


}


//Thinking maybe create my own eventListeners that listen in an events or logs database. This would make it easier to create event listeners by user.

//Every time an event is pushed into the database, the event could be checked against the various listeners.

//https://www.freecodecamp.org/news/how-to-code-your-own-event-emitter-in-node-js-a-step-by-step-guide-e13b7e7908e1/

module.exports =  {createEventHandler, createEventEmitter}