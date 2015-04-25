
var getAll = function (callback) {
	var request = $.ajax({
		url: 'http://localhost:3000/api/temperatures',
		success: function (data) {
			callback(data);
		}
	});
};

