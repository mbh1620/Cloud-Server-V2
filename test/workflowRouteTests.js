var server = require('../app.js')
var chai = require('chai')
var chaihttp = require('chai-http')
let should = chai.should;
var expect = chai.expect;
var chaiFiles = require('chai-files');
var request = require('supertest');
const { ChainCondition } = require('express-validator/src/context-items/chain-condition.js');

chai.use(chaihttp)

const userCredentials = {
    "email": "WorkflowTesting@email.com",
    "password": "abcd"
  }

var authenticatedUser = request.agent(server)

before(function(done){
    //Set up a test account to use for testing
    var password = 'abcd'
        var name = 'WorkflowTesting'
        var email = 'WorkflowTesting@email.com'
        
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

describe("WORKFLOW 1 - Test POST /workflow/create route", () => {
    it('Should create a new database', (done) => {
        authenticatedUser
            .get('/workflows/create')
            .end((err, res)=> {
                res.should.have.status(200);
                done();
            })
    })
})

describe("WORKFLOW 2 - Test POST /workflow/save route", () => {
    it('Should save a new workflow', (done) => {
        authenticatedUser
            .post('/workflows/save')
            .send({
                'name':'Workflow1',
                'content': "print('hello world')" , 
                'userName':'WorkflowTesting'
            })
            .end((err, res)=> {
                res.should.have.status(200);
                done();
            })
    })
})

// describe("WORKFLOW 3 - Test POST /workflows/run", () => {
//     it('Should run a workflow', (done) => {
//         authenticatedUser
//             .post('/workflows/test')
//             .send({
//                 'workflow':'Workflow1',
//             })
//             .end((err, res)=> {
//                 res.should.have.status(200);
//                 done();
//             })
//     })
// })

describe("WORKFLOW 4 - Test POST /workflow/delete route", () => {
    it('Should delete a workflow', (done) => {
        authenticatedUser
            .post('/workflows/delete')
            .send({
                'workflow':'Workflow1',
            })
            .end((err, res)=> {
                res.should.have.status(200);
                done();
            })
    })
})

describe("WORKFLOW 4 - Test POST /workflow/delete route", () => {
    it('Should delete a workflow', (done) => {
        authenticatedUser
            .post('/workflows/delete')
            .send({
                'workflow':'Workflow1',
            })
            .end((err, res)=> {
                res.should.have.status(200);
                done();
            })
    })
})

//GET workflow-home

//GET /usersworkflows/:user/show/:name

//POST /workflows/save

//POST /workflows/run

//POST /workflows/test

describe("WORKFLOW END - Clear up accounts from workflow testing", () => {
    it('Should delete an account and remove all of the associated files with', (done) => {
        authenticatedUser
        .post('/delete-account')
        .send({
            'userName':'WorkflowTesting'
        })
        .end((err, res)=> {
            res.should.have.status(302)
            done();
        })
    })
})

