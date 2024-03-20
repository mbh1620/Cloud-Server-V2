//-----------------------------------------------------------------------
//                          Ticket Routes
//-----------------------------------------------------------------------

//Routes used for creating tickets and tracking

var express = require('express');
var router = express.Router()
var {getUsersTickets, completeTicket, createTicket, uncompleteTicket, updateTicket} = require('../tickets/ticketFunctions')
var {checkDatabaseExists, getDatabaseObjectByName, getRecords, getRecord, createDatabase, putRecord} = require('../database/databaseFunctions')

router.get("/tickets/home", function(req, res){

    res.render('./Tickets/tickets-home.ejs')

})

router.get("/tickets/users-tickets", function(req, res){

    if(checkDatabaseExists(req.user, getDatabaseObjectByName(req.user, 'Tickets')[0])){

        var tickets = getRecords(req.user, getDatabaseObjectByName(req.user, 'Tickets')[0])
    
    } else {

        createDatabase(req.user, 'Tickets', {        

                'ticketName': 'string',
                'ticketDetail': 'string',
                'ticketDeadline': 'date',
                'ticketCompleted': 'boolean'
        
        })

        var tickets = []

    }
    
    res.render("./Tickets/tickets-user.ejs", {tickets: tickets, ticketsDatabaseId: getDatabaseObjectByName(req.user, 'Tickets')[0].databaseId})
    
})

router.get("/tickets/create", function(req,res){

    res.render('./Tickets/tickets-create.ejs')

})

router.post("/tickets/create", function(req,res){

    var ticketRecord = {

        ticketName: req.body.ticketName,
        ticketDetail: req.body.ticketDetail,
        ticketDeadline: req.body.ticketDeadline,
        ticketCompleted: false

    }

    createTicket(req.user, ticketRecord)

    res.sendStatus(200)

})

router.get("/tickets/view/:ticketId", function(req,res){

    var ticketId = req.params.ticketId

    var ticketObject = getRecord(req.user, getDatabaseObjectByName(req.user, 'Tickets')[0], 'recordId', ticketId)[0]

    res.render('./Tickets/ticket-display.ejs', {ticket: ticketObject})

})

router.post("/tickets/complete", function(req,res){

    var ticketId = req.body.ticketId

    completeTicket(req.user, ticketId)

    res.send(200)

})

router.post("/tickets/uncomplete", function(req,res){

    var ticketId = req.body.ticketId

    uncompleteTicket(req.user, ticketId)

    res.send(200)

})

router.get("/tickets/edit/:ticketId", function(req,res){

    var ticketObject = getRecord(req.user, getDatabaseObjectByName(req.user, 'Tickets')[0], 'recordId', req.params.ticketId)[0]

    res.render('./Tickets/ticket-edit.ejs', {ticket:ticketObject})

})

router.post("/tickets/edit", function(req,res){

    var updatedTicketObject = {

        recordId: req.body.recordId,
        ticketName: req.body.ticketName,
        ticketDetail: req.body.ticketDetail,
        ticketDeadline: req.body.ticketDeadline,
        ticketCompleted: req.body.ticketCompleted

    }

    updateTicket(req.user, req.body.recordId, updatedTicketObject)

    res.send(200)

})

module.exports.router = router;