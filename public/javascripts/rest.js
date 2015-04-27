// 'baseUrl' is retrieved from generated file 'baseUrl-generated.js'.

var getAll = function (callback) {
	var request = $.ajax({
		url: baseUrl + '/api/temperatures',
		success: function (data) {
			callback(data);
		}
	});
};

