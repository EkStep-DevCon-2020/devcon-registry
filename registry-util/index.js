const express = require("express");
const http = require("http");
const app = express();
var bodyParser = require("body-parser");
var cors = require("cors")
const request = require('request')



const server = http.createServer(app);
var registryBaseUrl = "https://devcon.sunbirded.org/api/reg";

app.use(cors())
app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());

var cache = require('./cache.js');


//Ad Details
app.post("/visitor/new", (req,response,callback)=>{

    //call registerFace Api

    //update registry of a visitor with photo url
    var resp = {
       
           "responseCode":"OK"
        }
    
        response.send(resp)
  
})

//Add Stall Details
app.post("/visitor/exit", (req,response,callback)=>{

    //update exit time of a visitor
    var resp = {
       
        "responseCode":"OK"
     }
     response.send(resp)

  
})


//Add Stall Details
app.get('/visitor/display/:id', (req,response,callback)=>{

    var resp = {
        badges: [{
            url: "https://www.pngarts.com/files/4/Golden-Badge-PNG-Free-Download.png",
            name: "GOLD"
        }],
        name: "Mohan Lal",
        code: "VID11",
        photo: "url",
        pointsEarned: 300,
        visitorActivity: [
            {
                
                "stallCode": "STA1",
                "timeSpent":  200000000
                
            },
            {
                
                "stallCode": "STA2",
                "timeSpent":  2000000
                
            }
        ]
     } 

     response.send(resp)

  
})
        
server.listen(9090, function () {
    console.log("util service listening on port " + 9090);
})