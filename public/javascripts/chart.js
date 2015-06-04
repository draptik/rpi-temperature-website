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

        legendContainer.find("input").click(updatePlot);

        var currentSelection = {
            min: undefined,
            max: undefined
        };

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

                currentSelection.min = o.start;
                currentSelection.max = o.end;
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
                        show: false
                    }
                },
                legend: {
                    show: false // Note: The legend is configured manually (see legendContainer)
                },
                grid: {
                    hoverable: true,
                    clickable: true,
                    autoHighlight: false
                },
                crosshair: {
                    mode: 'x'
                }
            });

            var overviewPlaceholder = $('#overview-placeholder');
            var overviewData = $.extend(true, [], plotdata);
            for (var i = 0; i < overviewData.length; i++) {
                overviewData[i].color = '#ccc';
                overviewData[i].label = undefined;
            }

            var overviewPlot = $.plot(overviewPlaceholder, overviewData, {
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

            // Since the canvas is redrawn after every interaction, we have to manually set the selection range (if it exists)
            if (currentSelection.min !== undefined && currentSelection.max !== undefined) {
                var xaxis = detailPlot.getAxes().xaxis;
                xaxis.options.min = currentSelection.min;
                xaxis.options.max = currentSelection.max;
                detailPlot.setupGrid();
                detailPlot.draw();

                overviewPlot.getOptions().rangeselection.start = currentSelection.min;
                overviewPlot.getOptions().rangeselection.end = currentSelection.max;
                overviewPlot.setupGrid();
                overviewPlot.draw();
            }

            // Show current value(s) in tooltip
            $('<div id="tooltip"><ul></ul></div>').css({
                position: 'absolute',
                display: 'none',
                border: '1px solid #fdd',
                padding: '2px',
                'background-color': '#fee',
                opacity: 0.80
            }).appendTo('body');

            var tooltipContainer = $('#tooltip');
            var tooltipContent = $('#tooltip ul');

            // add empty entry for each time series
            for (var i = 0; i < detailPlot.getData().length; i++) {
                tooltipContent.append('<li>' + detailPlot.getData()[i].label + ': </li>');
            }

            var updateTooltipTimeout = null;
            var latestPosition = null;

            function updateTooltip() {
                updateTooltipTimeout = null;
                var pos = latestPosition;
                var axes = detailPlot.getAxes();
                if (pos.x < axes.xaxis.min || pos.x > axes.xaxis.max ||
                    pos.y < axes.yaxis.min || pos.y > axes.yaxis.max) {
                    tooltipContainer.hide('slow');
                    return;
                }

                var seriesIndex, dataPointInSeries, dataset = detailPlot.getData();

                // Iterate of each time series ('seriesIndex')
                var yMax;
                for (seriesIndex = 0; seriesIndex < dataset.length; ++seriesIndex) {
                    var series = dataset[seriesIndex];

                    // Find the nearest points, x-wise
                    for (dataPointInSeries = 0; series.data.length; ++dataPointInSeries) {
                        if (series.data[dataPointInSeries][0] > pos.x) {
                            break;
                        }
                    }

                    // Now interpolate
                    var y,
                        p1 = series.data[dataPointInSeries - 1],
                        p2 = series.data[dataPointInSeries];

                    if (p1 == null) {
                        y = p2[1];
                    } else if (p2 == null) {
                        y = p1[1];
                    } else {
                        y = p1[1] + (p2[1] - p1[1]) * (pos.x - p1[0]) / (p2[0] - p1[0]);
                    }

                    // Set the correct value in the tooltip
                    if ($.isNumeric(y)) {
                        var toolTipItem = tooltipContent.find('li').eq(seriesIndex);
                        var text = toolTipItem.text();
                        toolTipItem.text(text.replace(/:.*/, ': ' + y.toFixed(2)));
                    }

                    if (y > yMax) {
                        yMax = y;
                    }
                }

                tooltipContainer.css({
                    top: pos.pageY,
                    left: pos.pageX
                });
                tooltipContainer.show('slow');
            };

            detailPlaceholder.bind('plothover', function (event, pos, item) {
                latestPosition = pos;
                if (!updateTooltipTimeout) {
                    updateTooltipTimeout = setTimeout(updateTooltip, 500);
                }
            });
        };

        updatePlot();
    });
});


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
