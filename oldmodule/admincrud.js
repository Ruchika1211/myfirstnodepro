var Stores = require('../models/cafeListing');
var StoreDetail = require('../models/menuListing');
var Admin = require('../models/admin');
var Orders = require('../models/order');
var tempOrder = require('../models/tempOrder');
var notification = require('../models/notification');
var bcrypt = require('bcrypt-nodejs');
var jwt = require('jsonwebtoken');
var geodist = require('geodist');
var moment = require('moment-timezone');
var crypto = require('crypto');
var nodemailer = require('nodemailer');
var randomstring = require("randomstring");
var smtpTransport = nodemailer.createTransport({
    service: "gmail",
    host: "smtp.gmail.com",
    auth: {
        user: "ruchika.s@infiny.in",
        pass: "iluvmadad"
    }
});

exports.addshopowner = (req, res) => {

	var email=req.body.email;
	var password=email.substring(0, email.indexOf("@"));
	console.log(password);

	var store= new Stores({
		storeId:email,
		storePass:bcrypt.hashSync(password, bcrypt.genSaltSync(10)),
		isblocked:0,
		isDelete:0,
		status:'closed',
		cafe_name:req.body.cafe_name,
		imageurl:"noImage"
	})


        store.save((err, ownerdata) => {

            if (err) {
                return res.status(500).json({
                    title: 'An error occurred',
                    error: "true",
                    detail: err
                });
            }

                var mailOptions = {
                to: email,
                from: 'ruchika.s@infiny.in',
                subject: 'Pickcup-New Shop',
                text: 'Your account is created successfully by admin and your username and password is as follows.\n\n' +
                    'username: ' +email+ '\n\n'+
                    'password: ' +password+ '\n\n'+
                    'Please download the Pickcup app which is available in android as well as ios to edit your details further \n\n'+
                    'If you did not request this, please contact on 888888888.\n'
            };

            smtpTransport.sendMail(mailOptions, function(err) {
                if (err) {
                    return res.status(500).json({
                        title: 'An error occurred',
                        error: "true",
                        detail: err
                    });
                }

                res.status(200).json({
                title: 'Saved owner',
                error: "false",
                data:ownerdata
                
                 });
            });


       
            

        })



}


