const express = require("express");
const http = require("http");
const app = express();
var bodyParser = require("body-parser");
var cors = require("cors")
const request = require('request')
var Queue = require('queue-fifo');

var cacheManager = require('cache-manager');

const server = http.createServer(app);
var registryBaseUrl = "https://devcon.sunbirded.org/api/reg";

app.use(cors())
app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());

var queue = new Queue();
var cache = require('./cache.js');


//Ad Details
app.post("/visitor/new", (req,response,callback)=>{

    //call registerFace Api

    //update registry of a visitor with photo url
  
})

//Add Stall Details
app.post("/visitor/exit", (req,response,callback)=>{

    // add visitor osid in queue

    //update exit time of a visitor

  
})


//Add Stall Details
app.post("/visitor/display", (req,response,callback)=>{

    
  
})
        
server.listen(9090, function () {
    console.log("util service listening on port " + 9090);
})