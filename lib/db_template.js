// For version management

var mysql = require('mysql'); // after $ npm install --save mysql
var db = mysql.createConnection({
    host     : '',
    user     : '',
    password : '',
    database : ''
});
db.connect(); // Connect to mysql
module.exports = db;