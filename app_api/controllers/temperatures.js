var temperatureBackend = require('../models/db');

var sendJSONresponse = function (res, status, content) {
    res.status(status);
    res.json(content);
};

module.exports.index = function (req, res) {
    // console.log('API temperatures.index called..');
    temperatureBackend.getAll(function (data) {
        sendJSONresponse(res, 200, data);
    });
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
