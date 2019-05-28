var mongoose = require('mongoose');

var babySchema = new mongoose.Schema({
    "name": String,
    "surname": String,
    "birthDate": Date,
    "gender": Boolean,
    "photo": String,
    "user": String
});

var baby = mongoose.model('baby', babySchema);

module.exports = {
    baby: baby
}