var url = require('../config').db_url
var sqlite3 = require('sqlite3').verbose();
var db = new sqlite3.Database(url, sqlite3.OPEN_READWRITE);

db.serialize();

function update_temp(timestamp, temp){
    db.run("INSERT INTO temps VALUES (?, ?)", timestamp, temp);
}

module.exports = db
module.exports.update_temp = update_temp