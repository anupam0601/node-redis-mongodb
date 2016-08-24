// Modules required

var express = require('express');
var mongojs = require('mongojs');
var redis = require('redis');

// create a new redis client and connect to our local redis instance
var client = redis.createClient();

// Connecting to redis
client.on('connect', function(){
	console.log('connected to Redis server');
});

var app = express();
var db = mongojs('rest');
var datarest = db.collection('datarest');

// GET from redis else from mongodb
app.get('/place', function(req,res){

	client.get('stateData', function(err,reply){

		if (reply){
			
			console.log("sending from redis");

			res.send({ "state": reply, "source": "redis cache" });
		
		} else {

			datarest.find(function(err, docs){

				console.log("sending from db",docs);

				res.json(docs);

				// Setting the data on redis 
				client.set('stateData',JSON.stringify(docs));
				
			});
		
		}
	
	});
});



app.listen(3000, function () {
    console.log("listening on 3000");
});