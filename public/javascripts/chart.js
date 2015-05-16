$(function () {
	getAll(function (data) {
		renderChart(data);
	});
});

var renderChart = function(data) {

	var flotdata = convertDataForFlot(data);

	var detailPlaceholder = $('#detail-placeholder');
	var detailPlot = $.plot(detailPlaceholder, flotdata, {
		xaxis: { mode: 'time' },
		series: {
			lines: { show: true },
			points: { show: true }
		},
		legend: { show: true },
		grid: {
			hoverable: true,
			clickable: true
		},
		selection: { mode: 'x'  }
		//,crosshair: { mode: '' }
	});

	var overviewPlaceholder = $('#overview-placeholder');
	var overviewPlot = $.plot(overviewPlaceholder, flotdata, {
		series: {
			lines: { show: true, lineWidth: 1 },
			shadowSize: 0,
			points: { show: false }
		},
		xaxis: { ticks: [], mode: "time" },
		yaxis: { ticks: [], min: 0, autoscaleMargin: 0.1 },
		legend: { show: false },
		grid: { hoverable: true },
		selection: { mode: 'x' }
		//,crosshair: { mode: 'x' }
	});
	
	showTooltip(detailPlaceholder);
	zoom(detailPlot, detailPlaceholder, overviewPlot, overviewPlaceholder);
	// pane(detailPlot, detailPlaceholder);

	$('#show-all').click(function (event) {
		event.preventDefault();
		detailPlot.setSelection(
			{ xaxis: {
				from: detailPlot.getData()[0].data[0][0],
				to: detailPlot.getData()[0].data[detailPlot.getData()[0].data.length - 1][0] }
			});
		overviewPlot.clearSelection();
	});
};

var zoom = function (detailPlot, detailPlaceholder, overviewPlot, overviewPlaceholder) {

	var currentRange;
	
	// Zoom in (only x axis)
	detailPlaceholder.bind('plotselected', function (event, ranges) {
		$.each(detailPlot.getXAxes(), function (_, axis) {
			var opts = axis.options;
			opts.min = ranges.xaxis.from;
			opts.max = ranges.xaxis.to;
		});
		detailPlot.setupGrid();
		detailPlot.draw();
		detailPlot.clearSelection();

		currentRange = ranges.xaxis; // update 'global' range for syncing all charts
		overviewPlot.setSelection(ranges, true);
	});

	overviewPlaceholder.bind('plotselected', function (event, ranges) {
		currentRange = ranges.xaxis; // update 'global' range for syncing all charts
		detailPlot.setSelection(ranges);
	});

	// hover range borders -------------------------------------------------------------------
	// var dragRangeInPixel = 10;
	
	// $('<div id="dragCursor"></div>')
	// 	.appendTo(overviewPlaceholder)
	// 	.css({
	// 		cursor: 'col-resize',
	// 		position: 'absolute',
	// 		top: '6px',
	// 		width: dragRangeInPixel + 'px',
	// 		height: '88px',
	// 		border: '1px solid red', // <-- for debugging
	// 		display: 'none'
	// 	});
		
	// NOTE: To use 'plothover' the plot option 'grid: { hoverable: true }' is required!
	overviewPlaceholder.bind('plothover', function (event, pos, item) {
		// if (currentRange) {
		// 	var from = overviewPlot.p2c({ x: currentRange.from, y: pos.y });
		// 	var to = overviewPlot.p2c({ x: currentRange.to, y: 0 });
		// 	var currentXPosPixel = overviewPlot.p2c({ x: pos.x, y: pos.y }).left;

		// 	var isInDragRange = function (currentX, targetX) {
		// 		return currentX >= (targetX.left - (dragRangeInPixel/2)) &&
		// 			currentX <= (targetX.left + (dragRangeInPixel/2));
		// 	};
			
		// 	if (isInDragRange(currentXPosPixel, from)) {
		// 		$('#dragCursor').css({left: from.left + (dragRangeInPixel/2), display: '' });
		// 	} else if (isInDragRange(currentXPosPixel, to)) {
		// 		$('#dragCursor').css({left: to.left + (dragRangeInPixel/2), display: '' });
		// 	} else {
		// 		$('#dragCursor').hide();
		// 	}
		// }
	});
};

var showTooltip = function(placeholder){
	$('<div id="tooltip"></div>').css({
		position: 'absolute',
		display: 'none',
		border: '1px solid #fdd',
		padding: '2px',
		'background-color': '#fee',
		opacity: 0.80
	}).appendTo('body');
	
	placeholder.bind('plothover', function (event, pos, item) {
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

// TODO Once paning from overview is implemented, this should not be needed anymore.
// var pane = function (plot, placeholder) {
// 	function addArrow(dir, right, top, offset) {
// 		$("<img class='button' src='/images/arrow-" + dir + ".gif' style='right:" + right + "px;top:" + top + "px'>")
// 			.appendTo(placeholder)
// 			.click(function (e) {
// 				e.preventDefault();
// 				plot.pan(offset);
// 			});
// 	}
	
// 	addArrow('left', 600, 275, {left: -50});
// 	addArrow('right', -20, 275, {left: 50});
// };



// Prepare data -------------------------------------------------------------------------------------------
var formatDate = function(date) {
	// requires moment.js
	return moment.utc(new Date(date)).format('ddd, YYYY MMM DD HH:mm');
};

var convertDataForFlot = function(data) {
	var flotdata = [];
	flotdata.push(mapTimeSeries(data, 'WA', 'outside'));
	flotdata.push(mapTimeSeries(data, 'Z2', '2nd floor'));
	flotdata.push(mapTimeSeries(data, 'Z3', '1st floor (work)'));
	flotdata.push(mapTimeSeries(data, 'Z4', '1st floor (bathroom)'));
	flotdata.push(mapTimeSeries(data, 'Z5', '1st floor (bedroom)'));
	flotdata.push(mapTimeSeries(data, 'Z6', 'ground floor'));
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
