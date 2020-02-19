const express = require("express");
const http = require("http");
const app = express();
var bodyParser = require("body-parser");
var cors = require("cors")
const request = require('request')
const dotenv = require('dotenv');
dotenv.config();


var Queue = require('queue-fifo');
var queue = new Queue();


const server = http.createServer(app);
const registryBaseUrl = "https://devcon.sunbirded.org/api/reg";
const faceRegistryBaseUrl = "https://devcon.sunbirded.org/api/reghelper/face" 
const certificateBaseUrl = "https://devcon.sunbirded.org/api/certreg/v1/certs"


app.use(cors())
app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());

var cache = require('./cache.js');
const Silverbadge= {
    url:"https://www.pngarts.com/files/4/Golden-Badge-PNG-Free-Download.png",
    name:"Silver"
}

const Goldbadge= {
    url:"https://www.pngarts.com/files/4/Golden-Badge-PNG-Free-Download.png",
    name:"Gold"
}


const Platinumbadge= {
    url:"https://www.pngarts.com/files/4/Golden-Badge-PNG-Free-Download.png",
    name:"Platinum"
}
cache.set("DevCon-2020",Silverbadge)
cache.set("WINNER",Goldbadge)


let tempHeader = {
    'Authorization': process.env.DEVCON_API_KEY,
    'Content-type': 'application/json'
}



app.post("/visitor/new", (req,response,callback)=>{


    //call registerFace Api
    
    var uuid = req.body.request.osid
    var imageUrl = req.body.request.photo
   var updateTemplate= {
       request:{
           Visitor:{
               osid:uuid,
               photo:imageUrl
           }
       }
   }

 
    let option = {
        json: true,
        headers: tempHeader,
        body: req.body,
        strictSSL: false,
        url: faceRegistryBaseUrl+"/register"
    }

    console.log(option.url)

    request.post(option, function (err, res) {
        if (res) {

               try{
                var result = res.body
                let option1 = {
                    json: true,
                    headers: tempHeader,
                    body: updateTemplate,
                    url: registryBaseUrl+"/update"
                }
                request.post(option1, function (err, res) {
                    if (res) {
                            response.send(res.body)
                    }else{
                        console.log(err)
                    }
                })
            }catch(e){

                console.log("Some Error occured"+e)
                var resp = {
       
                    "status":"UNSUCCESSFUL"
                 }
                 response.send(resp)
            }

        }else{
            console.log(err)
            var resp = {
       
                "status":"UNSUCCESSFUL"
             }
             response.send(resp)
        }
    })
   

  
})

//Add Stall Details
app.post("/visitor/exit", (req,response,callback)=>{

    try{  
    //update exit time of a visitor
     if(queue.size() == 4){
        queue.dequeue();
        var data = req.body.request

        queue.enqueue(data)
     }else{

        var data = req.body.request
        queue.enqueue(data)

     }
 
     resp = {
         responseCode:"OK"
     }
     response.send(resp)
    }catch(e){

        resp = {
            responseCode:"UNSUCCESSFUL"
        }
        response.send(resp)
    }

  
})


//Add Stall Details
app.get('/visitor/display/:id', (req,response,callback)=>{

    const id = req.params.id


    var qList = queue._list;

    if(qList.size >= 1){
        var searchTemplate={
            request:{
                entityType:["Visitor"]
                
            }
        }

        var profileList = qList.toArray()
        var data = profileList[id-1]
        if(data.osid == undefined){
            var filterQ = {
                code:{eq:data.visitorCode}
            }
        }else{
            var filterQ = {
                osid:{eq:data.osid}
            }
        }

        searchTemplate.request['filters']=filterQ
        let option = {
            json: true,
            headers: tempHeader,
            body: searchTemplate,
            url: registryBaseUrl+"/search"
        }
        request.post(option, function (err, res) {
            if (res) {
                var visitorDetails = res.body;
                try{
                var visitorDetail = visitorDetails.result.Visitor[0];
                var entityArray = searchTemplate["request"]["entityType"]
                entityArray.pop()
                entityArray.push("VisitorActivity")
                const visCode = visitorDetail.code
                filterQ ={
                    visitorCode:{
                        eq:visCode
                    }
                }
                searchTemplate.request.filters = filterQ
                let option2 = {
                 json: true,
                 headers:tempHeader,
                 body:searchTemplate,
                 url: registryBaseUrl+"/search"
                 
                 
              } 

              request.post(option2, function (err, resp) {
                if(resp){
                    
                    var visitorActivityDetails =  resp.body

                    var certTemplate={
                        request:{
                            query:{
                             match_phrase:{
                                 "recipient.id" :visCode 
                             }
                            }
                        }
                    }

                    let option3 = {
                        json: true,
                        headers:tempHeader,
                        body:certTemplate,
                        url: certificateBaseUrl+"/search"
                        
                        
                     } 

                     request.post(option3, function (err, resp) {
                        if(res){
                        var certResponse = resp.body
                        var earnedBadges = []
                        try{
                            var certArray = certResponse.result.response.hits
                            certArray.forEach(element => {                               
                                const badgeName = element._source.data.badge.name
                                earnedBadges.push(cache.get(badgeName))
                            })
                        }catch(e){
                            console.log("Error in certification process or No certificate assigned"+e)
                        }

                        var totalPoints = 0;
                        var activityStall = []
                        visitorActivityDetails.result.VisitorActivity.forEach(element => {
                            let val = element.points;
                            if(val==undefined){
                                val = 0;
                            }
                            totalPoints += val;
                            activityStall.push(element.stallCode)


                        })
                    
                            var activityStallDetails =[]

                            activityStall.forEach(element=>{

                                var obj = {
                                    name: element,
                                    series:[{
                                        name:"timeSpent",
                                        value:100
                                    }]
                                }
                                activityStallDetails.push(obj)
                            })
                          
                                
                            //activities
                            visitorDetail['visitorActivity'] =activityStallDetails

                            visitorDetail['pointsEarned'] = totalPoints
                            visitorDetail['responseCode']="SUCCESSFUL"
                            visitorDetail['badges'] = earnedBadges
                            response.send(visitorDetail)
                        }else{
                            console.log(err)
                        }
                    
                     })

                

                    
                     
                    }
                })
              }catch(e){
                console.log("Some Error"+e)
                var resp = {
                    responseCode:"UNSUCCESSFUL"
                }
                response.send(resp)
              }
            }
        
        })
        
    }else{
        var resp = {
            responseCode:"UNSUCCESSFUL"
        }
        response.send(resp)
    
    }
  

  
    


  
})
        
server.listen(9090, function () {
    console.log("util service listening on port " + 9090);
})