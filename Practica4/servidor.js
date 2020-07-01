var http = require("http");
var url = require("url");
var fs = require("fs");
var path = require("path");
var socketio = require("socket.io");
var MongoClient = require('mongodb').MongoClient;
var MongoServer = require('mongodb').Server;
var mimeTypes = { "html": "text/html", "jpeg": "image/jpeg", "jpg": "image/jpeg", "png": "image/png", "js": "text/javascript", "css": "text/css", "swf": "application/x-shockwave-flash"};
var validator_temperature = {'validator': 
						{ 
			 				$jsonSchema: {
			 					bsonType: "object",
			 					required: ["temp","date"],
			 					additionalProperties: false,
			 					properties: {
			 						_id: {},
			 						temp: {
			 						  bsonType: ["int", "double"],
			 						},
			 						date: {
			 						  bsonType: "date",
			 						}
			 					}
			   				}
					   	}
					}
var validator_humidity = {'validator': 
						{ 
							$jsonSchema: {
								bsonType: "object",
								required: ["temp","date"],
								additionalProperties: false,
								properties: {
									_id: {},
									temp: {
									  bsonType: ["double"],
									  minimum: 0,
									  maximum: 1
									},
									date: {
									  bsonType: "date",
									}
								}
	  						}
  						}
  					};
var TEMP_TRESHOLD = {'max':26,'min':22};
var HUMI_TRESHOLD = {'max':0.4,'min':0.2};
var airConditioner = false;
var humidifier = false;
var agentTemperature = true;
var agentHumidity = true;

var httpServer = http.createServer(
	function(request, response) {
		var uri = url.parse(request.url).pathname;
		while(uri.indexOf('/')== 0 ) uri = uri.slice(1);
		var fname = path.join(process.cwd(), uri);
		fs.exists(fname, function(exists) {
			if (exists) {
				fs.readFile(fname, function(err, data){
					if (!err) {
						var extension = path.extname(fname).split(".")[1];
						var mimeType = mimeTypes[extension];
						response.writeHead(200, mimeType);
						response.write(data);
						response.end();
					}
					else {
						response.writeHead(200, {"Content-Type": "text/plain"});
						response.write('Error de lectura en el fichero: '+uri);
						response.end();
					}
				});
			}
			else{
				console.log("Peticion invalida: "+uri);
				response.writeHead(200, {"Content-Type": "text/plain"});
				response.write('404 Not Found\n');
				response.end();
			}
		});
	}
);

function checkTempUpdateAgent(temperature){
	if(temperature >= TEMP_TRESHOLD.max){
		if(airConditioner == false && agentTemperature){
			airConditioner = true;
		}
	}else if(temperature <= TEMP_TRESHOLD.min){
		if(airConditioner == true && agentTemperature){
			airConditioner = false;
		}
	}

	return {'current_value':temperature,'agent':'temperature','agent_state':agentTemperature,'airConditioner':airConditioner};
}


function checkHumidityUpdateAgent(humidity){
	if(humidity >= HUMI_TRESHOLD.max){
		if(humidifier == true && agentHumidity){
			humidifier = false;
		}
	}else if(humidity <= HUMI_TRESHOLD.min){
		if(humidifier == false && agentHumidity){
			humidifier = true;
		}
	}

	return {'current_value':humidity,'agent':'humidity','agent_state':agentHumidity,'humidifier': humidifier};
}

function setPlanToAgentHumidity(plan){
	var response = false;
	if(plan.max > plan.min){
		HUMI_TRESHOLD.max = plan.max;
		HUMI_TRESHOLD.min = plan.min;
		response.msg = 'New plan activated! Humidity('+ HUMI_TRESHOLD.min +'-'+ HUMI_TRESHOLD.max +')';
	}else{
		response.msg = "Bad values given for the new plan!.";
	}
	return response;
}

function setPlanToAgentTemp(plan){
	var response = {msg:""};
	if(plan.max > plan.min){
		TEMP_TRESHOLD.max = plan.max;
		TEMP_TRESHOLD.min = plan.min;
		response.msg = 'New plan activated! Temperature('+ TEMP_TRESHOLD.min +'-'+ TEMP_TRESHOLD.max +')'
	}else{
		response.msg = "Bad values given for the new plan!.";
	}
	return response;
}


MongoClient.connect("mongodb://localhost:27017/",{ useUnifiedTopology: true }, async function(err, db) {
	httpServer.listen(8080);
	var io = socketio.listen(httpServer);
	io.set('origins','http://localhost:8080/');
	const ns_sensors = io.of('/sensors');
	const ns_clients = io.of('/clients');
	var dbo = db.db("domoticData");
	dbo.createCollection("temperature", validator_temperature, function(err,temp_collection){
		if(err){
			throw err;
		}else{
			dbo.createCollection("humidity", validator_humidity, function(err, humidity_collection){
		    	if(err){
		    		throw err;
		    	}else{
		    		ns_sensors.on('connection',function(sensor) {
		    			console.log("Sensor accepted");
						sensor.on('put-sensor-data-temp', function (data) {
							let response = checkTempUpdateAgent(data.temperature);
							temp_collection.insertOne(data, {safe:true}, function(err, result) {
								if(err){
									sensor.emit('error-sensor-data-temp', err);
								}
							});
							ns_clients.emit('temperature-update', response);
						});
						sensor.on('put-sensor-data-humidity', function (data) {
							let response = checkHumidityUpdateAgent(data.humidity);
							humidity_collection.insertOne(data, {safe:true}, function(err, result) {
								if(err){
									sensor.emit('error-sensor-data-humidity', err);
								}
							});
							ns_clients.emit('humidity-update', response);
						});
					});

					ns_clients.on('connection',function(client) {
						console.log("Client accepted");
						client.emit('welcome', {temperature:{agent:agentTemperature,airConditioner:airConditioner,plan:{max:TEMP_TRESHOLD.max,min:TEMP_TRESHOLD.min}}, 
							humidity: {agent:agentHumidity, humidifier:humidifier, plan:{max:HUMI_TRESHOLD.max,min:HUMI_TRESHOLD.min}}});
						client.on('temperature-action', function (data) {
							if('plan' in data){
								let response = setPlanToAgentTemp(data.plan);
								ns_clients.emit('new-temperature-plan',response);
							}else if('action' in data){
								agentTemperature = false;
								if(data.action == 'on')
									airConditioner = true;
								else
									airConditioner = false;
								ns_clients.emit('temperature-agent-state',{'msg':'Attention! Temperature agent deactivated! Air conditioner current state: ' + (airConditioner ? 'active':'inactive')});
							}else if('reactivate-agent'){
								if(agentTemperature == false){
									agentTemperature = true;
									ns_clients.emit('agent-state',{'agent':'temperature' ,'msg':'Attention! Air conditioner agent activated! Air conditioner current state: ' + (airConditioner ? 'active':'inactive')});
								}
							}
						});
						client.on('humidity-action', function (data) {
							if('plan' in data){
								let response = setPlanToAgentHumidity(data.plan);
								ns_clients.emit('new-humidity-plan',response);
							}else if('action' in data){
								agentHumidity = false;
								if(data.action == 'on')
									humidifier = true;
								else
									humidifier = false;
								ns_clients.emit('humidity-agent-state',{'msg':'Attention! Humidifier agent deactivated! Humidifier current state: ' + (humidifier ? 'active':'inactive')});
							}else if('reactivate-agent'){
								if(agentHumidity == false){
									agentHumidity = true;
									ns_clients.emit('agent-state',{'agent':'humidity' ,'msg':'Attention! Humidifier agent activated! Humidifier current state: '+ (humidifier ? 'active':'inactive')});
								}
							}
						});
					});

		    	}
			});
		}
  	});
});