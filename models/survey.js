var mongoose  = require('mongoose'),
    Schema = mongoose.Schema,
    plugins       = require('./plugins');

var SurveySchema = new mongoose.Schema({
  hash              : {type: String},
  nickname          : {type: String},
  phone             : {type: String},
  apiKey            : {type: String},
  subdomain         : {type: String}
}, {strict: true});

SurveySchema.index({nickname:1}, {unique:false, sparse:true});
SurveySchema.plugin(plugins.timestamps);
SurveySchema.plugin(plugins.hideProps, ['_id']);
SurveySchema.plugin(plugins.protectProps, ['_id', 'createdAt', 'updatedAt']);


////// ANYTHING FOR A NEW USER GOES HERE!
// SurveySchema.pre('save', function(next){
//   if ( this.isNew) {
//     var self = this;
//   }
//   else
//   {
//     next();
//   }
// });

// SurveySchema.pre('remove', function(next) {
//   var self = this;
//   next();
// });

module.exports = SurveySchema;
