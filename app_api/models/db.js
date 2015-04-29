var sqlite3 = require('sqlite3');
var fs = require('fs');

var dbLocation = process.env.NODE_ENV === 'production'
		? '/var/www/templog.db'
		: 'sample_data/templog.db';

var exists = fs.existsSync(dbLocation);

if (!exists) {
	console.log('db file does not exist.');
} else {
	console.log('db file exists.');
}

var db = new sqlite3.Database(dbLocation);

module.exports.getAll = function (callback) {

	var sqlQuery = 'SELECT * FROM temps';
	
	db.all(sqlQuery, function (err, rows) {
		if (err !== null) {
			// TODO Error handling
			console.log('Error during sql query: ' + err);
		} else {
			var temperatureData = [];

			for(var i = 0; i < rows.length; i++) {
				temperatureData.push({
					degreeCelsius: rows[i].temp,
					sensorName: rows[i].ID,
					timestamp: rows[i].timestamp
				});
			}

			callback(temperatureData);
		}
	});
};
