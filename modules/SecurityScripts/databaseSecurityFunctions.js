function editDatabasePermissions(databaseId, securityType, userList, permissionsList, successCallback){

    //Ajax POST route containing the databaseId and the 

    $.post({
        type:'POST',
        url: '/security/database/update',
        data:{
            databaseId: databaseId,
            securityType: securityType,
            userList: userList,
            permissionsList: permissionsList,
        },
        success: successCallback
    })

}