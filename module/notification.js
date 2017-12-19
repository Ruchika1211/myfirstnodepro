var Stores = require('../models/cafeListing');
var StoreDetail = require('../models/menuListing');
var user = require('../models/user');
var notification = require('../models/notification');
var bcrypt = require('bcrypt-nodejs');
var jwt = require('jsonwebtoken');
var crypto = require('crypto');
var nodemailer = require('nodemailer');
var helper = require('../services/helper.js');


// exports.createNoti = (req,res)=>{
//   console.log(req.body);
//   var userdata = new notification({
//      shopDetail:'59afb7f2f2c2c60f5f30ba9b',
//      userDetail:'59ad41cb43a745205bfa13dc',
//
//      message: "You got a offer",
//
//    });
//
//
//
//   userdata.save((err,user)=>{
//
//    if (err) {
//              return res.status(500).json({
//                  title: 'An error occurred',
//                  error: err
//              });
//          }
//          res.status(201).json({
//              message: 'Saved user',
//              obj: user
//          });
//
//   })
//
// }

exports.ListNotification = (req, res) => {
    var token = req.body.userToken;
    console.log(token);
    var decoded = jwt.decode(token, "pickup");
    console.log(decoded);
    console.log("decoded");
    var initialData = 20;
    var requestData = parseInt(req.body.requestData);
    var skip_D = parseInt(req.body.skipData);
    var limitData = initialData * requestData;
    var skipingData = 0;
    if (requestData > 1) {
        var skipingData = skip_D * initialData;
    }
        user.findOne({
                "_id": decoded.user._id
            }, (err, users) => {

                if (err) {
                    return res.status(500).json({
                        title: 'An error occurred',
                        error: "true",
                        detail: err
                    });
                }
                if (!users) {
                    return res.status(500).json({
                        title: 'User not found',
                        error: "true",
                      
                    });
                }


                if (parseInt(users.isBlocked) == 1) {
                    return res.status(200).json({
                        title: 'You are blocked.Please contact admin',
                        error: "true",
                        detail: "invalid Login"
                    });
                }

                users.lastseen = new Date ();



                users.save((err, userdata) => {

                    if (err) {
                        return res.status(500).json({
                            title: 'An error occurred',
                            error: "true",
                            detail: err
                        });
                    }
                       notification.find({
                            userDetail: decoded.user._id
                        })
                         .limit(limitData)
                         .skip(skipingData)
                         .sort({
                                'updatedAt': -1
                            })
                       .populate('shopDetail', 'status imageurl cafe_name status')
                       .exec(function(err, userNoti) {

                            if (err) {
                                return res.status(500).json({
                                    title: 'An error occurred',
                                    error: "true",
                                    detail: err
                                });
                            }
                            if (!userNoti) {
                                return res.status(200).json({
                                    title: 'An error occurred',
                                    error: "true",
                                    detail: err
                                });
                            }
                            if (userNoti.length <= 0) {
                                return res.status(200).json({
                                    title: 'No notification found',
                                    error: "true",
                                    message: 'No notification for requested user'
                                });
                            }
                            res.status(200).json({
                                title: 'Notification found',
                                error: "false",
                                data: userNoti
                            });



                        });

                })



            });
 

}