'use strict';

var Firebase = require('firebase'),
    needle   = require('needle'),
   _         = require('lodash'),
   request   = require('request'),
   config    = require('../../config/config');

var root = new Firebase(config.development.firebase.rootRefUrl);

module.exports = function(question, cb) {
  root.child('users').on('value', function(snap) {
    var data        = snap.val(),
      expertObject  = {
        experts: []
      };

    for (var i in data) {
      if (data.hasOwnProperty(i)) {
        var skillArray = (data[i].skills + "").toLowerCase().split(',');
        var tagsMatchSkill = _.intersection(skillArray, question.tags);
        if (tagsMatchSkill.length > 0) {
          expertObject.question = question;
          expertObject.experts.push(data[i]);
          send(expertObject, function(error, status, body) {
            if (error) {
              cb(error);
            } else if (status !== 200) {
              cb(new Error('Incoming WebHook: ' + status + ' ' + body));
            } else {
              cb(null, status);
            }
          });
        } 
      }
    }
  });
}

function send(expert, cb) {
  console.log('expert: ', expert);
  var uri = ' https://yodabot.herokuapp.com/experts';

  request({
    uri: uri,
    method: 'POST',
    json: expert
  }, function(error, response, body) {
    console.log('response: ', response.statusCode);
    console.log('body: ', body);
    if (error) {
      return cb(error);
    }

    cb(null, response.statusCode, body);
  });
}