
/* GET temperatures page */
module.exports.index = function(req, res, next) {
	res.render('temperatures-list', {
		title: 'RPi temperatures',
		pageHeader: {
			title: 'Temperatures'
		}
	});
};
