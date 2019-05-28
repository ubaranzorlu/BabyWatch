var mongoose = require('mongoose');

var deviceSchema = new mongoose.Schema({
    "user": String,
    "baby": String,
    "token": String
});

var device = mongoose.model('device', deviceSchema);

module.exports = {
    device: device
}