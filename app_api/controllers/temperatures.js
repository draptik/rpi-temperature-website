var temperatureBackend = require('../models/db');

var sendJSONresponse = function(res, status, content) {
	res.status(status);
	res.json(content);
};

module.exports.index = function(req, res) {
	// console.log('API temperatures.index called..');
	temperatureBackend.getAll(function (data) {
		sendJSONresponse(res, 200, data);
	});
};
