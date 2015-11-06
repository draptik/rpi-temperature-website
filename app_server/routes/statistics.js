var express = require('express');
var router = express.Router();

var controller = require('../controllers/statistics');

/* GET statistics page */
// router.get('/statistics', controller.index);
router.get('/statistics', function () {
    console.log('x');
});

module.exports = router;
