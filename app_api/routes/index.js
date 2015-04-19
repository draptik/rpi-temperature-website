var express = require('express');
var router = express.Router();

var ctrlTemperatures = require('../controllers/temperatures');

router.get('/temperatures', ctrlTemperatures.index);

module.exports = router;
