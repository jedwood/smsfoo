var models = require('./models'),
    twilio = require('twilio'),
    wu     = require('wufoo'),
    config;

var setConfig = function(conf) {
  config = conf;
};

var create = function(req, res) {
  wu.config(req.body.apikey, req.body.subdomain);
  req.body.phone = req.config.get('TWIL_PHONE');
  models.Survey.create(req.body, function(err) {
    if (err) return res.send(err);
    res.send({phone: req.config.get('TWIL_PHONE'), nickname:req.body.nickname});
  });
};

var start = function(req, res) {
  if (!req.body.phone) return res.status(404).send({error: "not a valid phone number"});
  if (!req.body.nickname) return res.status(404).send({error: "not a valid survey nickname"});
  getNextQuestion(req.body.nickname, 'EntryId', function(survey, nextQ, field) {
    models.Respondent.create({survey:survey, currentQuestion:{ID:field.ID}, phone:req.body.phone}, function(err) {
      if (req.fromPhone) {
        var twiml = new twilio.TwimlResponse();
        twiml.sms(nextQ);
        res.type('xml').send(twiml.toString());
      } else {
        sendsms({to:req.body.phone, from:survey.phone, body:nextQ}, function(err, smsRes) {
          if (err) return res.status(404).send(err);
          res.send(200);
        });
      }
    });
  });
};

var incoming = function(req, res) {
  if (!req.body.AccountSid || req.body.AccountSid.length !== 34) return res.send(401);
  var twiml = new twilio.TwimlResponse();

  //Now check if we're already in progress
  models.Respondent.findOne({phone:req.body.From}, function(err, peep) {
    if (peep && peep.currentQuestion) {
      saveResponse(req.body, function(peep){
        getNextQuestion(peep.survey.nickname, peep.currentQuestion.ID, function(survey, q, field){
          if (survey && q) {
            peep.currentQuestion = field;
            peep.markModified('currentQuestion');
            peep.save(function(err) {
              twiml.sms(q);
              res.type('xml').send(twiml.toString());
            });
          } else {
            saveToWufoo(peep, function(err){
              if (err) res.status(500).send(err);
              peep.remove();
              twiml.sms("All done, thanks!");
              res.type('xml').send(twiml.toString());
            });
          }
        });
      });
    } else {
      models.Survey.findOne({nickname: req.body.Body.toLowerCase()}, function(err, surv) {
        if (surv) {
          req.body.phone = req.body.From;
          req.body.nickname = surv.nickname;
          req.fromPhone = true;
          start(req, res);
        } else {
          twiml.sms("Sorry, we can't find a survey called " + req.body.Body);
          res.type('xml').send(twiml.toString());
        }
      });
    }
  });
};

var sendsms = function(smsObj, cb) {
  var twilAuth = twilio(config.get('TWIL_ACCOUNT_SID'), config.get('TWIL_AUTH_TOKEN'));
  twilAuth.sms.messages.post(smsObj, function(err, resp) {
    if (!err) {
      cb(null, {status: resp.status});
    } else {
      cb(err);
    }
  });
};

function saveToWufoo(peep, cb) {
  wu.config(peep.survey.apiKey, peep.survey.subdomain);
  wu.submit(peep.survey.hash, peep.responses, cb);
}

function saveResponse(sms, cb) {
  models.Respondent.findOne({phone:sms.From}).populate('survey').exec(function (err, peep) {
    if (typeof peep.responses == 'undefined' || peep.responses === null) {
      peep.responses = {};
    }
    if (peep.currentQuestion.Choices) {
      var qInd = parseInt(sms.Body, 10) - 1;
      peep.responses[peep.currentQuestion.ID] = peep.currentQuestion.Choices[qInd].Label;
    } else {
      peep.responses[peep.currentQuestion.ID] = sms.Body;
    }
    peep.markModified('responses');
    cb(peep);
  });
}

var getNextQuestion = function(nickname, lastField, cb) {
  models.Survey.findOne({nickname:nickname}, function(err, survey) {
    wu.config(survey.apiKey, survey.subdomain);
    wu.fields(survey.hash, function(err, wuRes) {
      var qObj = findNextField(lastField, wuRes.Fields);
      if (qObj) {
        var q = qObj.Title;
        if (qObj.Choices) {
          var trailingBit = '. Enter ';
          for (var i=0; i<qObj.Choices.length; i++) {
            if (i === qObj.Choices.length - 1) {
              q+= " or";
              trailingBit += 'or ' + (i+1);
            } else {
              trailingBit += (i+1) + ', ';
            }
            q += " " + (i+1) + ") " + qObj.Choices[i].Label;
          }
          q += trailingBit;
        }
        cb(survey, q, qObj);
      } else {
        cb(false);
      }
    });
  });
};

function findNextField(curField, wuFields) {
  var nextField = false;
  var acceptableTypes = ["text", "textarea", "radio", "number", "select"];
  while (wuFields.length) {
    var leField = wuFields.shift();
    if (leField.ID === curField) {
      if (wuFields.length) {
        var candidate = wuFields[0];
        if (acceptableTypes.indexOf(candidate.Type) != -1) nextField = candidate;
      }
    }
  }
  return nextField;
}

module.exports.setConfig = setConfig;
module.exports.start = start;
module.exports.incoming = incoming;
module.exports.create = create;
