var express = require('express');
var router = express.Router();
var User =  require('../../module/user');
var Cafe =  require('../../module/cafe');
var Stripe =  require('../../module/stripe');
var Noti = require('../../module/notification');
var CoffeeShop = require('../../module/coffeeShop');
var Order = require('../../module/order');
var Adminadded = require('../../module/admincrud');
var jwt = require('jsonwebtoken');
var multer = require("multer");
var fs = require('fs');
var moment = require('moment-timezone');


router.post('/addshopowner', function (req, res) {

     Adminadded.addshopowner(req,res);
});


router.post('/editshopowner', function (req, res) {

     Adminadded.editshopowner(req,res);
});

module.exports = router;