const express = require('express');
const app = express();
const bodyParser = require("body-parser");
const MongoClient = require("mongodb").MongoClient;
const ObjectID = require('mongodb').ObjectID;
const mongoose = require("mongoose");
const session = require("express-session");
const cookieParser = require("cookie-parser");
const MongoStore = require("connect-mongo")(session);
const helmet = require('helmet');
const CONFIG = require('../config.js');
const url = require("url");

let nav = [
  {
    title: 'Dashboard',
    url: '/dash',
    icon: 'dashboard'
  },
  {
    title: 'Babies',
    url: '/dash/babies',
    icon: 'child_care'
  },
  {
    title: 'Devices',
    url: '/dash/devices',
    icon: 'device_hub'
  },
  {
    title: 'User',
    url: '/dash/user',
    icon: 'person'
  },
  {
    title: 'Logout',
    url: '/logout',
    icon: 'arrow_right_alt'
  }
];

var router = express.Router();

router.use(helmet());

mongoose.connect(CONFIG.mongo.uri, { useNewUrlParser: true });
const models = {
  user: require("../models/user").user,
  baby: require("../models/baby").baby,
  device: require('../models/device').device,
  data: require("../models/data").data
};

router.use(cookieParser());
router.use(bodyParser.urlencoded({ extended: true }));
router.use(bodyParser.json());

router.use(
    session({
      secret: CONFIG.sessionSecret,
      resave: true,
      saveUninitialized: false,
      store: new MongoStore({
        mongooseConnection: mongoose.connection
      })
    })
);

router.get('/',(req,res) => {
    res.render("pages/dash", {
        title: "Dashboard",
        args: req.args,
        nav: nav
    });
});
router.get('/babies',(req,res) => {
    models.baby.find({user: req.session.username},(err,doc) => {
      if(err) res.send(err);
      res.render("pages/babies", {
        title: "Babies",
        args: req.args,
        nav: nav,
        babies: doc
      });
    });
    
});

router.post('/babies',(req,res) => {
  if (
    req.body.name &&
    req.body.surname && req.body.birthdate && req.body.gender
) {
    var babyData = {
    name: req.body.name,
    birthDate: new Date(req.body.birthdate),
    surname: req.body.surname,
    gender: req.body.gender,
    user: req.session.username
    };

    models.baby.create(babyData, function (err, baby) {
    if (err) {
        return res.send(err);
    } else {
        return res.redirect('/dash/babies');
    }
    });
}
});

router.post('/babies/del',(req,res) => {
  models.baby.remove({_id : ObjectID(req.body.babyId)},(err,doc) => {
    if(err){
      res.send(err);
    }else{
      res.send("OK");
    }
  });
});

router.get('/devices',(req,res) => {
  models.device.find({user: req.session.username},(err,doc) => {
    if(err) res.send(err);
    models.baby.find({user: req.session.username},(err,babies) => {
      if(err) res.send(err);
      doc.forEach((dev,i) => {
        let baby = babies.find(x => x._id.toString() === dev.baby.toString());
        if(baby){
          doc[i].baby = baby.name;
        }
      });
      res.render("pages/devices", {
        title: "Devices",
        args: req.args,
        nav: nav,
        devices: doc,
        babies: babies
      });
    });
  });
  
});

router.post('/devices',(req,res) => {
if (
  req.body.deviceId && req.body.babyId
) {

  models.device.findOneAndUpdate(
    { _id: ObjectID(req.body.deviceId) },
    {user: req.session.username,
      baby: req.body.babyId},
    { runValidators: true },
    function (err, doc) {
        if (err) {
            res.send({ status: 'failed' });
        } else {
            res.send({ status: 'ok' });
        }
    }
  );
}
});

router.post('/devices/del',(req,res) => {
  models.device.findOneAndUpdate(
    { _id: ObjectID(req.body.deviceId) },
    {user: null, baby: null},
    { runValidators: true },
    function (err, doc) {
        if (err) {
            res.send({ status: 'failed' });
        } else {
            res.send({ status: 'ok' });
        }
    }
  );
});

module.exports = router;


