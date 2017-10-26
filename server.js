var DEV = (process.argv[2] == "dev" ? true : false);
module.exports.DEV = DEV;

// var nodemailer = require('nodemailer');
var path = require("path");
var express = require("express");
var body_parser = require("body-parser");
var fs = require("fs");
var _ = require("underscore");
var passwords = require("./passwords").passwords;
var os = require("os");

var calls = require("./calls.js");

if (DEV) {
    var PORT = 8000;
} else {
    var PORT = 80;
}

const app = express();
app.use(express.static(__dirname + '/public/'));
app.use(body_parser.urlencoded());

// Listen on Port
var server = app.listen(PORT, function(error) {
    if (error) {
        return console.log("server unable to listen on port");
    } else {
        console.log(`server is listening on ${PORT}`);
    }
});

server.timeout = 600000;

// Add headers
app.use(function (req, res, next) {
    // Website you wish to allow to connect
    // res.setHeader('Access-Control-Allow-Origin', ALLOW_ORIGIN);
    // Request methods you wish to allow
    res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS, PUT, PATCH');
    // Request headers you wish to allow
    res.setHeader('Access-Control-Allow-Headers', 'origin, content-type');
    // Pass to next layer of middleware
    next();
});

if (DEV) {
    var htmlFile = "/Users/rmathur101/Desktop/WORKING_ON/PROJECTS/AFFORDABLE_HOUSING/index.html";
    var htmlFile2 = "/Users/rmathur101/Desktop/WORKING_ON/PROJECTS/AFFORDABLE_HOUSING/index_2.html";
    var htmlFile3 = "/Users/rmathur101/Desktop/WORKING_ON/PROJECTS/AFFORDABLE_HOUSING/calls.html";
} else {
    var htmlFile = "/home/ubuntu/affordable_housing/index.html";
    var htmlFile2 = "/home/ubuntu/affordable_housing/index_2.html"
    var htmlFile3 = "/home/ubuntu/affordable_housing/calls.html";
}

var json_parser = body_parser.json();

app.get("/make_call", json_parser, calls.makeCall);
app.post("/voice", json_parser, calls.makeResponse1);
app.post("/voice_2", json_parser, calls.makeResponse2);
app.post("/voice_3", json_parser, calls.makeResponse3);

app.get("/", function(request, response) {
    response.sendFile(htmlFile);
});

app.get("/test_calls", function(req, res) {
    res.sendFile(htmlFile3);
});

app.post("/test_calls_make_call", function(req, res) {
    const accountSid = 'AC1638a9bc426072425a98032630d009bc';
    const authToken = '125f55fe1fee100125ff19bd2014a22f';
    const Twilio = require('twilio');
    const client = new Twilio(accountSid, authToken);

    var URL = "https://4afc0d18.ngrok.io/voice";
    var FROM = '+18728147361'
    var TO = req.body.number;
    // var URL = "http://www.austinaffordablehousing.com/voice";

    client.api.calls.create({
        url: URL,
        to: TO,
        from: FROM,
      }).then(function(call) {
            console.log(call.id);
            res.status(200).send("success");
      }).catch(function(error) {
            console.log(error);
            res.status(500).send("some error with call");
      });
});

app.get("/app", function(request, response) {
    response.sendFile(htmlFile2);
});

app.post("/log_data_beta", function(req, res) {
    var body = req.body;
    logBetaData(body.data);
    res.status(200);
});

app.get("/test", json_parser, function(request, response) {
    response.status(200).send("success");
});

// app.get("/mail", json_parser, function(request, response) {
//     var transporter = nodemailer.createTransport({
//       service: 'gmail',
//       auth: {
//       }
//     });

//     var mailOptions = {
//       from: 'rmathur101@gmail.com',
//       to: 'rmathur101@gmail.com',
//       subject: 'Sending Email using Node.js',
//       text: 'That was easy!'
//     };

//     transporter.sendMail(mailOptions, function(error, info){
//       if (error) {
//         console.log(error);
//       } else {
//         console.log('Email sent: ' + info.response);
//       }
//     });

//     response.status(200).send("success");
// });

app.post("/send_feedback", json_parser, function(req, res) {
    // console.log(req.query);
    // console.log(req.body);
    var data = req.body;
    data.date = new Date();
    fs.appendFile("./feedback.txt", JSON.stringify(data) + os.EOL, function() {});
    res.status(200).send("success");
});

function logUserData(data) {
    var log = {data: data, date: new Date()};
    fs.appendFile("./log.txt", JSON.stringify(log) + os.EOL, function() {});
    return;
}

function logBetaData(data) {
    var log = {data: data, date: new Date()};
    fs.appendFile("./beta_log.txt", JSON.stringify(log) + os.EOL, function() {});
    return;
}

app.post("/log_data", json_parser, function(req, res) {
    var body = req.body;
    logUserData(body.data);
    res.status(200);
});

app.post("/login", json_parser, function(req, res) {
    var data = req.body;
    // console.log("what is post data?");
    // console.log(data);
    var pass = data["pass"];
    // console.log("what is passwords?");
    // console.log(passwords);

    if (_.contains(passwords, pass.toUpperCase())) {
        console.log("success");
        res.status(200).send("success");

        logUserData({success: "Login Success", code: pass.toUpperCase()});

    } else {
        console.log("error");
        res.status(500).send("error with passwords");

        logUserData("Login Error");
    }
});
