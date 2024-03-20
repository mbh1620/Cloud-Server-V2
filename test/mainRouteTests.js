var server = require('../app.js')
var chai = require('chai')
var chaihttp = require('chai-http')
let should = chai.should();
var expect = chai.expect();
var chaiFiles = require('chai-files');
var request = require('supertest');

chai.use(chaihttp)

const userCredentials = {
    "email": "JohnDoe@email.com",
    "password": "abcd"
  }

var authenticatedUser = request.agent(server)

before(function(done){
    //Set up a test account to use for testing
    var password = 'abcd'
        var name = 'JohnDoe'
        var email = 'JohnDoe@email.com'
        
        chai.request(server)
            .post('/register')
            .send({
                password:password,
                name: name, 
                email: email
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

describe("MAIN 1 - Test GET / route", () => {
    it('Should return index page', (done) => {
        chai.request(server)
            .get('/')
            .end((err, res)=> {
                res.should.have.status(200);
                done();
            })
    })
})

describe("MAIN 2 - Test GET /register route", () => {
    it('Should return index page', (done) => {
        chai.request(server)
            .get('/register')
            .end((err, res)=> {
                res.should.have.status(200);
                done();
            })
    })
})

describe("MAIN 3 - Test GET /unauthorized route", () => {
    it('Should return index page', (done) => {
        chai.request(server)
            .get('/unauthorized')
            .end((err, res)=> {
                res.should.have.status(200);
                done();
            })
    })
})

describe("MAIN 4 - Test POST /login route", () => {
    it('Should login to the account created at the start of the testing', (done) => {
        
        var password = 'abcd'
        var email = 'JohnDoe@email.com'
        
        chai.request(server)
            .post('/login')
            .send({
                password:password,
                email: email,
                // provider: 'local'
            })
            .end((err, res)=> {
                res.should.have.status(200);
                done();
            })
    })
})

describe("MAIN 5 - Test POST /delete-account route", () => {
    it('Should delete an account and remove all of the associated files with', (done) => {
        authenticatedUser
        .post('/delete-account')
        .send({
            'userName':'JohnDoe'
        })
        .end((err, res)=> {
            res.should.have.status(302)
            done();
        })
    })
})

