const express = require('express');
const app = express();
const bodyParser = require("body-parser");
const MongoClient = require("mongodb").MongoClient;
const mongoose = require("mongoose");
const session = require("express-session");
const cookieParser = require("cookie-parser");
const MongoStore = require("connect-mongo")(session);
const helmet = require('helmet');
const CONFIG = require('../config.js');
const url = require("url");

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

router.use((req,res,next) => {
    req.args = {};
    next();
});

router.get('/',(req,res) => {
    res.render("pages/dash", {
        title: "Dashboard",
        args: req.args
    });
});

module.exports = router;


