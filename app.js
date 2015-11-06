var express = require('express');
var path = require('path');
var favicon = require('serve-favicon');
var logger = require('morgan');
var cookieParser = require('cookie-parser');
var bodyParser = require('body-parser');
var fs = require('fs');

var routes = require('./app_server/routes/index');
var temperatures = require('./app_server/routes/temperatures');

// adding the REST API
var routesApi = require('./app_api/routes/index');


var app = express();

// view engine setup
app.set('views', path.join(__dirname, 'app_server', 'views'));
app.set('view engine', 'jade');

app.use(logger('dev'));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({
    extended: false
}));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));

app.use('/', routes);
app.use('/temperatures', temperatures);

// adding the REST API
app.use('/api', routesApi);


// catch 404 and forward to error handler
app.use(function (req, res, next) {
    var err = new Error('Not Found');
    err.status = 404;
    next(err);
});

// Generate baseUrl in public/scripts/baseUrl-generated.js
// 'public/scripts/baseUrl-generated.js' must be in ignore list of nodemon.json to prevent circular dependency.
var url = process.env.NODE_ENV === 'production' ? 'http://camel:3000' : 'http://localhost:3000';
var baseUrl = 'var baseUrl = \'' + url + '\';\n';
var file = 'public/scripts/baseUrl-generated.js';
fs.writeFile(file, baseUrl);


// error handlers ====================================================

// development error handler
// will print stacktrace
if (app.get('env') === 'development') {
    app.use(function (err, req, res, next) {
        res.status(err.status || 500);
        res.render('error', {
            message: err.message,
            error: err
        });
    });
}

// production error handler
// no stacktraces leaked to user
app.use(function (err, req, res, next) {
    res.status(err.status || 500);
    res.render('error', {
        message: err.message,
        error: {}
    });
});


module.exports = app;
