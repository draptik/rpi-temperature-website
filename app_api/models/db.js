var sqlite3 = require('sqlite3');
var fs = require('fs');
var file = 'sample_data/templog.db';
var exists = fs.existsSync(file);

if (!exists) {
	console.log('file does not exist.');
} else {
	console.log('file exists.');
}

var db = new sqlite3.Database(file);

module.exports.getAll = function (callback) {
	// TODO Replace with DB call:
	// tempData = [
	// 	{degreeCelsius: 19.0, sensorName: 'Z2', timestamp: '2015-01-01 12:00:00'},
	// 	{degreeCelsius: 19.0, sensorName: 'WU', timestamp: '2015-01-01 12:05:00'},
	// 	{degreeCelsius: 19.0, sensorName: 'WU', timestamp: '2015-01-01 12:10:00'},
	// 	{degreeCelsius: 19.0, sensorName: 'WU', timestamp: '2015-01-01 12:15:00'},
	// 	{degreeCelsius: 19.0, sensorName: 'WU', timestamp: '2015-01-01 12:20:00'},
	// 	{degreeCelsius: 20.0, sensorName: 'Z2', timestamp: '2015-01-01 13:00:00'},
	// 	{degreeCelsius: 19.0, sensorName: 'WU', timestamp: '2015-01-01 13:05:00'},
	// 	{degreeCelsius: 19.0, sensorName: 'WU', timestamp: '2015-01-01 13:10:00'},
	// 	{degreeCelsius: 19.0, sensorName: 'WU', timestamp: '2015-01-01 13:15:00'},
	// 	{degreeCelsius: 19.0, sensorName: 'WU', timestamp: '2015-01-01 13:20:00'},
	// 	{degreeCelsius: 21.0, sensorName: 'Z2', timestamp: '2015-01-01 14:00:00'},
	// 	{degreeCelsius: 19.0, sensorName: 'WU', timestamp: '2015-01-01 14:05:00'},
	// 	{degreeCelsius: 19.0, sensorName: 'WU', timestamp: '2015-01-01 14:10:00'},
	// 	{degreeCelsius: 19.0, sensorName: 'WU', timestamp: '2015-01-01 14:15:00'},
	// 	{degreeCelsius: 19.0, sensorName: 'WU', timestamp: '2015-01-01 14:20:00'}
	// ];
	// return tempData;

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
