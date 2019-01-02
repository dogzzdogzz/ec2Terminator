'use strict';

var AWS = require('aws-sdk');
AWS.config.update({region: process.env.AWS_REGION});
var request = require('request');
var ec2 = new AWS.EC2({apiVersion: '2016-11-15'});
var params = {
  Filters: [
    {
      Name: 'instance-state-code',
      Values: ["16"]  // select running instances only
      // 0 (pending), 16 (running), 32 (shutting-down), 48 (terminated), 64 (stopping)
    },
    {
      Name: 'tag:serverType', // select matched serverType instances only
      Values: [process.env.SERVER_TYPE]
    }
  ]
};

module.exports.ec2Terminator = (event, context, callback) => {
  ec2.describeInstances(params, function(err, data) {
    if (err) {
      console.log("Error", err.stack);
    } else {
      for(let instance of data["Reservations"]) {
        console.log(instance)
        var featureBranch = null
        var repoOwner = null
        var repoName = null
        for(let tag of instance["Instances"][0]["Tags"]) {
          console.log(instance)
          if (tag['Key'] === 'featureBranch') {
            featureBranch = tag["Value"]
          } else if (tag['Key'] === 'repoOwner') {
            repoOwner = tag["Value"]
          } else if (tag['Key'] === 'repoName') {
            repoName = tag["Value"]
          }
          if (featureBranch && repoOwner && repoName) {
            var options = {
              url: `https://api.github.com/repos/${repoOwner}/${repoName}/commits/${featureBranch}`,
              headers: {
                'User-Agent': 'request'
              }
            };
            (function(instance, featureBranch, repoOwner, repoName) {
              request(options, function(error, response, body) {
                if (!error && response.statusCode == 200) {
                  const info = JSON.parse(body);
                  var commitTime = new Date(info['commit']['committer']['date']);
                  var currentTime = new Date();
                  var diffTime = currentTime - commitTime;
                  var diffDay = Math.floor(diffTime / (24 * 60 * 60e3));
                  console.log(`Most recent commit of ${repoOwner}/${repoName}:${featureBranch} is ${diffDay} days ago`);
                  if (diffTime > 3 * 24 * 60 * 60e3) {
                    var InstanceId = instance["Instances"][0]["InstanceId"]
                    terminateInstance(InstanceId)
                  }
                }
                else {
                  return error;
                }
              });
            })(instance, featureBranch, repoOwner, repoName);
            break;
          }
        }
      }
    }
  });

  function terminateInstance(instanceId) {
    ec2.terminateInstances({ InstanceIds: [instanceId] }, function(err, data) {
      if(err) {
      console.error(err.toString());
      } else {
        for(var i in data.TerminatingInstances) {
        var instance = data.TerminatingInstances[i];
        console.log('Terminating instance:\t' + instance.InstanceId);
        } 
      }
    });
  }
}