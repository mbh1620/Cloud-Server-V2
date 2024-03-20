var server = require('../app.js')
var chai = require('chai')
var chaihttp = require('chai-http')
let should = chai.should;
var expect = chai.expect;
var chaiFiles = require('chai-files');
var request = require('supertest')

var {createFileCrawler, updateCrawler, deleteCrawler} = require('../routes/crawler/crawlerFunctions')

const userCredentials = {
    "email": "JohnDoe3@email.com",
    "password": "abcd",
  }
var userId;
var authenticatedUser = request.agent(server)
var recordId;

var crawlerName = 'crawler1'

before(function(done){
    //Set up a test account to use for testing
    var password = 'abcd'
    var name = 'JohnDoe3'
    var email = 'JohnDoe3@email.com'
        
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

describe("CRAWLER 1 - Test Create Function", () => {
    it('Should create a new crawler', (done) => {
        //Create a crawler
        authenticatedUser
        .post('/crawlers/create')
        .send({
            'crawlerType':'file',
            'crawlerName':crawlerName,
            'startingUrl':undefined,
            'maxNumberOfLevels':5,
            'outputType':undefined,
            'codeBlock': `

            import time

            time.sleep(3)

            print("Hello World")`

        }).end((err, res) => {
            res.should.have.status(302);
            done();
        })
    })
})

describe("CRAWLER 2 - Test Edit Function", () => {
    it('Should edit an existing crawler', (done) => {
        done();
    })
})

describe("CRAWLER 3 - Test Delete Function", () => {
    it('Should delete an existing crawler', (done) => {
        authenticatedUser
        .post('/crawlers/delete')
        .send({
            'crawlerName':crawlerName
        }).end((err, res) => {
            res.should.have.status(200);
            done();
        })
    })
})

//Delete The test account after completion of testing

describe("MAIN 5 - Test POST /delete-account route", () => {
    it('Should delete an account and remove all of the associated files with', (done) => {
        authenticatedUser
        .post('/delete-account')
        .send({
            'userName':'JohnDoe3'
        })
        .end((err, res)=> {
            res.should.have.status(302)
            done();
        })
    })
})