// for security, real service

var mysql = require('mysql');
var db = mysql.createConnection({
    host     : 'localhost',
    user     : 'root',
    password : 'gpdnjs09',
    database : 'opentutorals3'
});
db.connect();
module.exports = db;