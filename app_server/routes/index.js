var express = require('express');
var router = express.Router();

var ctrlMain = require('../controllers/main');
var ctrlTemperatures = require('../controllers/temperatures');
var ctrlStatistics = require('../controllers/statistics');

/* GET home page */
router.get('/', ctrlMain.index);

router.get('/temperatures', ctrlTemperatures.index);
router.get('/statistics', ctrlStatistics.index);

module.exports = router;
