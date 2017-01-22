/* GET statistics page */
module.exports.index = function (req, res, next) {
    res.render('statistics', {
        title: 'Stats',
        pageHeader: {
            title: 'Statistics'
        }
    });
};
