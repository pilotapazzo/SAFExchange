var express = require('express');
var path = require('path');
var http = require('http'); // used for calling external server
var querystring = require('querystring');
var app = express();
var router = express.Router();

//////////////////////////////////////////////////////////////////////////////
// VARIABLES DECLARATIONS:
const host = "localhost"; //"safexchange.herokuapp.com"
//////////////////////////////////////////////////////////////////////////////

//////////////////////////////////////////////////////////////////////////////
// ROUTING SETUP
var possible_routes =
	"GET \t		/user/:id_user" + "<br>" +
	"POST \t 	/buy/plannedaction" + "<br>" + 
	"POST \t 	/buy/user" + "<br>" +
	"POST \t	 	/sell/plannedaction"+ "<br>" +
	"POST \t	 	/sell/plannedaction";

router.get('/', function (req, res) {
	res.send(possible_routes);
});


/**  JUST FOR TESTS */
router.get('/client', function (req, res) {
	// send a feedback to the client
	res.sendFile(path.join(__dirname + '/client/index.html'));
});

router.get('/user/:user_id', function (req, res) { 
	try
	{
		// step 1: extract the ID of the user from the req
		var ID_user = req.params.user_id;
		// debug: console.log("ID_user: " + ID_user); 

		// step 2: call the wb /database/.. in order to gather the user informations
		// OSS: the data received from the /database ws should be already in the json format
		var sdtwsdb = organiseDataToBeSendAndSend(ID_user); 
		sdtwsdb.then(function(result) {
			//	enter here when Promise response. Result is the value return by the promise -> resolve("success");
			 
			res.send(result);

		}, function(err) { // enter here when Promise reject
			// an error has occurred
			
			res.send('{"status": "'+ err +'"}');
		});
	}
	catch(error)
	{
		// an error has occurred
		
		res.send('{"status": "user id has not been specified."}');
	}
});

/////////////////////////////////////////
/** Defines the /buy/plannedaction API.
 *  This function receives the command from the plannedaction ws in order performe a "buy" action
 */
router.post('/buy/plannedaction/', function (req, res) { 
	res.header('Content-type', 'application/json');

	// Data send by the ws plannedaction:
	// - ID_plannedaction
	// - ID_user (contained in the details of the plannedaction)
	// - buy ETH or BTC (contained in the details of the plannedaction)
	// - price to buy (contained in the details of the plannedaction)
	try
	{	
		
	}
	catch(error)
	{
		
		stringData = '{"status":"'+ error +'"}';
	}
	res.send(stringData); 
});

/** Defines the /buy/user API.
 *  This function receives the command from the user in order performe a "buy" action
 */
router.post('/buy/user/', function (req, res) { 
	res.header('Content-type', 'application/json');

	// Data send by the ws plannedaction:
	// - ID_user (contained in the details of the plannedaction)
	// - buy ETH or BTC (contained in the details of the plannedaction)
	// - price to buy (contained in the details of the plannedaction)
	// - action: always BUY
	try
	{	
		transaction_user(req).then((res) => {
			console.log(res);
			res.json(res);
		});	
	}
	catch(error)
	{
		res.json({status: error });
	}
	
});

router.post('/sell/plannedaction/', function (req, res) { 
	/*var stringData = "";
	
	
	res.header('Content-type', 'application/json');

	// Data send by the ws plannedaction:
	// - ID_plannedaction
	// - ID_user (contained in the details of the plannedaction)
	// - sell ETH or BTC (contained in the details of the plannedaction)
	// - price to sell (contained in the details of the plannedaction)
	try
	{	
		var _ID_plannedaction = req.body.plannedaction_id;
		var _ID_user = req.body.user_id;
		var _action =  req.body.action; // sell or buy <- should always be sell 
		var _currency = req.body.currency; // ETHUSD or BTCUSD
		var _price = req.body.price;

		// step 1: check the price of the currency
		// create the object with the data to send
		var dataObj =  querystring.stringify({
			ID_plannedaction: _ID_plannedaction,
			ID_user: _ID_user,			
			action: _action,
			currency: _currency,
			price: _price
		});
						
		// step 2: create the header to send the data
		var _header = {
			'Content-Type': 'application/x-www-form-urlencoded', // "x-www-form-urlencoded" no idea  what this is.....
			'Content-Length': Buffer.byteLength(dataObj)
		}

		var serverPath = "";
		if(_currency == "BTCUSD")
			serverPath = "/price/BTCUSD";
		if(_currency == "ETHUSD")
			serverPath = "/price/ETHUSD";

		// step 3: get the actual value of the specified currency
		var sdtwsdb = sendDataToWS(host, 8080, serverPath, 'GET',  _header, tmpObj); 
		sdtwsdb.then(function(result) {
			var resultOBJ = JSON.parse(result);
				
			// step 2: compare it with the value of _price specified by the the plannedaction
			var updatedValue = 0;
			if(_currency == "BTCUSD")
			{
				updatedValue = parseFloat(resultOBJ.btcusd);
			}
			if(_currency == "ETHUSD")
			{
				updatedValue = parseFloat(resultOBJ.ethusd);
			}
				
			// compare the up to date value with the one received from the ws plannedaction
			if(parseFloat(price) == updatedValue)
			{	
				// step 3: ask to delete it (or mark as completed) by calling /plannedaction/....
				var path = "/plannedaction/deleteaction/" + _ID_plannedaction;
					
				// ***** commentato perché il ws che fa questa parte non c'è ancora ****
				//var sdtwspa = sendDataToWS(host, 8080, path, 'DELETE',  _header, {}); 
				//sdtwspa.then(function(result) {
					// step 4: save the transaction in the db (call /database/.... )
					var path = "/database/transaction/";	
					var sdtwsdb = sendDataToWS(host, 8080, path, 'POST',  _header, dataObj);
					sdtwsdb.then(function(result) {

						// set 5: update user balance by calling /user/... with PUT method (simulate the action "sell")
						var path = "/user/balance/sell/";	
						var sdtwsuser = sendDataToWS(host, 8080, path, 'PUT',  _header, dataObj);
						sdtwsuser.then(function(result) {
							// ....



						}, function(err) { // enter here when Promise reject
							console.log("[wsuser] " + err);
						});
					}, function(err) { // enter here when Promise reject
						console.log("[wspa] " + err);
					});

				//}, function(err) { // enter here when Promise reject
				//	console.log("[wspa] " + err);
				//});

			}
			else
				console.log("Error: price values are inconsistent.");


		}, function(err) { // enter here when Promise reject
			console.log("[wsdb] " + err);
		});
	}
	catch(error)
	{
		
		stringData = '{"status":"'+ error +'"}';
	}
	res.send(stringData);*/
});

router.post('/sell/user/', function (req, res) { 
	/*var stringData = "";
	
	
	res.header('Content-type', 'application/json');

	// Data send by the ws plannedaction:
	// - ID_user (contained in the details of the plannedaction)
	// - sell ETH or BTC (contained in the details of the plannedaction)
	// - price to sell (contained in the details of the plannedaction)
	// - action: always sell
	try
	{	
		var _ID_user = req.body.plannedaction_id;
		var _action =  req.body.action; // sell or sell <- should always be sell 
		var _currency = req.body.currency; // ETHUSD or BTCUSD
		var _price = req.body.price;

		// step 1: check the price of the currency
		// create the object with the data to send
		var dataObj =  querystring.stringify({
			ID_user: _ID_user,			
			action: _action,
			currency: _currency,
			price: _price
		});
						
		// step 2: create the header to send the data
		var _header = {
			'Content-Type': 'application/x-www-form-urlencoded', // "x-www-form-urlencoded" no idea  what this is.....
			'Content-Length': Buffer.byteLength(dataObj)
		}

		var serverPath = "";
		if(_currency == "BTCUSD")
			serverPath = "/price/BTCUSD";
		if(_currency == "ETHUSD")
			serverPath = "/price/ETHUSD";

		// step 3: get the actual value of the specified currency
		var sdtwsdb = sendDataToWS(host, 8080, serverPath, 'GET',  _header, tmpObj); 
		sdtwsdb.then(function(result) {
			var resultOBJ = JSON.parse(result);
				
			// step 2: compare it with the value of _price specified by the the plannedaction
			var updatedValue = 0;
			if(_currency == "BTCUSD")
			{
				updatedValue = parseFloat(resultOBJ.btcusd);
			}
			if(_currency == "ETHUSD")
			{
				updatedValue = parseFloat(resultOBJ.ethusd);
			}
				
			// compare the up to date value with the one received from the ws plannedaction
			if(parseFloat(price) == updatedValue)
			{	
				
				// step 3: save the transaction in the db (call /database/.... )
				var path = "/database/transaction/";	
				var sdtwsdb = sendDataToWS(host, 8080, path, 'POST',  _header, dataObj);
				sdtwsdb.then(function(result) {

					// set 5: update user balance by calling /user/... with PUT method (simulate the action "sell")
					var path = "/user/balance/sell/";	
					var sdtwsuser = sendDataToWS(host, 8080, path, 'PUT',  _header, dataObj);
					sdtwsuser.then(function(result) {
						// ....

					}, function(err) { // enter here when Promise reject
						console.log("[wsuser] " + err);
					});
				}, function(err) { // enter here when Promise reject
					console.log("[wspa] " + err);
				});

			}
			else
				console.log("Error: price values are inconsistent.");


		}, function(err) { // enter here when Promise reject
			console.log("[wsdb] " + err);
		});
	}
	catch(error)
	{
		
		stringData = '{"status":"'+ error +'"}';
	}
	res.send(stringData);*/
});



//////////////////////////////////////////////////////////////////////////////
// FUNCTIONS and METHODS
async function transaction_user(req)
{
	var _ID_user = req.body.user_id; console.log("_ID_user: " + _ID_user);
	var _action =  req.body.action; console.log("_action: " + _action);// buy or sell <- should always be BUY 
	var _currency = req.body.currency; console.log("_currency: " + _currency);// ETHUSD or BTCUSD
	var _price = req.body.price; console.log("_price: " + _price);
	var _priceUSD = req.body.priceUSD; console.log("_price: " + _priceUSD);

	// step 1: check the price of the currency
	// create the object with the data to send
	var dataObj =  querystring.stringify({
		ID_user: _ID_user,			
		action: _action,
		currency: _currency,
		price: _price,
		priceUSD: _priceUSD
	});
						
	// step 2: create the header to send the data
	var _header = {
		'Host': host,
		'Content-Type': 'application/x-www-form-urlencoded', // "x-www-form-urlencoded" no idea  what this is.....
		'Content-Length': Buffer.byteLength(dataObj)
	}

	var serverPath = "";
	if(_currency.toUpperCase() == "BTC")
		serverPath = "/price/BTCUSD";
	if(_currency.toUpperCase() == "ETH")
		serverPath = "/price/ETHUSD";

	console.log("s2: " + serverPath);

	// step 3: get the actual value of the specified currency
	var sdtwsdb = sendDataToWS(host, 8080, serverPath, 'GET',  _header, dataObj); 
	sdtwsdb.then(function(result) {
		var resultOBJ = JSON.parse(result);
		console.log("s3: " + result);
				
		// step 2: compare it with the value of _price specified by the the plannedaction
		var updatedValue = -1;
		if(_currency.toUpperCase() == "BTC")
			updatedValue = parseFloat(resultOBJ.btcusd);
		if(_currency.toUpperCase() == "ETH")
			updatedValue = parseFloat(resultOBJ.ethusd);
				
		console.log("s4: " + parseFloat(_price) + " ?==? " + updatedValue);
		// compare the up to date value with the one received from the ws plannedaction
		if((parseFloat(_price) > updatedValue - 100) && (parseFloat(_price) < updatedValue + 100)) // original: if(parseFloat(_price) == updatedValue)
		{	
			// step 3: save the transaction in the db (call /database/.... )
			var path = "/database/transaction/";	
			var tmpDBOBJ;
			if(_currency.toUpperCase() == "BTC")
			{
				tmpDBOBJ = {
					author: _ID_user,
					action: _action,
					USD: _priceUSD, 
					BTC: _price
				};
			}
			if(_currency.toUpperCase() == "ETH")
			{
				tmpDBOBJ = {
					author: _ID_user,
					action: _action,
					USD: _priceUSD, 
					ETH: _price
				};
			}
				
			var _headerDB = {
				'Content-Type': 'application/x-www-form-urlencoded', // "x-www-form-urlencoded" no idea  what this is.....
				'Content-Length': Buffer.byteLength(tmpDBOBJ)
			}
			var sdtwsdb = sendDataToWS(host, 8080, path, 'POST',  _headerDB, tmpDBOBJ);
			sdtwsdb.then(function(result) {
				console.log("s5: " + result);
				return result;

					// set 4: update user balance by calling /user/... with PUT method (simulate the action "buy")
					/******* COMMENTATO perché NON c'è ancora il WS
					var path = "/user/balance/buy/";	
					var sdtwsuser = sendDataToWS(host, 8080, path, 'PUT',  _header, dataObj);
					sdtwsuser.then(function(result) {
						// ....
						console.log("s6: "+ result);
						stringData = '{"status": '+ result +'}';
						res.send(stringData);

					}, function(err) { // enter here when Promise reject
						console.log("[wsuser] " + err);
						res.statusCode = 400; //*** 400 messo a caso 
						stringData = '{"status":"'+ err +'"}';
						res.send(stringData);
					});
					*/

			}, function(err) { // enter here when Promise reject
				console.log("[wspaDB] " + err);
				return ({status: err });
			});

		}
		else {
			console.log("Error: price values are inconsistent.");
			return ({status: "Error: price values are inconsistent." });
		}
			

	}, function(err) { // enter here when Promise reject
		console.log("[wsdb] " + err);
		return ({status: err });
	});
}

async function transaction_plannedaction(req)
{
	var _ID_plannedaction = req.body.plannedaction_id;
	var _ID_user = req.body.user_id;
	var _action =  req.body.action; // buy or sell <- should always be BUY 
	var _currency = req.body.currency; // ETHUSD or BTCUSD
	var _price = req.body.price;
	var _priceUSD = req.body.priceUSD;

		// step 1: check the price of the currency
		// create the object with the data to send
		var dataObj =  querystring.stringify({
			ID_plannedaction: _ID_plannedaction,
			ID_user: _ID_user,			
			action: _action,
			currency: _currency,
			price: _price,
			priceUSD: _priceUSD
		});
						
		// step 2: create the header to send the data
		var _header = {
			'Host': host,
			'Content-Type': 'application/x-www-form-urlencoded', // "x-www-form-urlencoded" no idea  what this is.....
			'Content-Length': Buffer.byteLength(dataObj)
		}

		var serverPath = "";
		if(_currency.toUpperCase() == "BTC")
			serverPath = "/price/BTCUSD";
		if(_currency.toUpperCase() == "ETH")
			serverPath = "/price/ETHUSD";

		// step 3: get the actual value of the specified currency
		var sdtwsdb = sendDataToWS(host, 8080, serverPath, 'GET',  _header, tmpObj); 
		sdtwsdb.then(function(result) {
			var resultOBJ = JSON.parse(result);
				
			// step 2: compare it with the value of _price specified by the the plannedaction
			var updatedValue = -1;
			if(_currency.toUpperCase() == "BTC")
				updatedValue = parseFloat(resultOBJ.btcusd);
			if(_currency.toUpperCase() == "ETH")
				updatedValue = parseFloat(resultOBJ.ethusd);
				
			// compare the up to date value with the one received from the ws plannedaction
			if(parseFloat(price) == updatedValue)
			{	
				// step 3: ask to delete it (or mark as completed) by calling /plannedaction/....
				var path = "/plannedaction/deleteaction/" + _ID_plannedaction;
					
				// ***** commentato perché il ws che fa questa parte non c'è ancora ****
				//var sdtwspa = sendDataToWS(host, 8080, path, 'DELETE',  _header, '{}'); 
				//sdtwspa.then(function(result) {
					// step 4: save the transaction in the db (call /database/.... )
					var path = "/database/transaction/";	
					var sdtwsdb = sendDataToWS(host, 8080, path, 'POST',  _header, dataObj);
					sdtwsdb.then(function(result) {

						// set 5: update user balance by calling /user/... with PUT method (simulate the action "buy")
						var path = "/user/balance/buy/";	
						var sdtwsuser = sendDataToWS(host, 8080, path, 'PUT',  _header, dataObj);
						sdtwsuser.then(function(result) {
							// ....
							return result;

						}, function(err) { // enter here when Promise reject
							console.log("[wsuser] " + err);
							return err;
						});
					}, function(err) { // enter here when Promise reject
						console.log("[wspa] " + err);
						return err;
					});

				//}, function(err) { // enter here when Promise reject
				//	console.log("[wspa] " + err);
				//  return err;
				//});

			}
			else
				console.log("Error: price values are inconsistent.");


		}, function(err) { // enter here when Promise reject
			console.log("[wsdb] " + err);
		});
}


/** Retrive the user's informations from the database */
async function organiseDataToBeSendAndSend(_ID_user)
{
	// step 1: create the object with the data to send
	var tmpObj =  querystring.stringify({
		ID_user: _ID_user,			// ID of the user that has requested the action
	});
						
	// step 2: create the header to send the data
	var _header = {
		'Content-Type': 'application/x-www-form-urlencoded', 
		'Content-Length': Buffer.byteLength(tmpObj)
	}

	var serverPath = '/database/transaction/user/' + _ID_user;
	// Return new promise 
	return new Promise(function(resolve, reject) {

		// step 3: get all the informations about the user
		var sdtwsdb = sendDataToWS(host, 8080, serverPath, 'GET',  _header, tmpObj); 
		sdtwsdb.then(function(result) {
			console.log("[wsdb] " + result);
			resolve(result);
				
		}, function(err) { // enter here when Promise reject
			console.log("[wsdb] Unexpected error: " + err);
			reject(err);
		});
	});
}

/** This function connects to the specified host and send the _data with the choosen crud method */
async function sendDataToWS(_host, _port, _path, _method, _header, _data)
{
		var options = {
			host: _host, 		// es: 'localhost', 
			port: _port, 		// es: 8085,
			path: _path, 		// es: '/transaction',
			method: _method, 	// es: 'POST',
			headers: _header	
		};
		
		// Return new promise 
		return new Promise(function(resolve, reject) {
			// Do async job
			var serverResponse;
			var httpreq = http.request(options, function (response) {
					
				response.setEncoding('utf8');
				response.on('data', function (chunk) {
					serverResponse = chunk;
				});
				response.on('end', function() {
					console.log('---------->call ended');
					resolve(serverResponse);
				})
			});
			
			httpreq.write(_data);
			httpreq.end();
		
			httpreq.on('error', function(err) {
				console.error('httpreq: ' + err);
				reject(err);
			});
		});
}

//////////////////////////////////////////////////////////////////////////////
// EXPORT router to be used in the main file
module.exports = router;