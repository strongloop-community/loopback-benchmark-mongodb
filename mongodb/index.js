var MongoClient = require('mongodb').MongoClient;
var config = require('../config');
var Benchmark = require('benchmark');

var host = process.env.LB_HOST || config.host;
var port = process.env.LB_PORT || config.port;
var database = process.env.LB_DB || config.db;
MongoClient.connect('mongodb://' + host + ':' + port + '/' + database,
    function(err, db) {
  var Todo = db.collection('todos');

  // not critical for MongoDB, but may uncover inefficiencies in SQL connectors
  // https://github.com/strongloop/loopback-connector-mongodb/pull/124#discussion_r28435614
  var uniqueValue = 0;

  function resetTestState() {
    uniqueValue = 0;
    Todo.drop();
  }

  var suite = new Benchmark.Suite;
  suite
    .add('create', {
      defer: true,
      fn: function(deferred) {
        Todo.insert({
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
        Todo.find({}).toArray(function() {
          deferred.resolve();
        });
      },
      onStart: function() {
        Todo.insert([
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
        Todo.find({content: 'Buy milk'}).toArray(function() {
          deferred.resolve();
        });
      },
      onStart: function() {
        Todo.insert([
          {content: 'Buy eggs'},
          {content: 'Buy milk'},
          {content: 'Buy cheese'}
        ]);
      },
      onComplete: resetTestState
    })
    .on('cycle', function(event) {
      console.log('- ' + String(event.target));
    })
    .on('complete', function() {
      Todo.drop();
      db.close();
    })
    .run({async: true});
});
