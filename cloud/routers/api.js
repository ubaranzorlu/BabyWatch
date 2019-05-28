const express = require('express');
const ObjectID = require('mongodb').ObjectID;
const mongoose = require("mongoose");
const CONFIG = require('../config.js');

var router = express.Router();

mongoose.connect(CONFIG.mongo.uri, { useNewUrlParser: true });

const models = {
  user: require("../models/user").user,
  baby: require("../models/baby").baby,
  device: require('../models/device').device,
  data: require("../models/data").data
};

router.get('/', (req,res) => {
    res.send('Yasak topraklardasın!');
});

router.post('/sendData',(req,res) => {

    if(req.body.deviceId && req.body.secretKey){
        let buff = new Buffer(req.body.secretKey, 'base64');  
        let text = buff.toString('ascii');
        models.device.findOne({_id: ObjectID(req.body.deviceId), token:text}, (err,doc) => {
            if(err){
                res.status(401).send('Unauthorized');
            }else if(doc){
                let timestamp = Date.now();
                models.data.create({
                    "deviceId": req.body.deviceId,
                    "babyId": doc.baby,
                    "isCrying": req.body.soundCount > 10,
                    "soundCount": req.body.soundCount,
                    "motionCount": req.body.motionCount,
                    "timestamp": timestamp
                }, function (err, baby) {
                    if (err) {
                        res.status(500).send('Error Inserting Into Database!');
                    } else {
                        res.status(200).send("OK");
                    }
                    });
            }else{
                res.status(401).send('Unauthorized');
            }
        });

    }else{
        res.status(401).send('Unauthorized');
    }
});

module.exports = router;