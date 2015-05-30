var colors = {
    0: "lightgray",
    1: "#edc240",
    2: "#afd8f8",
    3: "#cb4b4b",
    4: "#4da74d",
    5: "#9440ed",
    6: "rgb(189, 155, 51)",
    7: "rgb(140,172,198)"
};

$(function () {
    getAll(function (rawdata) {

        var data = convertDataForFlot(rawdata);

        // Legend -------------------------------------------------------------
        var legendContainer = $('#detail-legend');
        $.each(data, function (key, val) {
            legendContainer.append("<br/><input type='checkbox' name='" + key + "' checked='checked' id='id" + key + "'></input>" +
                "<div class='legend-color'><div style='width:4px; height: 0; border: 5px solid " + colors[key] + "; overflow: hidden;'></div></div>" +
                "<label class='legend-label' for='id" + key + "'>" + val.label + "</label>");
        });

        // TODO (BUG): Currently changing the selected time series will reset the selection range.
        legendContainer.find("input").click(updatePlot);

        // Main plotting function ---------------------------------------------
        function updatePlot() {

            var plotdata = [];

            legendContainer.find('input:checked').each(function () {
                var key = $(this).attr('name');
                if (key && data[key]) {
                    plotdata.push(data[key])
                }
            });

            var rangeselectionCallback = function (o) {
                var xaxis = detailPlot.getAxes().xaxis;
                xaxis.options.min = o.start;
                xaxis.options.max = o.end;
                detailPlot.setupGrid();
                detailPlot.draw();
            };

            var detailPlaceholder = $('#detail-placeholder');
            var detailPlot = $.plot(detailPlaceholder, plotdata, {
                xaxis: {
                    mode: 'time'
                },
                series: {
                    lines: {
                        show: true
                    },
                    points: {
                        show: true
                    }
                },
                legend: {
                    show: false // Note: The legend is configured manually (see legendContainer)
                },
                grid: {
                    hoverable: true,
                    clickable: true
                },
                selection: {
                    mode: 'x'
                }
            });

            var overviewPlaceholder = $('#overview-placeholder');
            var overviewPlot = $.plot(overviewPlaceholder, plotdata, {
                series: {
                    lines: {
                        show: true,
                        lineWidth: 1
                    },
                    shadowSize: 0,
                    points: {
                        show: false
                    }
                },
                xaxis: {
                    mode: "time"
                },
                yaxis: {},
                legend: {
                    show: false
                },
                grid: {
                    hoverable: false
                },
                rangeselection: {
                    color: '#999',
                    enabled: true,
                    start: detailPlot.getData()[0].data[0][0],
                    end: detailPlot.getData()[0].data[detailPlot.getData()[0].data.length - 100][0],
                    callback: rangeselectionCallback
                }
            });
            showTooltip(detailPlaceholder);
            zoom(detailPlot, detailPlaceholder, overviewPlot, overviewPlaceholder);
            //            pane(detailPlot, detailPlaceholder);

            $('#show-all').click(function (event) {
                event.preventDefault();
                detailPlot.setSelection({
                    xaxis: {
                        from: detailPlot.getData()[0].data[0][0],
                        to: detailPlot.getData()[0].data[detailPlot.getData()[0].data.length - 1][0]
                    }
                });
                overviewPlot.clearSelection();
            });
        };

        updatePlot();
    });
});

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

var showTooltip = function (placeholder) {
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
                .css({
                    top: item.pageY + 5,
                    left: item.pageX + 5
                })
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
var formatDate = function (date) {
    // requires moment.js
    return moment.utc(new Date(date)).format('ddd, YYYY MMM DD HH:mm');
};

var convertDataForFlot = function (data) {
    var flotdata = [];
    flotdata.push(mapTimeSeries(data, 'WA', 'outside', colors[0]));
    flotdata.push(mapTimeSeries(data, 'Z2', '2nd floor', colors[1]));
    flotdata.push(mapTimeSeries(data, 'Z3', '1st floor (work)', colors[2]));
    flotdata.push(mapTimeSeries(data, 'Z4', '1st floor (bathroom)', colors[3]));
    flotdata.push(mapTimeSeries(data, 'Z5', '1st floor (bedroom)', colors[4]));
    flotdata.push(mapTimeSeries(data, 'Z6', 'ground floor', colors[5]));
    return flotdata;
};

var mapTimeSeries = function (data, sensorName, label, col) {
    var series = [];
    for (var i = 0; i < data.length; i++) {
        if (data[i].sensorName === sensorName) {

            // Note: Flot library expects time series data to be in milliseconds since 1970 ('.getTime()').
            // Flot library does not care about time zones.
            var dateWithTimezone = new Date(data[i].timestamp);
            var milliSecondsSince1970Utc = dateWithTimezone.getTime();
            var offsetInMinutes = dateWithTimezone.getTimezoneOffset();
            var offsetInMilliSeconds = offsetInMinutes * 60 * 1000;

            // We have to subtract (!) the time zone difference to fake a new utc time matching our local time zone.
            var fakedUtcTimeInMilliSeconds = milliSecondsSince1970Utc - offsetInMilliSeconds;

            series.push([fakedUtcTimeInMilliSeconds, data[i].degreeCelsius]);
        }
    }
    return {
        data: series,
        label: label,
        color: col
    };
};
