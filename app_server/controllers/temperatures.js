
var request = require('request');
var apiOptions = {
	server: 'http://localhost:3000'
};

if (process.env.NODE_ENV === 'production') {
	apiOptions.server = 'https://your-live-server-for-this-app,com';
}


var renderPage = function (req, res, responseBody) {
	var message;

	if (!(responseBody instanceof Array)) {
		message = 'API lookup error';
		responseBody = [];
	} else {
		if (!responseBody.length) {
			message = 'No temperatures found.';
		}
	}

	res.render('temperatures-list', {
		title: 'Some title',
		pageHeader: {
			title: 'Another title',
			strapLine: 'Some strapline'
		},
		temperatures: responseBody,
		message: message
	});
};

/* GET temperatures page */
module.exports.index = function(req, res, next) {
	var requestOptions, path;
	path = '/api/temperatures';
	requestOptions = {
		url: apiOptions.server + path,
		method: 'GET',
		json: {}
	};

	request(requestOptions, function (err, response, body) {
		var i, data;
		data = body;
		if (response.statusCode === 200 && data.length) {
			console.log('Status code not 200...');
		}

		renderPage(req, res, data);
	});
};
