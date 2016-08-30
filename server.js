// Modules required

var express = require('express');
var mongojs = require('mongojs');
var redis = require('redis');
var bodyParser  =   require("body-parser");

// create a new redis client and connect to our local redis instance
var client = redis.createClient();

// Connecting to redis
client.on('connect', function(){
	console.log('connected to Redis server');
});

var app = express();
var db = mongojs('rest');
var datarest = db.collection('datarest');


app.use(bodyParser.json());
app.use(bodyParser.urlencoded({"extended" : false}));


// GET from redis else from mongodb
app.get('/place', function(req,res){

	client.get('stateData', function(err,reply){

		if (reply){
			
			console.log("sending from redis");

			res.send(reply);
		
		} else {

			datarest.find(function(err, docs){

				console.log("sending from db",docs);

				res.json(docs);

				// Setting the data on redis 
				console.log("Setting data into Redis");

				client.set('stateData',JSON.stringify(docs));
				
			});
		
		}
	
	});
});


// GET by id from Redis else from Mongodb
app.get('/place/:id', function(req,res){

	client.get('statDatId', function(err,reply){
		
		if(reply){
		
			console.log("Sending data from redis ==>",reply);
			
			res.send(reply);

		} else {

			console.log(req.params.id);

			// Mongojs -- finds the entry by id --> req.params.id
			datarest.findOne({ _id: mongojs.ObjectId(req.params.id)}, function(err, docs){

				console.log("sending from db",docs);

				res.json(docs);

				// Setting the data on redis
				console.log("Setting data on Redis")

				// Stringifying the data so that it can be stored as json string in Redis
				client.set('statDatId',JSON.stringify(docs));

			});
	    }

  	});

});


// GET by place name
app.get('/special',function(req,res){



	client.get('statSpecial', function(err,reply){
		
		if(reply){
		
			console.log("Sending data from redis ==>",reply);
			
			res.send(reply);

		} else {


			// Mongojs -- finds the entry by id string specific
			datarest.findOne({ _id: "special"}, function(err, docs){

				console.log("sending from db",docs);

				res.json(docs);

				// Setting the data on redis
				console.log("Setting data on Redis")

				// Stringifying the data so that it can be stored as json string in Redis
				client.set('statSpecial',JSON.stringify(docs));

			});
	    }

  	});

});

// Modify a document
app.put('/place/:id', function (req, res) {
  var id = req.params.id;

  console.log(req.body.name);
  
  db.contactlist.findAndModify({
  
    query: {_id: mongojs.ObjectId(id)},
  
    update: {$set: {"place":req.body.place}},
  
    new: true}, function (err, doc) {

      res.json(doc);
    }

  );

});

// Listening app on 3000 
app.listen(3000, function(){
    console.log("listening on 3000");
});