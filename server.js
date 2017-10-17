// NOTE
// for development run: DEBUG=nightmare node node_server.js dev
// for production: node node_server.js OR sudo forever start node_server.js (use the latter to run node in background and auto restart)

const DEV = (process.argv[2] == "dev" ? true : false);
module.exports.DEV = DEV;

var path = require("path");
var express = require("express");
var body_parser = require("body-parser");
var fs = require("fs");
var _ = require("underscore");
var passwords = require("./passwords").passwords;
var os = require("os");

var nodemailer = require('nodemailer');
// var content = require("./content").content;

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

var htmlFile = "/Users/rmathur101/Desktop/WORKING_ON/PROJECTS/AFFORDABLE_HOUSING/index.html";

// app.use(fileUpload());

var json_parser = body_parser.json();


app.get("/", function(request, response) {
    response.sendFile(htmlFile);
});

app.get("/test", json_parser, function(request, response) {
    response.status(200).send("success");
});

app.get("/mail", json_parser, function(request, response) {
var transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: 'rmathur101@gmail.com',
    pass: 'googlelogos'
  }
});

var mailOptions = {
  from: 'rmathur101@gmail.com',
  to: 'rmathur101@gmail.com',
  subject: 'Sending Email using Node.js',
  text: 'That was easy!'
};

transporter.sendMail(mailOptions, function(error, info){
  if (error) {
    console.log(error);
  } else {
    console.log('Email sent: ' + info.response);
  }
});
    response.status(200).send("success");
});

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
