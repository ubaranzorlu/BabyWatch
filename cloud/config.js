
let DB_URI = process.env.DB_URI || "mongodb://localhost:27017/watchingBabies";
let SESS = process.env.SESS || "SANA KIRMIZI ÇOK YAKIŞIYOR";

module.exports = {
    "sessionSecret": SESS,
    "mongo" : {
        "uri" : DB_URI
    }
};