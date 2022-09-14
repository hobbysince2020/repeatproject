const dialogflow = require('@google-cloud/dialogflow');
const mongoose = require('mongoose')
const { WebhookClient } = require('dialogflow-fulfillment');
const express = require("express")
const cors = require("cors");
var moment=require("moment")
const { detailsScehma } = require('./detailsScehma');
// var sessionClient = new dialogflow.SessionsClient();
const app = express();
app.use(express.json())
app.use(cors());

const PORT = process.env.PORT || 8080;

//db setup
mongoose.connect('mongodb+srv://asadalikhan:asadalikhan@cluster0.qwgbhlm.mongodb.net/?retryWrites=true&w=majority').then(() => console.log("connection succesfull")).catch((error) => console.log(error))

//schema
// const MilestoneModel = mongoose.model("Milestone", MilestoneSchema)

const callDetailModel = mongoose.model("callDetails", detailsScehma)

var array = [];
var counter = 0
var name;
var startTime
var endTime
app.post("/webhook", async (req, res) => {
    var id = (res.req.body.session).substr(43);
    console.log(id)
    const agent = new WebhookClient({ request: req, response: res });

    function hi(agent) {
        startTime = Date.now();
        array = []
        console.log(`intent  =>  hi`);
        agent.add('Welcome to ABC solutions. Can i have your name please?')
        // counter =0;
        counter = 1
    }

    function myName(agent) {
        name = agent.parameters.name.name
        console.log(name)
        console.log(`intent  =>  myName`);
        agent.add(`How are you ${name}`)
        counter += 1
    }

    function feeling(agent) {
        console.log(`intent  =>  feeling`);
        agent.add(`What would you like to do`)
        counter += 1
    }

    function fallback(agent) {
        array.push(agent.query)
        console.log(`intent  =>  fallback`);
        agent.add(agent.query)
    }

    function exitconversation(agent) {
        endTime = Date.now();
        var differnce = endTime - startTime
        var newDate=moment.duration(differnce)
        var format =`${String(newDate._data.hours).padStart(2,"0")}:${String(newDate._data.minutes).padStart(2,"0")}:${String(newDate._data.seconds).padStart(2,"0")}`
        console.log(format)

        counter += array.length
        const table = new callDetailModel({ id: id, responses: array, transactions: counter, name: name ,callDuration:format})
        table.save().then(() => {
            console.log("Record added successfully");
        }).catch((error) => { console.log(error) })
        agent.add("Good Bye")

        console.log(array, counter)
    }

    let intentMap = new Map();
    intentMap.set('hi', hi);
    intentMap.set('myName', myName);
    intentMap.set('feeling', feeling);
    intentMap.set('fallback', fallback);
    intentMap.set('exitconversation', exitconversation);
    agent.handleRequest(intentMap);
})

app.get('/getdetails', async (req, res) => {
    callDetailModel.find()
        .then((response) => {
            res.status(200).send(response)
        })
        .catch((err) => {
            res.status(500).send(err)
        })
})
app.get('/', async (req, res) => {
 res.send("Hobby Lobby")
})
app.listen(PORT, () => {
    console.log(`server is running on port ${PORT}`);
});

