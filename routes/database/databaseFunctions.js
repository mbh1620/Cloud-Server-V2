
//-----------------------------------------------------------------------
//                    Database Functions - Backend (Updated and improved)
//-----------------------------------------------------------------------

var fs = require('fs-extra')
var lockfile = require('proper-lockfile')
var pathFunc = require('path')
var uuid = require('uuid')
var { fileLink, gpsCoordinates, photo, face, numberPlate, phoneNumber, email, date, time } = require('./schemaTypes')

//Database CRUD functions

function putRecord(user, database, jsonStringRecordData) {

    var outputObject;

    if (checkDatabaseExists(user, database)) {

        outputObject = writeRecordToFile(user, user.id, database, jsonStringRecordData)

    } else {

        securityCheck(user, database, function () {

            var reference = getREFRecord('DatabaseREFDB', database.databaseId)[0]
            var dbOwner = findUserById(reference.userId)

            outputObject = writeRecordToFile(dbOwner, user.id, database, jsonStringRecordData)

        })

    }

    return outputObject

}

function getRecords(user, database) {

    if (checkDatabaseExists(user, database)) {

        return getRecordsFromFile(user, database)

    } else {

        securityCheck(user, database, function () {

            var reference = getREFRecord('DatabaseREFDB', database.databaseId)[0]
            var dbOwner = findUserById(reference.userId)

            return getRecordsFromFile(dbOwner, database)

        })

    }

}

function getRecord(user, database, searchKey, searchValue) {    

    if (checkDatabaseExists(user, database)) {

        return getRecordFromFile(user, database, searchKey, searchValue)

    } else {

        securityCheck(user, database, function () {

            return getRecordFromFile(user, database, searchKey, searchValue)

        })

    }

}

function getRecordContaining(user, database, searchKey, searchValue) {

    if (checkDatabaseExists(user, database)) {

        return getRecordContainingFromFile(user, database, searchKey, searchValue)

    } else {

        securityCheck(user, database, function () {

            return getRecordContainingFromFile(user, database, searchKey, searchValue)

        })

    }

}

function getRecordInbetween(user, database) {

}

function updateRecord(user, database, recordId, updatedJsonStringRecord) {

    if (checkDatabaseExists(user, database)) {

        updateRecordToFile(user, database, recordId, updatedJsonStringRecord)

    } else {

        securityCheck(user, database, function () {

            updateRecordToFile(user, database, recordId, updatedJsonStringRecord)

        })

    }

}

function deleteRecord(user, database, recordId) {

    if (checkDatabaseExists(user, database)) {

        return deleteRecordFromFile(user, database, recordId)

    } else {

        securityCheck(user, database, function () {

            return deleteRecordFromFile(user, database, recordId)

        })

    }

}

//High level Database Functions

function createBaseDatabase(user) {

    schemaDefinition = {
        'databaseId': 'string', //Id
        'userId': 'string', //RefId
        'dbName': 'string',
        'securityType': 'string',
        'allowList': 'object',
        'dataFile': 'fileLink',
        'schemaFile': 'fileLink'
    }
    
    var fullPath = pathFunc.join(testFolder, user.name, "Database", "TableSchemas")

    if (fs.existsSync(fullPath) == false) {
        fs.mkdirSync(fullPath);
    }

    fs.writeFileSync(fullPath + "/" + 'BASEDB' + "Schema.json", JSON.stringify(schemaDefinition));

    baseDatabaseObject = {

        'databaseId': 'BASEDBID',
        'userId': user.id,
        'dbName': 'BASEDB',
        'securityType': 'private',
        'allowList': [],
        'dataFile': `/${user.name}/Database/BASEDB.json`,
        'schemaFile': `/${user.name}/Database/TableSchemas/BASEDBSchema.json`

    }

    var fullPath = pathFunc.join(testFolder, user.name, "Database", "BASEDB.json")

    fs.writeFileSync(fullPath, '{"records":[]}');

    writeRecordToFile(user, user.id, baseDatabaseObject, JSON.stringify(baseDatabaseObject))

}

function createDatabase(user, tableName, schemaDefinition) {

    var baseDBPath = pathFunc.join(testFolder, user.name, "Database", "BASEDB.json")

    if (fs.existsSync(baseDBPath) == false) {

        createBaseDatabase(user)

    }

    var dataFilePath = pathFunc.join("/", user.name, "Database", tableName + ".json")
    var schemaFilePath = pathFunc.join("/", user.name, "Database", "TableSchemas", tableName + "Schema.json")

    databaseObject = {
        
        'databaseId': uuid.v4(),            //Id
        'userId': user.id,                   //RefId
        'dbName': tableName,
        'securityType': 'private',
        'allowList': [],
        'dataFile': dataFilePath,
        'schemaFile': schemaFilePath
        
    }

    //Create the data and schema file

    fs.writeFileSync(pathFunc.join(testFolder, schemaFilePath), JSON.stringify(schemaDefinition));
    fs.writeFileSync(pathFunc.join(testFolder, dataFilePath), '{"records":[]}');

    //Put the record into the base database

    baseDatabaseObject = {

        'databaseId': 'BASEDBID',
        'userId': user.id,
        'dbName': 'BASEDB',
        'securityType': 'private',
        'allowList': [],
        'dataFile': `${user.name}/Database/BASEDB.json`,
        'schemaFile': `${user.name}/Database/TableSchemas/BASEDBSchema.json`

    }

    putRecord(user, baseDatabaseObject, JSON.stringify(databaseObject))

    return databaseObject

}

function deleteDatabase(user, database) {

    if (checkDatabaseExists(user, database)) {

        return deleteDatabaseFromBaseDb(user, database)

    } else {

        return 0

    }

}

function getDatabaseObjectByName(user, databaseName){

    //Function to be used for getting standard databases such as Security, Workflows etc..

    var databases = getUsersDatabases(user)

    var outputDatabases = []

    databases.filter(obj => {
        if(obj.dbName === databaseName){
            outputDatabases.push(obj)
        }
    })

    return outputDatabases

}

function getDatabase(user, database){

    var baseDatabaseObject = {

        'databaseId': 'BASEDBID',
        'userId': user.id,
        'dbName': 'BASEDB',
        'securityType': 'private',
        'allowList': [],
        'dataFile': `${user.name}/Database/BASEDB.json`,
        'schemaFile': `${user.name}/Database/TableSchemas/BASEDBSchema.json`

    }

    return getRecord(user, baseDatabaseObject, 'databaseId', database.databaseId)[0]

}

function getSchemaFields(user, database) {

    var database = getDatabase(user, database)

    var schema = JSON.parse(fs.readFileSync(pathFunc.join(testFolder, database.schemaFile)))

    return Object.keys(schema)

}

function getSchema(user, database){

    var database = getDatabase(user, database)
    
    var schema = JSON.parse(fs.readFileSync(pathFunc.join(testFolder, database.schemaFile)))
    
    return schema

}

function updateSchema(user, database, updatedSchema) {

    if (checkDatabaseExists(user, database)) {

        var fullPath = pathFunc.join(testFolder, database.schemaFile)

        fs.writeFileSync(fullPath, updatedSchema);

    } else {

        //Make this only available to the owner for now.

    }

}

function checkAgainstSchema(user, database, parsedRecord) {

    var fullPath = pathFunc.join(testFolder, database.schemaFile)

    var parsedSchemaData = JSON.parse(fs.readFileSync(fullPath))

    var outputObject = {}

    for (const key in parsedSchemaData) {

        switch (parsedSchemaData[key]) {

            case 'fileLink':
                if (new fileLink(parsedRecord[key])) {
                    outputObject[key] = parsedRecord[key]
                    break;
                } else {
                    console.log(key, ' : ', parsedRecord[key], 'is not a fileLink!')
                    return false;
                }
            case 'gpsCoordinates':
                if (new gpsCoordinates(parsedRecord[key])) {
                    outputObject[key] = parsedRecord[key]
                    break;
                } else {
                    return false;
                }
            case 'photo':
                if (new photo(parsedRecord[key])) {
                    outputObject[key] = parsedRecord[key]
                    break;
                } else {
                    return false;
                }
            case 'face':
                if (new face(parsedRecord[key])) {
                    outputObject[key] = parsedRecord[key]
                    break;
                } else {
                    return false;
                }
            case 'numberPlate':
                if (new numberPlate(parsedRecord[key])) {
                    outputObject[key] = parsedRecord[key]
                    break;
                } else {
                    return false;
                }
            case 'phoneNumber':
                if (new phoneNumber(parsedRecord[key])) {
                    outputObject[key] = parsedRecord[key]
                    break;
                } else {
                    return false;
                }
            case 'email':
                if (new email(parsedRecord[key])) {
                    outputObject[key] = parsedRecord[key]
                    break;
                } else {
                    return false;
                }
            case 'date':
                if (new date(parsedRecord[key])) {
                    outputObject[key] = parsedRecord[key]
                    break;
                } else {
                    return false;
                }
            case 'time':
                if (new time(parsedRecord[key])) {
                    outputObject[key] = parsedRecord[key]
                    break;
                } else {
                    return false;
                }
            case 'string':
                if (typeof (parsedRecord[key]) == 'string') {
                    outputObject[key] = parsedRecord[key]
                    break;
                } else {
                    console.log(key, ' : ', parsedRecord[key], 'is not a string!')
                    return false;
                }
            case 'number':
                if (typeof (parsedRecord[key]) == 'number') {
                    outputObject[key] = parsedRecord[key]
                    break;
                } else {
                    return false;
                }
            case 'object':
                if(typeof (parsedRecord[key]) == 'object') {
                    outputObject[key] = parsedRecord[key]
                    break;
                } else {
                    return false
                }
            case 'boolean':
                if(typeof(parsedRecord[key]) == 'boolean') {
                    outputObject[key] = parsedRecord[key]
                    break;
                } else {
                    console.log(key, ' : ', parsedRecord[key], 'is not a boolean!')
                    return false
                }
        }
    }

    return outputObject;

}

function getUsersDatabases(user) {

    var baseDBPath = pathFunc.join(testFolder, `/${user.name}/Database/BASEDB.json`)

    if (fs.existsSync(baseDBPath) == false) {

        createBaseDatabase(user)

    }

    baseDatabaseObject = {

        'databaseId': 'BASEDBID',
        'userId': user.id,
        'dbName': 'BASEDB',
        'securityType': 'private',
        'allowList': [],
        'dataFile': `/${user.name}/Database/BASEDB.json`,
        'schemaFile': `/${user.name}/Database/TableSchemas/BASEDBSchema.json`

    }

    return getRecordsFromFile(user, baseDatabaseObject)

}

function checkDatabaseExists(user, database) {
   
    var usersDatabases = getUsersDatabases(user)

    /*

    This could be done faster by keeping the databaseId as a key to the databaseRecord, 
    however we are not worried about speed to this level at this point.
    
    */

    if(database == undefined){
        return false
    }

    for (var i = 0; i < usersDatabases.length; i++) {
        if (database.databaseId == usersDatabases[i].databaseId) {
            return true
        }
    }

    return false
}

function writeRecordToFile(user, authorId, database, jsonStringRecordData) {

    var parsedRecord = JSON.parse(jsonStringRecordData)
    
    var outputRecord = checkAgainstSchema(user, database, parsedRecord)

    if(outputRecord == false){
        console.error("Record does not match the schema!")
        return 0
    }

    outputRecord['recordId'] = uuid.v4()
    outputRecord['dateTime'] = new Date().toISOString();
    outputRecord['authorId'] = authorId

    var fullPath = pathFunc.join(testFolder, database.dataFile)

    lockfile.lockSync(fullPath)

    var data = JSON.parse(fs.readFileSync(fullPath))

    data.records.push(outputRecord);

    data = JSON.stringify(data)

    fs.writeFileSync(fullPath, data);

    lockfile.unlockSync(fullPath)

    return outputRecord

}

function getRecordsFromFile(user, database) {

    var fullPath = pathFunc.join(testFolder, database.dataFile)

    var data = JSON.parse(fs.readFileSync(fullPath))

    return data.records

}

function getRecordFromFile(user, database, searchKey, searchValue) {

    var fullPath = pathFunc.join(testFolder, database.dataFile)

    var data = JSON.parse(fs.readFileSync(fullPath))

    var searchedRecord = [];

    let obj2 = data.records.filter((o, i) => {
        if (o[searchKey] == searchValue) {
            searchedRecord.push(o)
        }
    })

    return searchedRecord

}

function getRecordContainingFromFile(user, database, searchKey, searchValue) {

    var fullPath = pathFunc.join(testFolder, database.dataFile)

    var data = JSON.parse(fs.readFileSync(fullPath))

    var searchedRecord = []

    let obj2 = data.records.filter((o, i) => {
        if (Object.keys(o).includes(searchKey)) {
            if (o[searchKey].includes(searchValue)) {
                searchedRecord.push(o)
            }
        } else {

        }
    })

    return searchedRecord

}

function updateRecordToFile(user, database, recordId, jsonStringRecordData) {

    var fullPath = pathFunc.join(testFolder, database.dataFile)
    var parsedUpdatedRecord = JSON.parse(jsonStringRecordData)

    var dataRecordId = parsedUpdatedRecord['recordId']
    var dateTime = parsedUpdatedRecord['dateTime']
    var authorId = parsedUpdatedRecord['authorId']

    delete parsedUpdatedRecord.recordId
    delete parsedUpdatedRecord.dateTime
    delete parsedUpdatedRecord.authorId

    var recordTransformed = checkAgainstSchema(user, database, parsedUpdatedRecord)
    var outputRecord = recordTransformed

    if(outputRecord == false){
        console.error("The updated Record does not match the schema!")
        return 0
    }

    outputRecord['recordId'] = dataRecordId
    outputRecord['dateTime'] = dateTime
    outputRecord['authorId'] = authorId

    var data = JSON.parse(fs.readFileSync(fullPath))
    var index;

    lockfile.lockSync(fullPath);

    let obj2 = data.records.filter((o, i) => {
        if (Object.keys(o).includes('recordId')) {
            if (o['recordId'].includes(recordId)) {
                index = i
            }
        } else {

        }
    })

    data.records.splice(index, 1, outputRecord)

    data = JSON.stringify(data)

    fs.writeFileSync(fullPath, data);

    lockfile.unlockSync(fullPath);

}

function deleteRecordFromFile(user, database, recordId) {

    var fullPath = pathFunc.join(testFolder, database.dataFile)
    var data = JSON.parse(fs.readFileSync(fullPath))

    lockfile.lockSync(fullPath);

    let obj2 = data.records.filter((o, i) => {
        if (Object.keys(o).includes('recordId')) {
            if (o['recordId'] == recordId) {            
                data.records.splice(i, 1)
            }
        } else {
            //Not Found Record
        }
    })

    data = JSON.stringify(data);

    fs.writeFileSync(fullPath, data);

    lockfile.unlockSync(fullPath);

}

function deleteDatabaseFromBaseDb(user, database) {

    baseDatabaseObject = {

        'databaseId': 'BASEDBID',
        'userId': user.id,
        'dbName': 'BASEDB',
        'securityType': 'private',
        'allowList': [],
        'dataFile': `/${user.name}/Database/BASEDB.json`,
        'schemaFile': `/${user.name}/Database/TableSchemas/BASEDBSchema.json`

    }

    var database = getRecord(user, baseDatabaseObject, 'databaseId', database.databaseId)[0]

    deleteRecordFromFile(user, baseDatabaseObject, database.recordId)

    var dataFilePath = database['dataFile']
    var schemaFilePath = database['schemaFile']

    fs.unlinkSync(pathFunc.join(testFolder, dataFilePath))
    fs.unlinkSync(pathFunc.join(testFolder, schemaFilePath))

}

function findUserById(userId) {

    var theUser = users.find(user => user.id === userId)

    return theUser
}

//Database Security Functions

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

    var recordTransformed = JSON.parse(updatedRecord) //Will need to add schema checking here at some point which can bypass the recordId and dateTime and possibly add a last updated dateTime.
    var outputRecord = recordTransformed

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

    updateRecord(user, baseDBObject, database.recordId, JSON.stringify(database))

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

    updateRecord(user, baseDBObject, database.recordId, JSON.stringify(database))

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

    updateRecord(user, baseDBObject, database.recordId, JSON.stringify(database))

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

function numberOfRecords(user, database){

    return getRecordsFromFile(user, database).length

}

function sumElements(user, database, databaseFieldToSum){

    //The database field must be numerical

    //Is database Larger than 10000 elements?

    var sum = 0;

    var records = getRecordsFromFile(user, database)

    var schema = getSchema(user, database)

    if(schema[databaseFieldToSum] != 'number'){

        return 0;

    }

    for(var i = 0; i < records.length; i++){

        sum += records[i][databaseFieldToSum]

    }

    return sum;

}

module.exports = { getUsersDatabases, createDatabase, deleteDatabase, 
    putRecord, getRecords, getRecord, getRecordContaining, updateRecord, 
    deleteRecord, getSchema, getSchemaFields, updateSchema, checkDatabaseExists, getDatabaseObjectByName,
    getDatabase, setDbPrivate, setDbLimited, setDbPublic, createDBRefDatabase, putREFRecord, 
    getREFRecord, updateREFRecord, deleteREFRecord, securityCheck, sumElements, numberOfRecords}
