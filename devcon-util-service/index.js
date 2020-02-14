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


app.post("/add", (req,response,callback)=>{

  
    var url = baseUrl + "/add"

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
                response.send(res.body)
        }else{
            console.log(err)
        }
})


app.post("/read", (req,response,callback)=>{

  
    var url = baseUrl + "/read"

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
                response.send(res.body)
        }else{
            console.log(err)
        }
})

app.post("/search", (req,response,callback)=>{

  
    var url = baseUrl + "/search"

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
                response.send(res.body)
        }else{
            console.log(err)
        }
})


app.post("/update", (req,response,callback)=>{

  
    var url = baseUrl + "/update"

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
                response.send(res.body)
        }else{
            console.log(err)
        }
})



app.post("/getVisitor", (req,response,callback)=>{

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
          
           let option3 = {
            json: true,
            headers: {
                "Content-Type":"application/json"
            },
            body:searchTemplate,
            url: baseUrl+"/search"
            
         }
         request.post(option3, function (err, resp) {
            if(resp){
                
                var visitorActivityDetails =  resp.body
                var totalPoints = 0;
                visitorActivityDetails.result.VisitorActivity.forEach(element => {
                    let val = element.points;
                    if(val==undefined){
                        val = 0;
                    }
                    totalPoints = val;
                });
                
                if(voteDetails.result.Vote == undefined){
                    visitorDetails.result.Visitor['votes'] = [];
                }else{
                    visitorDetails.result.Visitor['votes'] =voteDetails.result.Vote
                }

                if(voteDetails.result.Vote == undefined){
                    visitorDetails.result.Visitor['vactivitiesotes'] = [];
                }else{
                    visitorDetails.result.Visitor['activities'] = visitorActivityDetails.result.VisitorActivity
                }
                visitorDetails.result.Visitor['totalPoints'] = totalPoints
                response.send(visitorDetails);
                
                console.log("error ", err)


            }

         });
           console.log("error ", err)

        
        }
        else {
            console.log("error ", err)
        }
    
    
 
    })
   }
    })
})




app.post("/getAllVisitor", (req,response,callback)=>{

    
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
   
    let option1 = {
        json: true,
        headers: {
            "Content-Type":"application/json"
        },
        body: req.body,
        url: baseUrl+"/search"
    }
    request.post(option1, function (err, res) {
        if (res) {
            var visitorList = res.body
            var visiters = visitorList["result"]["Visitor"]
            var visCode =[]
            for(i=0 ;i <visiters.length;i++){
                visCode[i] = visiters[i].code
            
            }
                var filterQ = {
                    visitorCode:{
                     or : visCode
                 }
                }
                var ii =0 
                var entityArray = req.body.request.entityType
                entityArray.pop()
                entityArray.push("Vote")
                req.body.request.filters = filterQ

                let option2 = {
                    json: true,
                    headers: {
                        "Content-Type":"application/json"
                    },
                    body:req.body,
                    url: baseUrl+"/search"
                    
                 }

                 request.post(option2, function (err, resp) {
                    if(resp){
                        var voteDetails =  resp.body

                        var entityArray = req.body.request.entityType

                        entityArray.pop()
                        entityArray.push("VisitorActivity")

                        let option3 = {
                            json: true,
                            headers: {
                                "Content-Type":"application/json"
                            },
                            body:req.body,
                            url: baseUrl+"/search"
                            
                         }
                         request.post(option3, function (err, respn) {
                            if(resp){
                                
                                var visitorActivityDetails =  respn.body
                                var totalPoints = 0;
                                visitorActivityDetails.result.VisitorActivity.forEach(element => {
                                    let val = element.points;
                                    if(val==undefined){
                                        val = 0;
                                    }
                                    totalPoints = val;
                                });
                                
                                visiters.forEach(visitor => {
                                    visitor['totalPoints']=totalPoints

                                    var votes = []
                                    var activities = []

                                    voteDetails.result.Vote.forEach(vote => {
                                        if(vote.visitorCode == visitor.code){
                                            votes.push(vote)
                                        }
                                    });
                                    visitor['votes'] =votes
                                    visitorActivityDetails.result.VisitorActivity.forEach(activity => {
                                        if(activity.visitorCode == visitor.code){
                                            activities.push(activity)
                                        }
                                    });
                                    visitor['activities'] =activities
                                })
                                 

                                response.send(visitorList)                            
                                
                                
                            }
                        })
                    }
                 })        

            
            
        }
    })

})
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
  

        
server.listen(9090, function () {
    console.log("util service listening on port " + 9090);
})