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

if (DEV) {
    var PORT = 8000;
} else {
    var PORT = 80;
}

const app = express();
app.use(express.static(__dirname + '/public/'));

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

var htmlFile = "/Users/rmathur101/Desktop/WORKING_ON/MEETUPS/DATA_FOR_DEMOCRACY/AFFORDABLE_HOUSING/index.html";

// app.use(fileUpload());

var json_parser = body_parser.json();

app.get("/", function(request, response) {
    response.sendFile(htmlFile);
});

app.get("/test", json_parser, function(request, response) {
    response.status(200).send("success");
});
