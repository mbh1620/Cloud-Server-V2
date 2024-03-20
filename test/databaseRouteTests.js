var server = require('../app.js')
var chai = require('chai')
var chaihttp = require('chai-http')
let should = chai.should;
var expect = chai.expect;
var chaiFiles = require('chai-files');
var request = require('supertest');

const userCredentials = {
    "email": "JohnDoe2@email.com",
    "password": "abcd",
  }
var userId;
var authenticatedUser = request.agent(server)
var recordId;

var databaseName = 'testTable1'

before(function(done){
    //Set up a test account to use for testing
    var password = 'abcd'
    var name = 'JohnDoe2'
    var email = 'JohnDoe2@email.com'
        
        chai.request(server)
            .post('/register')
            .send({
                password:password,
                name: name, 
                email: email,
            })
            .end((err, res)=> {
                res.should.have.status(200);
                done();
            })
})

beforeEach(function(done){
    authenticatedUser
    .post('/login')
    .set('Connection', 'keep-alive')
    .send(userCredentials)
    .end(function(err, res){
        res.should.have.status(302)
        done()
    })
})

describe("DATABASE 1 - Test POST /database/create route", () => {
    it('Should create a new database', (done) => {
        authenticatedUser
            .post('/database/create')
            .send({
                'userId':getUserId(userCredentials.email),
                'tableName': databaseName,
                'schemaDefinition': '{"firstName":"string","lastName":"string","age":"number"}'
            })
            .end((err, res)=> {
                res.should.have.status(302);
                done();
            })
    })
})

describe("DATABASE 2 - TEST PUT /database/put route", ()=>{
    var data = JSON.stringify({'firstName':'Matthew', 'lastName':'Haywood', 'age':24})
    it('should put a record into the database', (done)=>{
        authenticatedUser
        .post(`/database/put/${databaseName}`)
        .send({
            data:data
        })
        .end((err, res)=>{
            res.should.have.status(200)
            done()
        })
    })
})

describe("DATABASE 3 - TEST String Contains QUERY route", ()=>{
    it('should put a record into the database', (done)=>{
        authenticatedUser
        .post(`/database/query/${databaseName}`)
        .send({
            'queryType':'String Contains',
            'queryField':'firstName',
            'queryString':'Matthew'
        })
        .end((err, res)=>{
            recordId = res._body.record[0].recordId
            firstName = res._body.record[0].firstName
            expect(firstName).to.equal('Matthew')
            res.should.have.status(200)
            done()
        })
    })
})

describe("DATABASE 4 - TEST String Match QUERY route", ()=>{
    it('should put a record into the database', (done)=>{
        authenticatedUser
        .post(`/database/query/${databaseName}`)
        .send({
            'queryType':'String Match',
            'queryField':'recordId',
            'queryString':recordId
        })
        .end((err, res)=>{
            res.should.have.status(200)
            firstName = res._body.record[0].firstName
            expect(firstName).to.equal('Matthew')
            done()
        })
    })
})

//Update Record Route
describe("DATABASE 5 - TEST UPDATE RECORD /database/:databaseName/updateRecord/:recordId route", ()=>{
    it('should update a record', (done)=>{
        
        authenticatedUser
        .post(`/database/${databaseName}/updateRecord/${recordId}`)
        .send({
            updatedRecord:{
                recordName: 'New Record',
                recordId: recordId
            }
        })
        .end((err, res)=>{
            res.should.have.status(200)
            done()
        })
    })
})

//Delete Record Route

describe("DATABASE 6 - TEST DELETE RECORD /database/deleteRecord/:recordId", ()=>{
    it('The Record with the correct recordId should be deleted', (done)=>{
        authenticatedUser
        .post(`/database/deleteRecord/${recordId}`)
        .send({
            databaseName: databaseName
        })
        .end((err, res)=>{
            res.should.have.status(200)
            done()
        })
    })
})

//Delete Database Route

describe("MAIN 5 - Test POST /delete-account route", () => {
    it('Should delete an account and remove all of the associated files with', (done) => {
        authenticatedUser
        .post('/delete-account')
        .send({
            'userName':'JohnDoe2'
        })
        .end((err, res)=> {
            res.should.have.status(302)
            done();
        })
    })
})

function getUserId(email){
    var user = users.find(user => user.email === email)
    return user.id
}