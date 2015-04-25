$(function () {
	getAll(function (data) {
		renderChart(data);
	});
});

var renderChart = function(data) {
	var flotdata = convertDataForFlot(data);
	var options = { xaxis: { mode: 'time' } };
	$.plot($('#placeholder'), flotdata, options);
};

var convertDataForFlot = function(data) {
	var flotdata = [];
	flotdata.push(mapTimeSeries(data, 'WA'));
	flotdata.push(mapTimeSeries(data, 'Z2'));
	return flotdata;
};

var mapTimeSeries = function (data, sensorName) {
	var series = [];
	for(var i = 0; i < data.length; i++) {
		if (data[i].sensorName === sensorName) {
			series.push([ (new Date(data[i].timestamp)).getTime(), data[i].degreeCelsius ]);
		}
	}
	return series;
};
