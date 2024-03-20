const { getRecord, getDatabaseObjectByName, updateRecord, checkDatabaseExists, createDatabase, putRecord } = require("../database/databaseFunctions")

function getUsersTickets(user){

    return getRecords(user, getDatabaseObjectByName(user, 'Tickets')[0])

}

function createTicket(user, ticketRecord){

    if(!checkDatabaseExists(user, getDatabaseObjectByName(user, 'Tickets')[0])){

        var ticketSchema = {

            'ticketName': 'string',
            'ticketDetail': 'string',
            'ticketDeadline': 'date',
            'ticketCompleted': 'boolean'
    
        }

        var outputDatabaseObject = createDatabase(user, 'Tickets', ticketSchema)

        putRecord(user, outputDatabaseObject, JSON.stringify(ticketRecord))

    } else {

        putRecord(user, getDatabaseObjectByName(user, 'Tickets')[0], JSON.stringify(ticketRecord))

    }

}

function completeTicket(user, ticketId){

    var record = getRecord(user, getDatabaseObjectByName(user, 'Tickets')[0], 'recordId', ticketId)[0]

    record.ticketCompleted = true

    updateRecord(user, getDatabaseObjectByName(user, 'Tickets')[0], record.recordId, JSON.stringify(record))

}

function uncompleteTicket(user, ticketId){

    var record = getRecord(user, getDatabaseObjectByName(user, 'Tickets')[0], 'recordId', ticketId)[0]

    record.ticketCompleted = false

    updateRecord(user, getDatabaseObjectByName(user, 'Tickets')[0], record.recordId, JSON.stringify(record))

}

function updateTicket(user, ticketId, updatedTicketObject){

    updatedTicketObject['ticketCompleted'] = Boolean(updatedTicketObject['ticketCompleted'])

    updateRecord(user, getDatabaseObjectByName(user, 'Tickets')[0], ticketId, JSON.stringify(updatedTicketObject))

}

function removeTicket(){

}

module.exports = {getUsersTickets, completeTicket, uncompleteTicket, updateTicket, createTicket}