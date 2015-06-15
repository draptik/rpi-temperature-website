var sqlite3 = require('sqlite3');
var fs = require('fs');

var dbLocation = process.env.NODE_ENV === 'production' ? '/var/www/templog.db' : 'sample_data/templog.db';

var exists = fs.existsSync(dbLocation);

if (!exists) {
    console.log('db file does not exist.');
} else {
    console.log('db file exists.');
}

var db = new sqlite3.Database(dbLocation);

var getByQuery = function (query, cb) {
    db.all(query, function (err, rows) {
        if (err !== null) {
            // TODO Error handling
            console.log('Error during sql query: ' + err);
        } else {
            var temperatureData = [];

            for (var i = 0; i < rows.length; i++) {
                temperatureData.push({
                    degreeCelsius: rows[i].temp,
                    sensorName: rows[i].ID,
                    timestamp: rows[i].timestamp
                });
            }

            cb(temperatureData);
        }
    });
};


module.exports.getAll = function (callback) {
    var sqlQuery = 'SELECT * FROM temps';
    getByQuery(sqlQuery, callback);
};

module.exports.getFortnight = function (callback) {
    var sqlQuery = "SELECT * FROM temps WHERE timestamp BETWEEN datetime('now', '-14 days') AND datetime('now', 'localtime')";
    getByQuery(sqlQuery, function (data) {
        if (!data || data.length === 0) {
            // Fallback: get last 2 weeks which are present in the database
            var sqlQueryFallback = "SELECT * FROM temps " +
                "WHERE timestamp " +
                "   BETWEEN datetime( (select max(timestamp) from temps), '-14 days') " +
                "   AND datetime((select max(timestamp) from temps), 'localtime');";
            getByQuery(sqlQueryFallback, callback);
        } else {
            callback(data);
        }
    });
};
