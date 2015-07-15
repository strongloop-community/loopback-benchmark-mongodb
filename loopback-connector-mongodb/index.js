var DataSource = require('loopback-datasource-juggler').DataSource;
var config = require('../config.json');
var connector = require('loopback-connector-mongodb');
var Benchmark = require('benchmark');

var host = process.env.LB_HOST || config.database.host;
var port = process.env.LB_PORT || config.database.port;
var database = process.env.LB_DB || config.database.name;
var ds = new DataSource(connector, {
  host: host,
  port: port,
  database: database
});
var Todo = ds.define('Todo', {
  content: {type: String}
});

// not critical for MongoDB, but may uncover inefficiencies in SQL connectors
// https://github.com/strongloop/loopback-connector-mongodb/pull/124/files#r28435614
var uniqVal = 0;

function resetTestState() {
  uniqVal = 0;
  Todo.destroyAll();
}

var suite = new Benchmark.Suite;
suite
  .add('create', {
    defer: true,
    fn: function(deferred) {
      Todo.create({content: 'Buy eggs, ' + (uniqVal++)}, function() {
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
      ]);
    },
    onComplete: resetTestState
  })
  .add('find with a simple filter', {
    defer: true,
    fn: function(deferred) {
      Todo.find({where: {content: 'Buy milk'}}, function() {
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
    console.log('- ' + String(event.target));
  })
  .on('complete', function() {
    Todo.destroyAll();
    process.exit();
  })
  .run({async: true});
