var sqlite3 = require('sqlite3');
var db = new sqlite3.Database('templog.sqlite3');

module.exports.getAll = function () {
	db.run(sqlQuery, function (err) {
		if (err !== null) {
			// TODO Error handling
			console.log('Error during sql query: ' + err);
		} else {
			// TODO Return collection from db as json object.
			console.log('No error return from sql query.');
		}
	});
};

