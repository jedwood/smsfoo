
//these properties are only availabe on the server, and only before they get passed to the view for rendering.
exports.hideProps = function (schema, properties) {

  schema.set('toObject', {transform : function (doc, ret, options) {
    if ('function' !== typeof doc.ownerDocument) { // don't apply to sub docs
      properties.forEach(function(p){
        if (typeof doc[p] !== "undefined") {
          delete ret[p];
        }
      });
      delete ret['__v'];
    }
  }});
};

//these properties won't be overwritten by a general "updateWith" type of merge,
//e.g. when taking req.body at face value from a PUT call
exports.protectProps = function (schema, properties) {
  schema.virtual('protectedProps').get(function () {
    return properties;
  });
};

//via https://github.com/drudge/mongoose-timestamp
//adds a virtual for createdAt since it's already built in to _id,
//and a persistent property for updatedAt
exports.timestamps = function (schema, options) {
  if (schema.path('_id')) {
    schema.add({
      updatedAt: Date
    });
    schema.virtual('createdAt')
      .get( function () {
        if (this._createdAt) return this._createdAt;
        return this._createdAt = this._id.getTimestamp();
      });
    schema.pre('save', function (next) {
      if (this.isNew) {
        this.updatedAt = this.createdAt;
      } else {
        this.updatedAt = new Date;
      }
      next();
    });
  } else {
    schema.add({
        createdAt: Date
      , updatedAt: Date
    });
    schema.pre('save', function (next) {
      if (!this.createdAt) {
        this.createdAt = this.updatedAt = new Date;
      } else {
        this.updatedAt = new Date;
      }
      next();
    });
  }
};

var mongoose  = require('mongoose');
mongoose.Schema.prototype.__proto__.updateWith = function(obj){
  for(var o in obj){
    if(o !== '_id'){
      //Compares the name of the object on the schema's tree to verify it should be set
      if(typeof(this.schema.tree[o]) !== 'undefined'){
        if(typeof(obj[o]) !== 'function'){
          if (this.protectedProps.indexOf(o) == -1) {
            if(typeof(this[o])=='boolean'){
              if((obj[o]=='true') || (obj[o]===true)){
                this[o] = true;
              } else {
                this[o] = false;
              }
            } else {
              this[o] = obj[o];
            }
            this.markModified(o);
          }
        }
      }
    }
  }
};