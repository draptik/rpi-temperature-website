/* global baseUrl */
// 'baseUrl' is retrieved from generated file 'baseUrl-generated.js'.

var getAll = function (callback) {
    $.ajax({
        url: baseUrl + '/api/temperatures',
        success: function (data) {
            callback(data);
        }
    });
};

var getFortnight = function (callback) {
    $.ajax({
        url: baseUrl + '/api/temperatures/fortnight',
        success: function (data) {
            callback(data);
        }
    });
};

var getByFilter = function (minDate, maxDate, callback) {
    console.log('getByFilter called...');
    $.ajax({
        url: baseUrl + '/api/temperatures?minDate=' + minDate + '&maxDate=' + maxDate,
        success: function (data) {
            callback(data);
        }
    });
};
