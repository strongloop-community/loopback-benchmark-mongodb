var MongoClient = require('mongodb').MongoClient;
var config = require('../config');
var Benchmark = require('benchmark');
var request = require('request');
var async = require('async');
var app = require('./app');

var host = process.env.LB_HOST || config.database.host;
var port = process.env.LB_PORT || config.database.port;
var database = process.env.LB_DB || config.database.name;
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

  var server;
  var url = 'http://' + config.server.host + ':' + config.server.port;
  var suite = new Benchmark.Suite;
  suite
    .on('start', function() {
      server = app.listen(config.server.port);
    })
    .add('create', {
      defer: true,
      fn: function(deferred) {
        request({
          url: url + '/api/todos',
          method: 'put',
          json: {content: 'Buy eggs' + (uniqueValue++)}
        }, function() {
          deferred.resolve();
        });
      },
      onComplete: resetTestState
    })
    .add('find', {
      defer: true,
      fn: function(deferred) {
        request(url + '/api/todos', function(err, response, body) {
          deferred.resolve();
        });
      },
      onStart: function() {
        request({
          url: url + '/api/todos',
          method: 'put',
          json: [
            {content: 'Buy eggs'},
            {content: 'Buy milk'},
            {content: 'Buy cheese'}
          ]
        });
      },
      onComplete: resetTestState
    })
    .add('find with a simple filter', {
      defer: true,
      fn: function(deferred) {
        request(url + '/api/todos?content=Buy%20milk', function(err, response, body) {
          deferred.resolve();
        });
      },
      onStart: function() {
        request({
          url: url + '/api/todos',
          method: 'put',
          json: [
            {content: 'Buy eggs'},
            {content: 'Buy milk'},
            {content: 'Buy cheese'}
          ]
        });
      },
      onComplete: resetTestState
    })
    .on('cycle', function(event) {
      console.log('- ' + String(event.target));
    })
    .on('complete', function() {
      server.close();
      db.close();
      process.exit();
    })
    .run({async: true});
});
