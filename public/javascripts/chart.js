$(function () {
	getAll(function (data) {
		renderChart(data);
	});
});

var renderChart = function(data) {

	var flotdata = convertDataForFlot(data);

	var options = {
		xaxis: { mode: 'time' },
		series: {
			lines: { show: true },
			points: { show: false }
		},
		legend: { show: true },
		grid: {
			hoverable: true,
			clickable: true
		},
		selection: { mode: 'x' }
	};

	var placeholder = $('#placeholder');
	var plot = $.plot(placeholder, flotdata, options);

	showTooltip();
	zoom(plot, placeholder);
	pane(plot, placeholder);
};

var pane = function (plot, placeholder) {
	
	function addArrow(dir, right, top, offset) {
		$("<img class='button' src='/images/arrow-" + dir + ".gif' style='right:" + right + "px;top:" + top + "px'>")
			.appendTo(placeholder)
			.click(function (e) {
				e.preventDefault();
				plot.pan(offset);
			});
	}
	
	addArrow('left', 600, 275, {left: -50});
	addArrow('right', -20, 275, {left: 50});
};

var zoom = function (plot, placeholder) {

	var min = plot.getData()[0].data[0][0];
	var lastEntryPos = plot.getData()[0].data.length - 1;
	var max = plot.getData()[0].data[lastEntryPos][0];

	// Zoom in (only x axis)
	placeholder.bind('plotselected', function (event, ranges) {
		$.each(plot.getXAxes(), function (_, axis) {
			var opts = axis.options;
			opts.min = ranges.xaxis.from;
			opts.max = ranges.xaxis.to;
		});
		plot.setupGrid();
		plot.draw();
		plot.clearSelection();
	});

	// Zoom out (back to origin size)
	$("<div class='button' style='left:30px;bottom:40px'>zoom out</div>")
		.appendTo(placeholder)
		.click(function (event) {
			event.preventDefault();
			plot.setSelection({
				xaxis: { from: min, to: max }
			});
		});
};

var showTooltip = function(){
	$('<div id="tooltip"></div>').css({
		position: 'absolute',
		display: 'none',
		border: '1px solid #fdd',
		padding: '2px',
		'background-color': '#fee',
		opacity: 0.80
	}).appendTo('body');
	
	$('#placeholder').bind('plothover', function (event, pos, item) {
		if (item) {
			var x = item.datapoint[0],
				y = item.datapoint[1].toFixed(1);
			$('#tooltip').html(formatDate(x) + ' : <strong>' + y + '&deg;C</strong>')
				.css({top: item.pageY+5, left: item.pageX+5})
				.fadeIn(200);
		} else {
			$('#tooltip').hide();
		}
	});
};

var formatDate = function(date) {
	// requires moment.js
	return moment.utc(new Date(date)).format('ddd, YYYY MMM DD HH:mm');
};

var convertDataForFlot = function(data) {
	var flotdata = [];
	flotdata.push(mapTimeSeries(data, 'WA', 'outside'));
	flotdata.push(mapTimeSeries(data, 'Z2', '2nd floor'));
	return flotdata;
};

var mapTimeSeries = function (data, sensorName, label) {
	var series = [];
	for(var i = 0; i < data.length; i++) {
		if (data[i].sensorName === sensorName) {

			// Note: Flot library expects time series data to be in milliseconds since 1970 ('.getTime()').
			// Flot library does not care about time zones.
			var dateWithTimezone = new Date(data[i].timestamp);
			var milliSecondsSince1970Utc = dateWithTimezone.getTime();
			var offsetInMinutes = dateWithTimezone.getTimezoneOffset();
			var offsetInMilliSeconds = offsetInMinutes * 60 * 1000;

			// We have to subtract (!) the time zone difference to fake a new utc time matching our local time zone.
			var fakedUtcTimeInMilliSeconds = milliSecondsSince1970Utc - offsetInMilliSeconds;

			series.push([ fakedUtcTimeInMilliSeconds, data[i].degreeCelsius ]);
		}
	}
	return { data: series, label: label };
};
