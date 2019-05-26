const express = require('express');
const app = express();
const bodyParser = require("body-parser");
const MongoClient = require("mongodb").MongoClient;
const mongoose = require("mongoose");
const session = require("express-session");
const cookieParser = require("cookie-parser");
const MongoStore = require("connect-mongo")(session);
const helmet = require('helmet');
const CONFIG = require('./config.js');
const url = require("url");

app.use(helmet());

mongoose.connect(CONFIG.mongo.uri, { useNewUrlParser: true });
const models = {
  user: require("./models/user").user,
  baby: require("./models/baby").baby,
  device: require('./models/device').device,
  data: require("./models/data").data
};

app.use(cookieParser());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());

app.use(
    session({
      secret: CONFIG.sessionSecret,
      resave: true,
      saveUninitialized: false,
      store: new MongoStore({
        mongooseConnection: mongoose.connection
      })
    })
  );
app.use('/assets',express.static('public'));
app.use(function (req, res, next) {
    if (
        (req.session && req.session.userId) ||
        req.url.includes("/login") ||
        req.url.includes("/assets") ||
        req.url.includes("/semantic") ||
        req.url === "/favicon.ico" ||
        req.url === "/logout" ||
        req.url === "/register"
    ) {
        return next();
    } else {
        res.redirect("/login");
    }
});

var user = require("./routers/user");
var api = require("./routers/api");
var dash = require("./routers/dash");

// app.use("/api", api);
 app.use("/dash", dash);
// app.use("/user", user);

app.set("view engine", "ejs");

app.get("/", function (req, res) {
    (req.session && req.session.userId) ? res.redirect("/dash") : res.sendFile(__dirname + '/views/static/index.html');
});

app.get("/register", function (req, res) {
    res.sendFile(__dirname + '/views/static/register.html');
});

app.get("/login", function (req, res) {
    res.sendFile(__dirname + '/views/static/login.html');
});

app.post("/register", function (req, res) {
    if (
        req.body.email &&
        req.body.password === req.body.passwordConf
    ) {
        var userData = {
        email: req.body.email,
        name: req.body.name,
        surname: req.body.surname,
        password: req.body.password
        };

        models.user.create(userData, function (err, user) {
        if (err) {
            return res.send(err);
        } else {
            return res.redirect("/");
        }
        });
    }
});

app.post("/login", function (req, res) {
    if (req.body.email && req.body.password) {
      models.user.authenticate(req.body.email, req.body.password, function (
        error,
        user
      ) {
        if (error || !user) {
          res.redirect(
            url.format({
              pathname: "/login",
              query: {
                error: "Wrong login details!"
              }
            })
          );
        } else {
          req.session.userId = user._id;
          return res.redirect("/dash");
        }
      });
    } else {
      res.redirect(
        url.format({
          pathname: "/login",
          query: {
            error: "One or more field is empty!"
          }
        })
      );
    }
});

app.get("/logout", function (req, res, next) {
    if (req.session) {
        req.session.destroy(function (err) {
            if (err) {
                return next(err);
            } else {
                return res.redirect("/");
            }
        });
    }
});

app.listen(5000, function () {
    console.log("magic happens on *:5000");
});
  