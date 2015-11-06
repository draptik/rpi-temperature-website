/* GET statistics page */
module.exports.index = function (req, res, next) {
    res.render('statistics', {
        title: 'Statistics',
        pageHeader: {
            title: 'Statistics'
        }
    });
};
