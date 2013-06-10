var mongoose  = require('mongoose'),
    Schema = mongoose.Schema,
    plugins       = require('./plugins');

var RespondentSchema = new mongoose.Schema({
  survey            : {type: Schema.Types.ObjectId, ref: 'Survey'},
  phone             : {type: String},
  currentQuestion   : {type: Object},
  responses         : {type: Object}
}, {strict: false});

RespondentSchema.index({phone:1}, {unique:false, sparse:true});
RespondentSchema.plugin(plugins.timestamps);
RespondentSchema.plugin(plugins.hideProps, ['_id']);
RespondentSchema.plugin(plugins.protectProps, ['_id', 'createdAt', 'updatedAt']);


////// ANYTHING FOR A NEW USER GOES HERE!
// RespondentSchema.pre('save', function(next){
//   if ( this.isNew) {
//     var self = this;
//   }
//   else
//   {
//     next();
//   }
// });

// RespondentSchema.pre('remove', function(next) {
//   var self = this;
//   next();
// });

module.exports = RespondentSchema;
