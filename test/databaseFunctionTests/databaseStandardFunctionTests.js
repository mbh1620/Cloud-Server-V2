const { randomInt } = require("crypto");
const { putRecord, getRecord, getRecords, getUsersDatabases, 
    createDatabase, updateRecord, setDbPublic, sumElements, numberOfRecords} = require("../../routes/database/databaseFunctions");
var uuid = require('uuid');

global.testFolder;
testFolder = '/Users/matthaywood/Desktop/StorageSite/StorageSite/public/'
global.users = [];

var userObject = {

    "id": "1680879798509",
    "name": "Jane Appleseed",
    "email": "jane2012@gmail.com",
    "password": "N/A"

}

var userObject2 = {

    "id": "16808awdkjawkda98509",
    "name": "John Doe",
    "email": "john2012@gmail.com",
    "password": "N/A"

}

users.push(userObject, userObject2)

//Create a database for jane

// createDatabase(userObject, 'bankAccounts', {

//     'firstName':'string',
//     'lastName':'string',
//     'bankBalance': 'number'

// })

var databaseObject = getUsersDatabases(userObject)[3]

describe('testing the database standard functions', function(){

    it('should sum the elements in the database based on a certain field supplied to the function', function(){
        
        var elementCount = numberOfRecords(userObject, databaseObject)
        var bankBalanceTotals = sumElements(userObject, databaseObject, 'bankBalance')

        console.log(elementCount)
        console.log(bankBalanceTotals)
        
    })

})