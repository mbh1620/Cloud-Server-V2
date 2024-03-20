//-----------------------------------------------------------------------
//                    Database Security Functions - Backend
//-----------------------------------------------------------------------

var pathFunc = require("path")
var fs = require('fs-extra')
var uuid = require('uuid')
var lockfile = require('proper-lockfile')

function createDBRefDatabase(){ //Similar for Workflow Ref Database

    schemaDefinition = {
        'databaseId': 'string', //Id
        'userId':'string', //RefId
        'dbName':'string',
        'securityType':'string',
        'allowList':'object',
    }

    var fullPath = pathFunc.join(testFolder, "ReferenceDatabases")
        
    if(fs.existsSync(fullPath) == false){
        fs.mkdirSync(fullPath);
    }

    fullPath = pathFunc.join(testFolder, "ReferenceDatabases", "DatabaseREFDB.json")
    
    fs.writeFileSync(fullPath, '{"records":[]}');
    
    fullPath = pathFunc.join(testFolder, "ReferenceDatabases", "TableSchemas")
        
    if(fs.existsSync(fullPath) == false){
        fs.mkdirSync(fullPath);
    }
    
    fs.writeFileSync(fullPath+"/"+'DatabaseREFDB'+"Schema.json", JSON.stringify(schemaDefinition));

}

//Functions for create, read, update and delete records in ref databases

function putREFRecord(refDBName, recordData){

    var recordTransformed = JSON.parse(recordData)

    var outputRecord = checkAgainstREFSchema(refDBName, recordTransformed);
    
    var fullPath = pathFunc.join(testFolder, "ReferenceDatabases", refDBName+'.json')
    
    if(outputRecord == false){
        console.error("putRecord does not match the schema!");
        return 0;
    }
    
    outputRecord['recordId'] = uuid.v4()
    outputRecord['dateTime'] = new Date().toISOString();
    
    lockfile.lockSync(fullPath);
    
    var data = JSON.parse(fs.readFileSync(fullPath))
    
    data.records.push(outputRecord);
    
    data = JSON.stringify(data);
    
    fs.writeFileSync(fullPath, data);
    
    lockfile.unlockSync(fullPath);
        
}

function getREFRecord(refDBName, recordId){

    var searchKey = 'databaseId'
    var searchValue = recordId

    var fullPath = pathFunc.join(testFolder, "ReferenceDatabases", refDBName+'.json')

    if(checkRefDbExists('DatabaseREFDB')){ 

        var data = JSON.parse(fs.readFileSync(fullPath))
    
        //Using the searchKey and value
        var searchedRecord = [];
    
        let obj2 = data.records.filter((o, i) => {
            if(o[searchKey] == searchValue){
                searchedRecord.push(o)
            }
        })
    
        return searchedRecord
    
    } else { 
            
    }
}

function updateREFRecord(refDBName, recordId, updatedRecord){

    var fullPath = pathFunc.join(testFolder, "ReferenceDatabases", refDBName+'.json')

    var data = JSON.parse(fs.readFileSync(fullPath))

    console.log(updatedRecord)

    var recordTransformed = JSON.parse(updatedRecord) //Will need to add schema checking here at some point which can bypass the recordId and dateTime and possibly add a last updated dateTime.
    var outputRecord = recordTransformed

    console.log(recordTransformed)

    var index;

    let obj2 = data.records.filter((o, i) => {
        if(Object.keys(o).includes('databaseId')){
            if(o['databaseId'].includes(recordId)){      
                index = i
            }
        } else {

        }
    })

    data.records.splice(index, 1, outputRecord)

    data = JSON.stringify(data)

    fs.writeFileSync(fullPath, data);

}

function deleteREFRecord(refDBName, recordId){

    var fullPath = pathFunc.join(testFolder, "ReferenceDatabases", refDBName+'.json')

    var data = JSON.parse(fs.readFileSync(fullPath))

    var index;
    var searchedRecord

    lockfile.lockSync(fullPath);

    let obj2 = data.records.find((o, i) => {
        if(Object.keys(o).includes('databaseId')){
            if(o['databaseId'] == recordId){ 
                searchedRecord = o
                index = i
            }
        } else {

        }
    })

    data.records.splice(index,1)

    data = JSON.stringify(data);

    fs.writeFileSync(fullPath, data);

    lockfile.unlockSync(fullPath);

}

function setDbLimited(user, database, userList, permissionsList){

    if(!checkRefDbExists('DatabaseREFDB')){

        createDBRefDatabase()

    }

    var REFRecord = {

        'databaseId': database.databaseId, //Id
        'userId':user.id, //RefId
        'dbName':database.dbName,
        'securityType':'limited',
        'allowList':userList,

    }

    database['securityType'] = 'limited';
    database['allowList'] = userList;

    var baseDBObject = {

        'databaseId':'BASEDBID',
        'userId':user.id,
        'dbName':'BASEDB',
        'securityType': 'private',
        'allowList':[],
        'dataFile':`/${user.name}/Database/BASEDB.json`,
        'schemaFile':`/${user.name}/Database/TableSchemas/BASEDBSchema.json`

    }

    updateRecord(user, baseDBObject, database.databaseId, JSON.stringify(database))

    if(getREFRecord('DatabaseREFDB', database.databaseId).length != 0){

        updateREFRecord('DatabaseREFDB', database.databaseId, JSON.stringify(REFRecord))
        
    } else {
        
        putREFRecord('DatabaseREFDB', JSON.stringify(REFRecord))

    }
    
}

function setDbPrivate(user, database){

    if(!checkRefDbExists('DatabaseREFDB')){

        createDBRefDatabase()

    }

    if(getREFRecord('DatabaseREFDB', database.databaseId).length != 0){

        deleteREFRecord('DatabaseREFDB', database.databaseId)
    
    }

    database['securityType'] = 'private'

    var baseDBObject = {

        'databaseId':'BASEDBID',
        'userId':user.id,
        'dbName':'BASEDB',
        'securityType': 'private',
        'allowList':[],
        'dataFile':`/${user.name}/Database/BASEDB.json`,
        'schemaFile':`/${user.name}/Database/TableSchemas/BASEDBSchema.json`

    }

    updateRecord(user, baseDBObject, database.databaseId, JSON.stringify(database))

}

function setDbPublic(user, database, permissionsList){

    if(!checkRefDbExists('DatabaseREFDB')){

        createDBRefDatabase()

    }

    var REFRecord = {

        'databaseId': database.databaseId, //Id
        'userId':user.id, //RefId
        'dbName':database.dbName,
        'securityType':'public',
        'allowList':[],

    }

    database['securityType'] = 'public'

    var baseDBObject = {

        'databaseId':'BASEDBID',
        'userId':user.id,
        'dbName':'BASEDB',
        'securityType': 'private',
        'allowList':[],
        'dataFile':`/${user.name}/Database/BASEDB.json`,
        'schemaFile':`/${user.name}/Database/TableSchemas/BASEDBSchema.json`

    }

    updateRecord(user, baseDBObject, database.databaseId, JSON.stringify(database))

    if(getREFRecord('DatabaseREFDB', database.databaseId).length != 0){

        updateREFRecord('DatabaseREFDB', database.databaseId, JSON.stringify(REFRecord))
        
    } else {
        
        putREFRecord('DatabaseREFDB', JSON.stringify(REFRecord))

    }

}

function checkRefDbExists(refDBName){

    var fullPath = pathFunc.join(testFolder, "ReferenceDatabases", refDBName + ".json")

    if(fs.existsSync(fullPath) == true){
        return true
    } else {
        return false
    }

}

function checkAgainstREFSchema(refDBName, putRecord){

    var fullPath = pathFunc.join(testFolder, "ReferenceDatabases", "TableSchemas", refDBName + "Schema.json")

    var schemaData;

    try{
        var schemaData = JSON.parse(fs.readFileSync(fullPath))
    } catch (e) {
        // console.log(e);
        console.log("Schema is undefined!");
        schemaData = undefined
    }

    outputObject = {}

    schemaTypes = ['fileLink', 'gpsCoordinates', 'photo', 'face', 'numberPlate', 'phoneNumber', 'email', 'date', 'time'] 

    if(schemaData != undefined){
        for (const key in schemaData) {
            if(key in putRecord){
                if(schemaData[key] == 'fileLink' && typeof(putRecord[key]) == 'string'){
                    outputObject[key] = putRecord[key]
                } else if(schemaData[key] == typeof(putRecord[key])){
                    outputObject[key] = putRecord[key]
                } else if(schemaData[key] == 'photo' && typeof(putRecord[key]) == 'string'){
                    outputObject[key] = putRecord[key]
                } else if(schemaData[key] == 'date' && Date.parse(putRecord[key]).toString() != "NaN"){
                    outputObject[key] = putRecord[key]
                } else {
                    console.log(`Error ${putRecord[key]} is not a valid ${schemaData[key]}`)
                    return false
                }
            } 
        }
    }

    return outputObject;

}

function securityCheck(user, database, next) {

    if (getREFRecord('DatabaseREFDB', database.databaseId).length != 0) {

        var reference = getREFRecord('DatabaseREFDB', database.databaseId)[0]

        if (reference.securityType == 'public') {

            next()

        } else if (reference.securityType == 'limited') {

            if (reference.allowList.contains(user.id)) {

                next()

            } else {

                throw new Error("Unauthorised PUT request!")

            }

        } else {

            throw new Error("Unauthorised PUT request!")

        }

    } else {

        throw new Error("That Database Does not exist")

    }

}

module.exports = {setDbPrivate, setDbLimited, setDbPublic, createDBRefDatabase, 
putREFRecord, getREFRecord, updateREFRecord, deleteREFRecord, securityCheck};