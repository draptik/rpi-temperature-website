
var request = require('request');
var apiOptions = {
	server: 'http://localhost:3000'
};

if (process.env.NODE_ENV === 'production') {
	apiOptions.server = 'https://your-live-server-for-this-app,com';
}


/* GET home page */
module.exports.index = function(req, res, next) {
	res.render('index', { title: 'Express4x' });
};
