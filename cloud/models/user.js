var mongoose = require("mongoose");
var bcrypt = require("bcrypt");

var UserSchema = new mongoose.Schema({
    email: {
      type: String,
      unique: true,
      required: true,
      trim: true
    },
    username: {
      type: String,
      unique: true,
      required: true
    },
    password: {
      type: String,
      required: true
    },
    name: String,
    surname: String,
    mobilePhone: String
});

UserSchema.pre("save", function (next) {
    var user = this;
    bcrypt.hash(user.password, 10, function (err, hash) {
      if (err) {
        return next(err);
      }
      user.password = hash;
      next();
    });
});

var user = mongoose.model("user", UserSchema);

user.authenticate = function (email, password, callback) {
    user.findOne({ $or: [{email: email},{username: email} ] }).exec(function (err, user) {
      if (err) {
        return callback(err);
      } else if (!user) {
        var err = new Error("User not found.");
        err.status = 401;
        return callback(err);
      }
      bcrypt.compare(password, user.password, function (err, result) {
        if (result === true) {
          return callback(null, user);
        } else {
          return callback();
        }
      });
    });
  };
  
  module.exports = {
    user: user
  };