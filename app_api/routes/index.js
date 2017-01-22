var express = require('express');
var router = express.Router();

var ctrlTemperatures = require('../controllers/temperatures');

router.get('/temperatures/fortnight', ctrlTemperatures.fortnight);
router.get('/temperatures', ctrlTemperatures.index);

router.get('/statistics', ctrlTemperatures.statisticsForDay);

module.exports = router;
