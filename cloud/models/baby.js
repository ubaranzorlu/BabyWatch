var mongoose = require('mongoose');

var babySchema = new mongoose.Schema({
    "name": String,
    "surname": String,
    "birthDate": Date,
    "gender": String,
    "photo": String
});

var baby = mongoose.model('baby', babySchema);

module.exports = {
    baby: baby
}