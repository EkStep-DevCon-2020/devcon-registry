const express = require("express");
const http = require("http");
const app = express();
var bodyParser = require("body-parser");
var cors = require("cors")
const request = require('request')

const server = http.createServer(app);
var baseUrl = "http://localhost:8080";

app.use(cors())
app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());


app.post("/getVisitor", (req,res,callback)=>{

    var readSuffix = "read"
    var url = baseUrl + "/" + readSuffix

    //Get Visitor Details


    let option1 = {
        json: true,
        headers: {
            "Content-Type":"application/json"
        },
        body: req.body,
        url: url
    }
    request.post(option1, function (err, res) {
        if (res) {

            var visitorDetails = res.body;
            console.log(res.body);
            var searchTemplate ={
                    id: "open-saber.registry.search",
                    ver: "1.0",
                    ets: "11234",
                    params: {
                    did: "",
                    key: "",
                    msgid: ""
                    },
                    request: {
                    
                    entityType: [],
                    filters: {
                        
                        
                    }
                }
                
            };

           visCode = visitorDetails["result"]["Visitor"]["code"]
            //Get visitor votes
           var entityArray = searchTemplate["request"]["entityType"]
           entityArray.push("Vote");
           //add filter
           var filterQ = {
               visitorCode:{
                   eq : visCode
               }
           }
           searchTemplate.request.filters = filterQ;
           let option2 = {
            json: true,
            headers: {
                "Content-Type":"application/json"
            },
            body:searchTemplate,
            url: baseUrl+"/search"
            
         }
         request.post(option2, function (err, resp) {
            if(resp){
                
                var voteDetails =  resp.body

                var searchTemplate ={
                    id: "open-saber.registry.search",
                    ver: "1.0",
                    ets: "11234",
                    params: {
                    did: "",
                    key: "",
                    msgid: ""
                    },
                    request: {
                    
                    entityType: [],
                    filters: {
                        
                        
                    }
                }
                
            };

           //Get visitor activities
           var entityArray = searchTemplate["request"]["entityType"]
           entityArray.pop()
           entityArray.push("VisitorActivity")
          
           let option2 = {
            json: true,
            headers: {
                "Content-Type":"application/json"
            },
            body:searchTemplate,
            url: baseUrl+"/search"
            
         }
         request.post(option2, function (err, resp) {
            if(resp){
                
                var voteDetails =  resp.body
                console.log("test");
            }

         });
           console.log("error ", err)

        }
        else {
            console.log("error ", err)
        }
    });


  
    //Get Visitor Votes details
    // let option = {
    //     json: true,
    //     headers: {
    //         "Content-Type":"application/json"
    //     },
    //     body: req.body,
    //     url: url
    // }
    // request.post(option, function (err, res) {
    //     if (res) {
    //         visitorDetails = res.body;
    //         console.log(res.body);

    //     }
    //     else {
    //         console.log("error ", err)
    //     }
    // });
  
})

server.listen(9090, function () {
    console.log("util service listening on port " + 9090);
})