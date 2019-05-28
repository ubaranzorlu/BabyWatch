var mongoose = require('mongoose');

var dataSchema = new mongoose.Schema({
    "deviceId": String,
    "babyId": String,
    "isCrying": Boolean,
    "soundCount": Number,
    "motionCount": Number,
    "timestamp": Date
});

var data = mongoose.model('data', dataSchema);

module.exports = {
    data: data
}