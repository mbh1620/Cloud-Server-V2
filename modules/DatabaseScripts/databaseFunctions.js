//-----------------------------------------------------------------------
//                          Database Functions - Frontend
//-----------------------------------------------------------------------

function queryDatabase(databaseId, queryType, queryField, queryString, successCallback){

    if(queryType == 'Inbetween'){
        data = {
            lowerQueryString: queryString.lowerQueryString,
            upperQueryString: queryString.upperQueryString,
            queryField: queryField,
            queryType: queryType
        }
    } else {
        data = {
            queryString: queryString,
            queryField: queryField,
            queryType: queryType
        }
    }

    $.post({
        type:'POST',
        url:'/database/query/'+databaseId,
        data:data,
        success: successCallback
    })

}

function getFields(databaseId, successCallback){

    $.post({
        type:'POST', 
        url:'/database/query/getFieldsFromSchema',
        data:{
            databaseId: databaseId
        },
        success: successCallback
    })

}

function getDatabaseSchema(databaseId, successCallback){

    $.post({
        type:'POST',
        url:'/database/query/getSchema',
        data:{
            databaseId: databaseId
        },
        success: successCallback
    })

}

function changeForm(value){

    if(value == "Inbetween"){
        
        //Hide standard query string box and unhide the upper and lower limit boxes
        $('.inbetween').show()
        $('#queryString').hide()

    } else {

        //Hide upper and lower and show the standard
        $('.inbetween').hide()
        $('#queryString').show()

    }

}

function inputData(databaseId){
     //Get text value
     var jsonData = $('#jsonDataInput').val();
     //Call ajax route and then navigate to other page
     
    $.post(
         url="/database/put/"+databaseId,
         data={data:jsonData},
         success=function(){
             location.href="/database/usersdb/"
         }
     )
}

function inputRecord(databaseId, record){

    $.post(
        url="/database/put/"+databaseId,
        data={data:record},
        success=function(){
            console.log('updated successfully!')
        }
    )

}

function inputRecordCallback(databaseId, record, successCallback){

    $.post(
        url="/database/put/"+databaseId,
        data={data:record},
        success=successCallback
    )

}

function deleteDb(databaseId){

    if(confirm("Are you sure you would like to delete") == true){
        $.post(
              url="/database/delete/",
              data={databaseId:databaseId},
              success=function(){
                  location.href="/database/usersdb/"
              }
          )
      } else {
        
      }
}

function updateRecord(databaseId, recordId){

    var jsonData = $('#jsonInput').val();
    $.post(
        url=`/database/${databaseId}/updateRecord/${recordId}`,
        data={data:jsonData},
        success=function(){
            location.href="/database/usersdb/"
        }
    )

}

function getUsersDatabases(successCallback){

    $.post(
        url=`/database/usersDatabases`,
        data={},
        success=successCallback
    )

}

function populateDatabaseSelection(selectBoxId, successCallback){

    //Function used to populate a database selection box

    $(`#${selectBoxId}`).empty()

    var inputString = ""

    //Get users databases

    getUsersDatabases(function(databases){

        // console.log(databases)

        for(var i = 0; i < databases.length; i++){

            inputString += `<option value='${databases[i].databaseId}'>${databases[i].dbName}</option>`

        }

        $(`#${selectBoxId}`).append(inputString)

        successCallback()

    })
    
}
