var mongoose = require('mongoose');
var config = require('../config');
var Benchmark = require('benchmark');

var host = process.env.LB_HOST || config.database.host;
var port = process.env.LB_PORT || config.database.port;
var database = process.env.LB_DB || config.database.name;
mongoose.connect('mongodb://' + host + ':' + port + '/' + database);

var Todo = mongoose.model('Todo', {content: String});

// not critical for MongoDB, but may uncover inefficiencies in SQL connectors
// https://github.com/strongloop/loopback-connector-mongodb/pull/124#discussion_r28435614
var uniqueValue = 0;

function resetTestState() {
  uniqueValue = 0;
  mongoose.connection.db.dropCollection('todos');
}

var suite = new Benchmark.Suite;
suite
  .add('create', {
    defer: true,
    fn: function(deferred) {
      Todo.create({
        content: 'Buy eggs' + (uniqueValue++)
      }, function() {
        deferred.resolve();
      });
    },
    onComplete: resetTestState
  })
  .add('find', {
    defer: true,
    fn: function(deferred) {
      Todo.find(function() {
        deferred.resolve();
      });
    },
    onStart: function() {
      Todo.create([
        {content: 'Buy eggs'},
        {content: 'Buy milk'},
        {content: 'Buy cheese'}
      ])
    },
    onComplete: resetTestState
  })
  .add('find with a simple filter', {
    defer: true,
    fn: function(deferred) {
      Todo.find({content: 'Buy milk'}, function() {
        deferred.resolve();
      });
    },
    onStart: function() {
      Todo.create([
        {content: 'Buy eggs'},
        {content: 'Buy milk'},
        {content: 'Buy cheese'}
      ]);
    },
    onComplete: resetTestState
  })
  .on('cycle', function(event) {
    console.log(' - ' + String(event.target));
  })
  .on('complete', function() {
    mongoose.connection.db.dropCollection('todos');
    mongoose.disconnect();
  })
  .run({async: true});
