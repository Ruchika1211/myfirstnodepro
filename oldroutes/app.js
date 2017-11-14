var express = require('express');
var router = express.Router();

router.get('/', function (req, res, next) {
    res.send('Welcome to pickcup api is at /');
});

module.exports = router;
