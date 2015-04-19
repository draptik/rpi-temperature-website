var express = require('express');
var router = express.Router();

var ctrlMain = require('../controllers/main');
var ctrlTemperatures = require('../controllers/temperatures');

/* GET home page */
router.get('/', ctrlMain.index);

router.get('/temperatures', ctrlTemperatures.index);

module.exports = router;
