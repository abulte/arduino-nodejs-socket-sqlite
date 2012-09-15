var url = require('../config').db_url
var sqlite3 = require('sqlite3').verbose();
var db = new sqlite3.Database(url, sqlite3.OPEN_READWRITE);

db.serialize();

function update(table, timestamp, data){
    db.run("INSERT INTO " + table + " VALUES (?, ?)", timestamp, data);
}

module.exports = db
module.exports.update = update