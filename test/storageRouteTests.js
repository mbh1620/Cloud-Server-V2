var server = require('../app.js')
var chai = require('chai')
var chaihttp = require('chai-http')
let should = chai.should();
var expect = chai.expect();
var chaiFiles = require('chai-files');

chai.use(chaihttp)

//TEST STORAGE GET ROUTES

describe("STORAGE 1 - Test GET /storage-home route", () => {
    it('Should return the page for storage home', (done) => {
        chai.request(server)
            .get('/storage-home')
            .end((err, res)=> {
                res.should.have.status(200);
                done();
            })
    })
})

