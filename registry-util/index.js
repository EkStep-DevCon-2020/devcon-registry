const express = require("express");
const http = require("http");
const app = express();
var bodyParser = require("body-parser");
var cors = require("cors")
const request = require('request')
const dotenv = require('dotenv');
const axios = require('axios').default;
var HashMap = require('hashmap');


dotenv.config();


const server = http.createServer(app);
const registryBaseUrl = "https://devcon.sunbirded.org/api/reg";
const faceRegistryBaseUrl = "https://devcon.sunbirded.org/api/reghelper/face" 
const certificateBaseUrl = "https://devcon.sunbirded.org/api/certreg/v1/certs"
const druidApiUrl = " http://50.1.0.12:8082/druid/v2"

app.use(cors())
app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());

var cache = require('./cache.js');

const ReaderBadge = {
    url: "https://devcon2020.blob.core.windows.net/user/media/File-01296059240825651261.png",
    name: "Super Reader",
    id: "reader_small.png"
}

const ContributorBadge = {
    url: "https://devcon2020.blob.core.windows.net/user/media/File-01296059748405248064.png",
    name: "Contributor",
    id: "contributor.png"
}

const WinnerBadge = {
    url: "https://devcon2020.blob.core.windows.net/user/media/File-01296059593283993665.png",
    name: "Winner",
    id: "winner.png"
}

const ParticipationBadge = {
    url: "https://devcon2020.blob.core.windows.net/user/media/File-01296059247050752062.png",
    name: "Participation",
    id: "participation.png"
}

cache.set("Super Reader", ReaderBadge)
cache.set("Contributor", ContributorBadge)
cache.set("Winner", WinnerBadge)
cache.set("Participation certificate", ParticipationBadge)


let tempHeader = {
    'Authorization': "Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiIyZWU4YTgxNDNiZWE0NDU4YjQxMjcyNTU5ZDBhNTczMiJ9.7m4mIUaiPwh_o9cvJuyZuGrOdkfh0Nm0E_25Cl21kxE",
    'Content-type': 'application/json'
}


// Add new visitor
app.post("/visitor/new", (req,response,callback)=>{


    //call registerFace Api
    var uuid = req.body.request.osid
    var imageUrl = req.body.request.photo
    var name = req.body.request.name
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
                            createParticipationCertificate(name,uuid,imageUrl)
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

var displayArr[]
var lastDisplayId = 0

//Add Stall Details
app.post("/visitor/exit", (req,response,callback)=>{

    try{  
    //update exit time of a visitor
    var data = req.body.request
    if (lastDisplayId == 4) {
        // reset it
        lastDisplayId = 0
    }
    displayArr[lastDisplayId%4] = data
    lastDisplayId++

     if(data.osid || data.visitorCode) {
        resp = {
            responseCode:"OK"
        }
    }else{
        resp = {
            responseCode:"UNSUCCESSFUL"
        }
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

    if(displayArr.length >= 1){
        var searchTemplate={
            request:{
                entityType:["Visitor"]
            }
        }

        var data = displayArr[id-1]
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
            var visitorDetail = undefined;
            if (res) {
                var visitorDetails = res.body;
                try{
                visitorDetail = visitorDetails.result.Visitor[0];
                var entityArray = searchTemplate["request"]["entityType"]
                entityArray.pop()
                entityArray.push("VisitorActivity")
                const visCode = visitorDetail.code
                console.log("Visitor Code:" +visCode)
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
                                 "recipient.id": visitorDetail.osid
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
                        
                        var queryTemplate = getDruidTemplate(visitorDetail.osid)
                        let option4 = {
                            json: true,
                            headers:tempHeader,
                            body:queryTemplate,
                            url: druidApiUrl
                         } 
    
                         request.post(option4, function (err, resp) {
                            if(res){


                            var stats = resp.body

                            var activityStallDetails =[]
                            var map = new HashMap();

                            try{

                                stats.forEach(element =>{
                                   const stallId = element.event.stallId
                                    if(map.get(stallId)){
                                       
                                        var time = map.get(stallId)
                                        time += element.event.total_time_spent
                                        map.set(stallId,time)
                                    }else{
                                        
                                        map.set(stallId,element.event.total_time_spent)
                                    }
                                   
                                })

                                map.forEach(function(key,value){
                                    var obj = {
                                        name: value,
                                        series:[{
                                            name:"timeSpent",
                                            value:key
                                        }]
                                    }
                                    activityStallDetails.push(obj)
                                })



                           }catch(e){
                               console.log("Error getting druid data")
                           }
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
                            visitorActivityDetails.result.VisitorActivity.forEach(element => {
                                let val = element.points;
                                if(val==undefined){
                                    val = 0;
                                }
                                totalPoints += val;

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


function getDruidTemplate(osid)
{

    var queryTemplate ={
        queryType: "groupBy",
        dataSource: "devcon-events",
        intervals: [
            "2020-02-20T00:00:00.000Z/2020-02-22T00:00:00.000Z"
        ],
        dimensions: [
            "profileId",
            "stallId",
            "ideaId"
        ],
        aggregations: [
            {
                type: "doubleSum",
                name: "total_time_spent",
                fieldName: "edata_duration"
            }
        ],
        filter: {
            type: "and",
            fields: [
                {
                    type: "selector",
                    dimension: "eid",
                    value: "DC_EXIT"
                },
                {
                    type: "selector",
                    dimension: "profileId",
                    value: osid
                }
            ]
        },
        granularity: "all"
    }

    return queryTemplate
}



function createParticipationCertificate(name,id,image) {
// creating participation certificate async
console.log("recipientName",name)
console.log("recipientId",id)
console.log("recipientphoto",image)
axios.post('https://devcon.sunbirded.org/api/reghelper/certificate/v1/create',
    {
        request: {
            certificate: {
                name:"Participation certificate",
                htmlTemplate: "https://devcon2020.blob.core.windows.net/user/cert/File-01296051607112089631.zip",
                courseName: "DevCon-2020",
                issuedDate: "2020-02-20",
                data: [
                    {
                        recipientName: name,
                        recipientId: id,
                        recipientPhoto: image
                    }
                ],
                tag: "0125450863553740809",
                issuer: {
                    name: "EkStep",
                    url: "https://ekstep.org/"
                },
                criteria: {
                    narrative: "Participation in Devcon 2020"
                },
                signatoryList: [
                    {
                        name: "Devcon 2020 team",
                        id: "urn:EkStep:Devcon2020",
                        designation: "Management committee",
                        image: "https://devcon2020.blob.core.windows.net/user/cert/File-01296003072882278466.png"
                    }
                ]
            }
        }
    },{
        headers: tempHeader
      })
  .then(function (response) {
    console.log("the response got ",response.data);
  })
}
server.listen(9090, function () {
    console.log("util service listening on port " + 9090);
})