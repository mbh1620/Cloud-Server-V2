
function createTicket(ticketObject, successCallback){

    $.post({
        type:'POST',
        url:'/tickets/create',
        data:{

            ticketName: ticketObject.ticketName,
            ticketDetail: ticketObject.ticketDetail,
            ticketDeadline: ticketObject.ticketDeadline,
            ticketCompleted: ticketObject.ticketDone

        },
        success: successCallback
    })

}

function updateTicket(ticketObject, successCallback){

    $.post({
        type:'POST',
        url:'/tickets/edit',
        data:{
            
            recordId: ticketObject.recordId,
            ticketName: ticketObject.ticketName,
            ticketDetail: ticketObject.ticketDetail,
            ticketDeadline: ticketObject.ticketDeadline,
            ticketCompleted: ticketObject.ticketDone

        },

        success: successCallback

    })



}

