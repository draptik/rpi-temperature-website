var express = require('express');
var router = express.Router();

var controller = require('../controllers/temperatures');

/* GET temperatures page */
// router.get('/temperatures', controller.index);
router.get('/temperatures', function() {
	console.log('x');
});

module.exports = router;
