// These tests aren't very portable-- they require some specific seed data.

var should = require('chai').should(),
    supertest = require('supertest'),
    api = supertest('http://smsfoo.com');

describe('POST /start', function() {

  it('errors on missing "to" phone number', function(done) {
    var smsData = {nickname:"pizza"};
    api.post('/start')
    .send(smsData)
    .expect('Content-Type', /json/)
    .expect(404)
    .end(function(err, res) {
      if (err) return done(err);
      res.body.error.should.equal("not a valid phone number");
      done();
    });
  });

  it('sends the first question', function(done) {
    var smsData = {phone:"+17732062234", nickname:"pizza"};
    api.post('/start', smsData)
    .send(smsData)
    .expect(200)
    .end(function(err, res) {
      if (err) return done(err);
      done();
    });
  });

});

describe('POST /incoming', function() {

  it('errors if not valid AccountSid included', function(done) {
    var smsData = {Body: "start", From:"+7732062234", To:"+13128001576"};
    api.post('/incoming')
    .send(smsData)
    .expect(401)
    .end(function(err, res) {
      if (err) return done(err);
      done();
    });
  });

  it('adds a response', function(done) {
    var smsData = {Body: "Jed", From:"+17732062234", To:"+13128001576", AccountSid:'0123456789012345678901234567891234'};
    api.post('/incoming')
    .send(smsData)
    .expect('Content-Type', /xml/)
    .end(function(err, res) {
      if (err) return done(err);
      //res.text.should.equal('<?xml version="1.0" encoding="UTF-8"?><Response><Say>Welcome to Twilio!</Say></Response>');
      done();
    });
  });

});

