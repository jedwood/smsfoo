var mongoose  = require('mongoose');
var ENV;

exports.config = function(env) { ENV = env; };

exports.Respondent  = mongoose.model('Respondent', require('./respondent'));
exports.Survey  = mongoose.model('Survey', require('./survey'));