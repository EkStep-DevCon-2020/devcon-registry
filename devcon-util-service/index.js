const express = require("express");
const http = require("http");
const app = express();
var bodyParser = require("body-parser");
var cors = require("cors")
const request = require('request')
var cacheManager = require('cache-manager');

const server = http.createServer(app);
var baseUrl = "http://localhost:8080";

app.use(cors())
app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());


var cache = require('./cache.js');
cache.set('id', 0)

//Add Stall Details
app.post("/stall/add", (req,response,callback)=>{

  
    var url = baseUrl + "/add"

    //Get Visitor Details

    let option = {
        json: true,
        headers: {
            "Content-Type":"application/json"
        },
        body: req.body,
        url: url
    }
    request.post(option, function (err, res) {
        if (res) {
                response.send(res.body)
        }else{
            console.log(err)
        }
})
})

app.post("/stall/get", (req,response,callback)=>{

  
    var url = baseUrl + "/search"

    //Get Stall Details

    let option = {
        json: true,
        headers: {
            "Content-Type":"application/json"
        },
        body: req.body,
        url: url
    }
    request.post(option, function (err, res) {
        if (res) {
                response.send(res.body)
        }else{
            console.log(err)
        }
})
})

app.post("/ideas/get", (req,response,callback)=>{

  
    var url = baseUrl + "/search"

    //Get Idea Details

    let option = {
        json: true,
        headers: {
            "Content-Type":"application/json"
        },
        body: req.body,
        url: url
    }
    request.post(option, function (err, res) {
        if (res) {
               var ideaDetails = res.body
                var entityArray = req.body.request.entityType
                entityArray.pop()
                entityArray.push("Vote")

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

                        ideaDetails.result.Idea.forEach(idea => {
                            var totalPoints = 0
                            voteDetails.result.Vote.forEach(vote => {
                                var point = vote.points
                                if(point == undefined){
                                    point = 0;
                                }
                                totalPoints +=point
                            });
                            idea['totalPoints'] = totalPoints
                        });

                        response.send(ideaDetails)

                    }
                })
        }else{
            console.log(err)
        }
})
})



// app.post("/read", (req,response,callback)=>{

  
//     var url = baseUrl + "/read"

//     //Get Visitor Details

//     let option1 = {
//         json: true,
//         headers: {
//             "Content-Type":"application/json"
//         },
//         body: req.body,
//         url: url
//     }
//     request.post(option1, function (err, res) {
//         if (res) {
//                 response.send(res.body)
//         }else{
//             console.log(err)
//         }
// })
// }
// )

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
})


// app.post("/update", (req,response,callback)=>{

  
//     var url = baseUrl + "/update"

//     //Get Visitor Details

//     let option1 = {
//         json: true,
//         headers: {
//             "Content-Type":"application/json"
//         },
//         body: req.body,
//         url: url
//     }
//     request.post(option1, function (err, res) {
//         if (res) {
//                 response.send(res.body)
//         }else{
//             console.log(err)
//         }
//     })
// })

app.post("/visitor/defaultAdd", (req,response,callback)=>{
    let option = {
        json: true,
        headers: {
            "Content-Type":"application/json"
        },
        body: req.body,
        url: baseUrl+"/add"
    }

    request.post(option, function (err, res) {

        if(res){
            response.send(res.body)
        }
    })

})


app.post("/visitor/add", (req,response,callback)=>{

  

    var visitorCode = req.body.request.Visitor.code
    isCreate = false
    if(visitorCode == undefined){
        isCreate = true
    }

    if(isCreate){
        var id =cache.get('id'); 
        id = id +1
        cache.set('id', id);
        visitorCode = "VID"+id

        req.body.request.Visitor['code']=visitorCode
        let option1 = {
            json: true,
            headers: {
                "Content-Type":"application/json"
            },
            body: req.body,
            url: baseUrl+"/add"
        }

        request.post(option1, function (err, res) {

            if(res){

                var visitorReponse = res.body
                visitorReponse.result.Visitor['code']=visitorCode
                response.send(visitorReponse)
            }
        })


    }else{

        // Vistor Details 
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
           entityType:["Visitor"],
           filters:{
               code:{
                   eq:visitorCode
               }
           }           
    
         }
        }
        let option1 = {
            json: true,
            headers: {
                "Content-Type":"application/json"
            },
            body: searchTemplate,
            url: baseUrl+"/search"
        }
        request.post(option1, function (err, res) {
            if (res) {

                   var visitorDetails = res.body
                   var visOsid = visitorDetails.result.Visitor[0].osid

                   var updateTemplate ={
                    id: "open-saber.registry.update",
                    ver: "1.0",
                    ets: "11234",
                    params: {
                        did: "",
                        key: "",
                        msgid: ""
                    },
                 request: {
                    Visitor:{
                        code:visitorCode,
                        name: req.body.request.Visitor.name 

                    }
                 }           
            
                }
                

                   updateTemplate.request.Visitor['osid']=visOsid
                   let option1 = {
                    json: true,
                    headers: {
                        "Content-Type":"application/json"
                    },
                    body: updateTemplate,
                    url: baseUrl+"/update"
                   }
                   request.post(option1, function (err, resp) {
                    if (resp) {
                            response.send(resp.body)
                    }
                
                })
                

            }
        })
             
    }
})


app.post("/visitor/detail/get", (req,response,callback)=>{

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
                    totalPoints += val;
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




app.post("/visitor/detail/getall", (req,response,callback)=>{

    
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
                                    totalPoints += val;
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