var bodyParser = require('body-parser');
var config = require('../config');
var compression = require('compression');
var cors = require('cors');
var express = require('express');
var favicon = require('serve-favicon');
var MongoClient = require('mongodb').MongoClient;
var path = require('path');

var app = module.exports = express();
app.use(favicon(path.join(__dirname, '../favicon.ico')));
app.use(cors());
app.use(compression());
app.use(bodyParser.json({strict: false}));
app.use(bodyParser.urlencoded({extended: false}));

var host = process.env.LB_HOST || config.database.host;
var port = process.env.LB_PORT || config.database.port;
var database = process.env.LB_DB || config.database.name;
MongoClient.connect('mongodb://' + host + ':' + port + '/' + database,
    function(err, db) {
  var Todo = db.collection('todos');

  var uniqueValue = 0;

  app.put('/api/todos', function(req, res) {
    Todo.insert(req.body, function(err) {
      if (err) throw err;
      res.sendStatus(200);
    });
  });

  app.get('/api/todos', function(req, res) {
    if (req.query.content) {
      Todo.find({content: req.query.content}).toArray(function(err, docs) {
        if (err) throw err;
        res.send(JSON.stringify(docs));
      });
    } else {
      Todo.find({}).toArray(function(err, docs) {
        if (err) throw err;
        res.send(JSON.stringify(docs));
      });
    }
  });
});
