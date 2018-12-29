var temperatureBackend = require('../models/db');

var filterContent = function(data) {
    var minRealisticTemperatureInDegreeCelsius = -40;
    var maxRealisticTemperatureInDegreeCelsius = 100;

    var filteredContent = data.filter(function(x) {
        return x.degreeCelsius > minRealisticTemperatureInDegreeCelsius &&
	       x.degreeCelsius < maxRealisticTemperatureInDegreeCelsius;
    });

    return filteredContent;
}

var sendJSONresponse = function (res, status, content) {
    res.status(status);
    res.json(filterContent(content));
};

module.exports.index = function (req, res) {
    console.log('API temperatures.index called..');
    console.log(req.query);
    if (req.query && req.query.minDate && req.query.maxDate) {
        temperatureBackend.getByFilter(req.query.minDate, req.query.maxDate, function (data) {
            sendJSONresponse(res, 200, data);
        });
    } else {
        temperatureBackend.getAll(function (data) {
            sendJSONresponse(res, 200, data);
        });
    }
};

module.exports.fortnight = function (req, res) {
    temperatureBackend.getFortnight(function (data) {
        if (!data || data.length === 0) {
            // 204: No content
            sendJSONresponse(res, 204, data);
            return;
        }
        sendJSONresponse(res, 200, data);
    });
};

module.exports.statisticsForDay = function (req, res) {
    temperatureBackend.getStatsForDay(req.query.searchDate, function (data) {
        sendJSONresponse(res, 200, data);
    });
};

module.exports.apiByRowId = function (req, res) {
    temperatureBackend.getNewerThanRowId(req.query.rowId, function (data) {
	sendJSONresponse(res, 200, data);
    });
};
