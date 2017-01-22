
$(function () {
    getStatsByDate('2015-04-19', function (d) {
        render(d);
    });
});

function render(data) {

  $('#selected-date').append(data[0].date);

  var rows = '';
    for (i = 0; i < data.length; i++) {
        rows += '<div class="row entry">';
        rows += '<div class="temp-value">' + data[i].avg.toFixed(1) + '</div>';
        rows += '<div class="min-max-box">';
        rows += '<table><tbody>';
        rows += '<tr><td><div class="temp-max2">' + data[i].max.toFixed(1) + '</div></td></tr>';
        rows += '<tr><td><div class="temp-min2">' + data[i].min.toFixed(1) + '</div></td></tr>';
        rows += '</tbody></table>';
        rows += '</div>'; // min-max-box
        rows += '<div class="location">' + data[i].name + '</div>';
        rows += '</div>'; // row-entry
    }

    $('#rows-replace').append(rows);
};
