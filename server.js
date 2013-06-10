var express  = require('express'),
    config   = require('nconf'),
    survey   = require('./survey'),
    wu       = require('wufoo'),
    twilio   = require('twilio'),
    mongoose = require('mongoose'),
    app      = express();

config.argv().env().file({ file: './config.json' });
config.defaults({'PORT': 3000});
survey.setConfig(config);

mongoose.connect(config.get('MONGO_URL'));
var db = mongoose.connection;
db.on('error', console.error.bind(console, 'mongodb connection error:'));
db.once('open', function() {
  console.log("Successful mongoDB connection");
});

app.configure(function(){
  app.set('views', __dirname + '/views');
  app.set('view engine', 'jade');
  app.use(passConfig);
  app.set('port', config.get('PORT'));
  app.use(express.bodyParser());
  app.use(express.methodOverride());
  app.use(app.router);
  app.use(express.static(__dirname + '/public'));
});

app.configure('development', function(){
  app.use(express.logger('dev'));
  app.use(express.errorHandler());
});

app.get('/', function(req, res) {
  res.render('index');
});

app.post('/wuforms', function(req, res) {
  wu.config(req.body.apiKey, req.body.subdomain);
  wu.forms(function(err, wuRes) {
    if (err) return res.send(401);
    res.send(wuRes.Forms);
  });
});

app.post('/smsify', survey.create);

app.post('/start', survey.start);

app.post('/incoming', survey.incoming);


function passConfig(req, res, next) {
  req.config = config;
  next();
}

app.listen(app.get('port'), function(){
  console.log("Node.js wufoo-sms listening on port " + config.get('PORT') + ', running in ' + app.settings.env + " mode, Node version is: " + process.version);
});
