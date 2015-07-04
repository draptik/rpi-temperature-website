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

var target = $('#target');
$(document)
    .ajaxStart(function () {
        $('html, body').css('cursor', 'wait');
        target.overlay();
    })
    .ajaxStop(function () {
        $('html, body').css('cursor', 'auto');
        target.overlayout();
    });

$(function () {
    initLegend();

    // Load the last 14 days
    getFortnight(function (rawdata) {
        render(rawdata)
    });
});

function initLegend() {
    $('#detail-legend').append('<div class="div-table"><div class="div-table-row"><div id="detail-selection-header">&nbsp;</div></div>');
};

function render(rawdata) {

    if (!rawdata) {
        // TODO Show error message
        console.log('Sorry, no data found.');
        return;
    }

    var data = convertDataForFlot(rawdata);

    // Legend -------------------------------------------------------------
    var legendContainer = $('#detail-legend');
    var legendHasNoData = legendContainer.find('.table-row-data').length === 0;
    if (legendHasNoData) {
        $.each(data, function (key, val) {
            var tablerow = '<div class="div-table-row table-row-data">' +
                '<div class="div-table-col"><input type="checkbox" name="' + key + '" checked="checked" id="id' + key + '"></input></div>' +
                '<div class="div-table-col"><div class="legend-color"><div style="width:4px; height: 0; border: 5px solid ' + colors[key] + '; overflow: hidden;"></div></div></div>' +
                '<div class="div-table-col"><label class="legend-label" for="id' + key + '">' + val.label + '</label></div>' +
                '<div class="div-table-col col-right"><div id="temperature-value' + val.id + '"></div></div>' +
                '</div>';
            legendContainer.find('.div-table').append(tablerow);
        });
    }
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
            console.log('rangeselectionCallback invoked...');
            var xaxis = detailPlot.getAxes().xaxis;

            if (o.start <= xaxis.datamin) {
                loadAnotherFortnight(xaxis.datamin, xaxis.datamax);
            } else {
                xaxis.options.min = o.start;
                xaxis.options.max = o.end;
                detailPlot.setupGrid();
                detailPlot.draw();

                currentSelection.min = o.start;
                currentSelection.max = o.end;
            }
        };

        var detailPlaceholder = $('#detail-placeholder');
        var detailPlot = $.plot(detailPlaceholder, plotdata, {
            xaxis: {
                mode: 'time'
            },
            yaxis: {
                panRange: false
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
                autoHighlight: false,
                borderWidth: 0,
                markings: nightAreas
            },
            crosshair: {
                mode: 'x'
            },
            pan: {
                interactive: true
            }
        });

        var overviewPlaceholder = $('#overview-placeholder');
        var overviewData = $.extend(true, [], plotdata);
        for (var i = 0; i < overviewData.length; i++) {
            overviewData[i].color = '#ccc';
            overviewData[i].label = undefined;
        }

        function initializeOverview(plot) {
            var rangeselectionEnd = plot.getData()[0].data[plot.getData()[0].data.length - 1][0];
            var endDate = new Date(rangeselectionEnd);
            endDate.setDate(endDate.getDate() - 1); // endDate = endDate - 1day
            var rangeselectionInitialStart = endDate.getTime();
            plot.getAxes().xaxis.options.min = rangeselectionInitialStart;
            plot.setupGrid();
            plot.draw();

            var initialOverview = {
                start: rangeselectionInitialStart,
                end: rangeselectionEnd
            };
            return initialOverview;
        }
        var overview = initializeOverview(detailPlot);

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
            yaxis: {
                labelWidth: 16,
                reserveSpace: true,
                show: false
            },
            legend: {
                show: false
            },
            grid: {
                hoverable: false,
                borderWidth: {
                    'top': 1,
                    'right': 1,
                    'left': 1,
                    'bottom': 1
                },
                borderColor: 'darkgray',
                markings: weekendAreas
            },
            rangeselection: {
                color: '#999',
                enabled: true,
                start: overview.start,
                end: overview.end,
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

        // PLOTHOVER: UPDATE VALUE IN LEGEND
        detailPlaceholder.bind('plothover', function (event, pos, item) {
            var updateDetailSelectionTimeout = null;
            var latestPosition = null;

            function updateDetailSelection() {
                updateDetailSelectionTimeout = null;
                var pos = latestPosition;
                var axes = detailPlot.getAxes();
                if (pos.x < axes.xaxis.min || pos.x > axes.xaxis.max ||
                    pos.y < axes.yaxis.min || pos.y > axes.yaxis.max) {
                    //tooltipContainer.hide('slow');
                    return;
                }

                var seriesIndex, dataPointInSeries, dataset = plotdata;

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

                    // Set the correct value for the current sensor
                    if ($.isNumeric(y)) {
                        var temperatureValueContainer = legendContainer.find('#temperature-value' + series.id);
                        if (temperatureValueContainer) {
                            temperatureValueContainer.text(y.toFixed(1));
                        }
                    }

                    if (y > yMax) {
                        yMax = y;
                    }
                }

                // Current time
                var m = moment(pos.x);
                m.add(-2, 'hours'); // fucking time stuff
                $('#detail-selection-header').text(m.format('YYYY-MM-DD HH:mm (ddd)'));
            };

            latestPosition = pos;
            if (!updateDetailSelectionTimeout) {
                updateDetailSelectionTimeout = setTimeout(updateDetailSelection, 400);
            }
        });

        // PLOTPAN: UPDATE OVERVIEW PLOT
        detailPlaceholder.bind('plotpan', function (event, plot) {
            var currentMin = plot.getXAxes()[0].min;
            var dataMin = plot.getXAxes()[0].datamin;
            //            console.log('-------')
            //            console.log(new Date(currentMin));
            //            console.log(new Date(dataMin));
            if (currentMin <= dataMin) {
                loadAnotherFortnight(dataMin, overviewPlot.getAxes().xaxis.datamax);
                return;
            } else {
                function clamp(min, value, max) {
                    return value < min ? min : (value > max ? max : value);
                };

                function clampOverViewPlot(value) {
                    overviewMin = overviewPlot.getAxes().xaxis.min;
                    overviewMax = overviewPlot.getAxes().xaxis.max;
                    return clamp(overviewMin, value, overviewMax);
                };

                currentSelection.min = clampOverViewPlot(detailPlot.getAxes().xaxis.min);
                currentSelection.max = clampOverViewPlot(detailPlot.getAxes().xaxis.max);
                overviewPlot.setSelection(currentSelection.min, currentSelection.max);
            }
        });
    };

    updatePlot();

};


/* From flot demo: http://www.flotcharts.org/flot/examples/visitors/index.html */
function weekendAreas(axes) {
    var markings = [],
        d = new Date(axes.xaxis.min);

    // go to the first Saturday
    d.setUTCDate(d.getUTCDate() - ((d.getUTCDay() + 1) % 7))
    d.setUTCSeconds(0);
    d.setUTCMinutes(0);
    d.setUTCHours(0);

    var i = d.getTime();

    do {
        markings.push({
            xaxis: {
                from: i,
                to: i + 2 * 24 * 60 * 60 * 1000
            },
            color: '#FBF8EF'
        });
        i += 7 * 24 * 60 * 60 * 1000;
    } while (i < axes.xaxis.max);

    return markings;
};

function nightAreas(axes) {
    var lat = 49.477246;
    var lng = 10.989707;
    var markings = [];

    var day = 24 * 60 * 60 * 1000; // ms
    var offset = (1000 * 60 * 60 * 2); // ms

    var previousSunset = axes.xaxis.min;
    for (var i = 0; true; i++) {
        var entry = axes.xaxis.min + (i * day);
        var t = SunCalc.getTimes(entry, lat, lng);

        var currentSunset = t.sunset.getTime() + offset <= axes.xaxis.min ? axes.xaxis.min : (t.sunset.getTime() + offset);
        var sunrise = t.sunrise.getTime() + offset >= axes.xaxis.max ? axes.xaxis.max : (t.sunrise.getTime() + offset);

        if (previousSunset <= sunrise) {
            markings.push({
                xaxis: {
                    from: previousSunset,
                    to: sunrise
                },
                color: '#B0C4DE'
            });
        }

        previousSunset = currentSunset;

        if (entry > axes.xaxis.max + offset) {
            break;
        }
    }

    return markings;
};


function loadAnotherFortnight(oldMin, max) {
    console.log('Reloading with oldMin value: ' + new Date(oldMin));
    console.log('Reloading with max value: ' + new Date(max));

    getByFilter(oldMin, max, function (rawdata) {
        console.log('call getByFilter is done.');
        render(rawdata);
    });
};

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
            var mDate = moment(data[i].timestamp + ' +02:00', 'YYYY-MM-DD HH:mm:ss ZZ');
            mDate.add(2, 'hours'); // still don't understand why this is really necessary.
            var millis = new Date(mDate.unix()) * 1000;
            series.push([millis, data[i].degreeCelsius]);
        }
    }

    // Note: Add an 'id' property (because the label property is a descriptive string)
    return {
        data: series,
        label: label,
        color: col,
        id: sensorName
    };
};
