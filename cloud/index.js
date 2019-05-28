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
const PORT = process.env.PORT || 5000;

app.use(helmet());

mongoose.connect(CONFIG.mongo.uri, { useNewUrlParser: true });
const models = {
  user: require("./models/user").user,
  baby: require("./models/baby").baby,
  device: require('./models/device').device,
  data: require("./models/data").data
};

let nav = [
  {
    title: 'Homepage',
    url: '/',
    icon: 'home'
  },
  {
    title: 'Login',
    url: '/login',
    icon: 'person'
  },
  {
    title: 'Register',
    url: '/register',
    icon: 'person_add'
  }
];

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

app.use((req,res,next) => {
  req.args = {};
  req.args.url = req.originalUrl;
  next();
});

var api = require("./routers/api");

app.use(function (req, res, next) {
    if (
        (req.session && req.session.username) ||
        req.url.includes("/login") ||
        req.url.includes("/api") ||
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


var dash = require("./routers/dash");

 app.use("/api", api);
 app.use("/dash", dash);
// app.use("/user", user);

app.set("view engine", "ejs");

app.get("/", function (req, res) {
    (req.session && req.session.username) ? res.redirect("/dash") : res.sendFile(__dirname + '/views/static/index.html');
});

app.get("/register", function (req, res) {
  res.render("pages/register", {
    title: "Register",
    args: req.args,
    nav: nav
  });
});

app.get("/login", function (req, res) {
  res.render("pages/login", {
    title: "Login",
    args: req.args,
    nav: nav
  });
});

app.post("/register", function (req, res) {
    if (
        req.body.email &&
        req.body.password === req.body.passwordConf
    ) {
        var userData = {
        email: req.body.email,
        name: req.body.name,
        username: req.body.username,
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
                error: "Wrong login details!",
                email : req.body.email || ''
              }
            })
          );
        } else {
          req.session.username = user.username;
          return res.redirect("/dash");
        }
      });
    } else {
      res.redirect(
        url.format({
          pathname: "/login",
          query: {
            error: "One or more field is empty!",
            email : req.body.email || ''
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

app.listen(PORT, function () {
    console.log("magic happens on *:" + PORT);
});
  