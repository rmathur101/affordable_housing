var VoiceResponse = require("twilio").twiml.VoiceResponse;
var ref = require("./firebase_admin_init.js").firebaseRef;

var langOpts = {
	voice: "woman",
	language: "en"
}

var makeCall = function(req, res) {
	const accountSid = 'AC1638a9bc426072425a98032630d009bc';
	const authToken = '125f55fe1fee100125ff19bd2014a22f';
	const Twilio = require('twilio');
	const client = new Twilio(accountSid, authToken);

	var URL = "https://4afc0d18.ngrok.io/voice";
	// var URL = "http://www.austinaffordablehousing.com/voice";

	client.api.calls.create({
	    url: URL,
	    to: '+16303478805',
	    from: '+18728147361',
	  }).then(function(call) {
	  		console.log(call.id);
	  }).catch(function(error) {
	  		console.log(error);
	  });

    res.status(200).send("success");
}

var makeResponse1 = function(req, res) {
	var twiml = new VoiceResponse();
	var called = parseInt(req.body.Called);

	// console.log("what is this number?");
	// console.log(called);

	console.log("inside of makeResponse 1");

	// update received calls
	ref.child(called).once("value", function(data) {
		var data = data.val();

		if (data && data.calls) {
			var updated = data.calls + 1;
		} else {
			var updated = 1;
		}

		ref.child(called).child("calls").set(updated);
	}, function(error) {console.log(error)});

	var gather = twiml.gather(
		{
			input: "dtmf",
			timeout: 15,
			action: "/voice_2"
			// numDigits: 1,
		}
	);
	gather.say(langOpts,
		",,,,,Hello from Austin Affordable Housing. We are calling to update our Affordable Housing Records. Our records show that your property provides income restricted units. If your property provides income restricted units, press 1 followed by the pound key. Or, if your property DOES NOT provide income restricted units, press 0 followed by the pound key."
	);

	res.writeHead(200, {"Content-Type": "text/xml"});
	res.end(twiml.toString());
}
var makeResponse2 = function(req, res) {
	var body = req.body;
	console.log("voice 2 body");
	console.log(body);

	var digits = parseInt(body.Digits);
	var called = parseInt(req.body.Called);

	ref.child(called).child("hasIR").set((digits == 1) ? true : false);

	if (digits == 0) {
		var twiml = makeResponseClose();
		ref.child(called).child("numIR").set(0);
	} else {
		var twiml = new VoiceResponse();
		var gather = twiml.gather(
			{
				input: "dtmf",
				timeout: 15,
				action: "/voice_3"
				// numDigits: 3
			}
		);
		gather.say(langOpts,
			",,,,,How many income restricted units are currently available for rent or purchase? Please input the number of units on your keypad, followed by the pound key."
		);
	}

	res.writeHead(200, {"Content-Type": "text/xml"});
	res.end(twiml.toString());
}

var makeResponse3 = function(req, res) {
	var body = req.body;
	console.log("voice 3 body");
	console.log(body);

	var digits = parseInt(body.Digits);
	var called = parseInt(req.body.Called);
	ref.child(called).child("numIR").set(digits);

	var twiml = makeResponseClose();
	res.writeHead(200, {"Content-Type": "text/xml"});
	res.end(twiml.toString());
}

var makeResponseClose = function() {
	var twiml = new VoiceResponse();
	twiml.say(langOpts,
		",,,,,Excellent. Thank you for your time. Citizens of Austin are grateful to have a reliable source of affordable housing. If you are interested in learning more about the state of affordable housing in Austin Texas, please visit www.austin affordable housing.com /app. Have a great day.")
	return twiml;
}

module.exports.makeResponse1 = makeResponse1;
module.exports.makeResponse2 = makeResponse2;
module.exports.makeResponse3 = makeResponse3;
module.exports.makeCall = makeCall;
