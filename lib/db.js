var sqlite3 = require('sqlite3').verbose();
var db = new sqlite3.Database('/home/alexandre/temps_node/temps.db');

db.serialize();

module.exports = db