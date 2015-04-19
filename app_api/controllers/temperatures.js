

var sendJSONresponse = function(res, status, content) {
	res.status(status);
	res.json(content);
};

module.exports.index = function(req, res) {
	console.log('API temperatures.index called..');
	// TODO Replace with DB call:
	var tempData = [
		{degreeCelsius: 19.0, sensorName: 'Z2', timestamp: '2015-01-01 12:00:00'},
		{degreeCelsius: 19.0, sensorName: 'WU', timestamp: '2015-01-01 12:05:00'},
		{degreeCelsius: 19.0, sensorName: 'WU', timestamp: '2015-01-01 12:10:00'},
		{degreeCelsius: 19.0, sensorName: 'WU', timestamp: '2015-01-01 12:15:00'},
		{degreeCelsius: 19.0, sensorName: 'WU', timestamp: '2015-01-01 12:20:00'},
		{degreeCelsius: 20.0, sensorName: 'Z2', timestamp: '2015-01-01 13:00:00'},
		{degreeCelsius: 19.0, sensorName: 'WU', timestamp: '2015-01-01 13:05:00'},
		{degreeCelsius: 19.0, sensorName: 'WU', timestamp: '2015-01-01 13:10:00'},
		{degreeCelsius: 19.0, sensorName: 'WU', timestamp: '2015-01-01 13:15:00'},
		{degreeCelsius: 19.0, sensorName: 'WU', timestamp: '2015-01-01 13:20:00'},
		{degreeCelsius: 21.0, sensorName: 'Z2', timestamp: '2015-01-01 14:00:00'},
		{degreeCelsius: 19.0, sensorName: 'WU', timestamp: '2015-01-01 14:05:00'},
		{degreeCelsius: 19.0, sensorName: 'WU', timestamp: '2015-01-01 14:10:00'},
		{degreeCelsius: 19.0, sensorName: 'WU', timestamp: '2015-01-01 14:15:00'},
		{degreeCelsius: 19.0, sensorName: 'WU', timestamp: '2015-01-01 14:20:00'}
	];
	sendJSONresponse(res, 200, tempData);
};
