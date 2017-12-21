var Users = require('../models/user');
var Orders = require('../models/order');
var tempOrder = require('../models/tempOrder');
var Stores = require('../models/cafeListing');
var StoreDetail = require('../models/menuListing');
var bcrypt = require('bcrypt-nodejs');
var jwt = require('jsonwebtoken');
var randomstring = require("randomstring");
var mongoose = require('mongoose');
var ObjectId = mongoose.Types.ObjectId;
var moment = require('moment-timezone');
var FCM = require('fcm-push');
//var serverKey ='AIzaSyDIfbPUnzIOFDyJA0omLTuF8VCKe-SqNZY';
var stripe = require('stripe')(process.env.stripeKey);
var serverKey = process.env.serverKey;

var nodemailer = require('nodemailer');
var smtpTransport = nodemailer.createTransport({
    service: "gmail",
    host: "smtp.gmail.com",
    auth: {
        user: process.env.mail_username,
        pass: process.env.mail_password
   }
   })
var fcm = new FCM(serverKey);
var helper = require('../services/helper.js');
var async = require('async');
var reward = require('../models/reward');
var Stripe = require('./stripe');
var moment = require('moment-timezone');
var notification = require('../models/notification');
var usersReward = require('../models/userReward');
var Storesmodu = require('./cafe');


exports.rewardcron = () => {
   //console.log("hghfrg");
   // var token=req.body.userToken;
   // var decoded = jwt.decode(token, "pickup");
   //   //console.log(decoded);
   reward
      .find({})
      .populate('shopDetail', 'deviceToken  cafe_name ')
      .exec(function(err, rewards) {
         if (err) {
            return res.status(500).json({
               title: 'An error occurred',
               error: "true",
               detail: err
            });
         }

         if (!rewards) {
            //console.log("no rewards");
         }
         if (rewards.length <= 0) {
            //console.log("no rewards")
         }
         else{
            var shopDetailData = [];
         for (var i = 0; i < rewards.length; i++) {
            ////console.log(rewards[i]);
            // //console.log(rewards.length);
            // //console.log("i is" + i);
            //var dec = moment.tz(new Date(), "America/Los_Angeles");
            var end = helper.findCurrentDateinutc();

            var compareWithDate = new Date(end);
            compareWithDate.setHours(0, 0, 0, 0);

            var comparetoDate = new Date(rewards[i].enddate);
            comparetoDate.setHours(0, 0, 0, 0);
            //console.log(compareWithDate.getTime());
            //console.log(comparetoDate.getTime());
             //console.log(rewards[i]);
            if (compareWithDate.getTime() <= comparetoDate.getTime()) {
               var timeDiff = Math.abs(compareWithDate.getTime() - comparetoDate.getTime());

               var diffDays = Math.ceil(timeDiff / (1000 * 3600 * 24));

               //console.log(diffDays);

               if (diffDays <= 2) {
                  shopDetailData.push(rewards[i].shopDetail._id);

               }

            } else {
               //console.log('negativeshopDetailData');
            }

         };


           var sendNotificationdata = [];
         if (shopDetailData.length > 0) {
            usersReward
               .find({
                  shopDetail: {
                     $in: shopDetailData
                  },
               })
               .populate('shopDetail', 'cafe_name ')
               .populate('userDetail', 'deviceToken  cafe_name ')
               .exec(function(err, userrewards) {

                  if (userrewards.length > 0) {
                     for (i in userrewards) {
                        //     //console.log("loop of" + i);
                        // //console.log(userrewards[i]);
                        var msge = "Hurry up! Reward with shop " + userrewards[i].shopDetail.cafe_name + " is expiring soon.";
                        var notifi = new notification({
                           shopDetail: userrewards[i].shopDetail._id,
                           userDetail: userrewards[i].userDetail._id,
                           cafe_name:userrewards[i].shopDetail.cafe_name,
                           message: msge
                        });
                        notifi.save((err, savedNoti) => {

                           if (err) {
                              //console.log("error saving msg");
                           }

                           ////console.log(savedNoti);
                           helper.sendNotification(userrewards[i].userDetail.deviceToken, "OfferValidity", msge, (cb) => {

                              //console.log("notification send");

                           })
                           // sendNotificationdata.push(savedNoti.userDetail);
                           //  //console.log("of notificatn");

                        })
                     }
                  }

                  //  //console.log(sendNotificationdata);
                  // //console.log('sendNotification>>>>>>>>>>>>>>>');
                  // var msg = "Hurry up! Reward with shops is expiring soon.";
                  // if(sendNotificationdata.length > 0)
                  // {
                  //      helper.sendNotification(sendNotificationdata, "OfferValidity", msg, (cb) => {

                  //                            //console.log("notification send");

                  //                        })
                  // }

               })

         }
         }
         
         // //console.log('shopDetailData');
         // //console.log(shopDetailData);
       

      })
}

exports.userEndingRewardscron = () => {

   // var token=req.body.userToken;
   // var decoded = jwt.decode(token, "pickup");
   //   //console.log(decoded);
   //console.log("hghfrg>>>>>>>>>>>>>>>>>>");
   reward
      .find({})
      .populate('shopDetail', 'deviceToken  cafe_name ')
      .exec(function(err, rewards) {
         if (err) {
            return res.status(500).json({
               title: 'An error occurred',
               error: "true",
               detail: err
            });
         }

         if (!rewards) {
            //console.log("no rewards");
         }
         if (rewards.length <= 0) {
            //console.log("no rewards")
         }
         var shopDetailData = [];
         for (var i = 0; i < rewards.length; i++) {
            ////console.log(rewards[i]);
            //console.log(rewards.length);
            //console.log("i is" + i);
            //var dec = moment.tz(new Date(), "America/Los_Angeles");
            var end = helper.findCurrentDateinutc();

            var compareWithDate = new Date(end);
            compareWithDate.setHours(0, 0, 0, 0);

            var comparetoDate = new Date(rewards[i].enddate);
            comparetoDate.setHours(0, 0, 0, 0);
            //console.log(compareWithDate.getTime());
            //console.log(comparetoDate.getTime());
            var msg = "Your reward has been expired or expiring soon.Please add a new reward.";
            var timeDiff = Math.abs(compareWithDate.getTime() - comparetoDate.getTime());

            var diffDays = Math.ceil(timeDiff / (1000 * 3600 * 24));

            //console.log(diffDays);

            if (diffDays = 1) {

               helper.sendNotification(rewards[i].shopDetail.deviceToken, "rewardValidity", msg, (cb) => {

                  //console.log("notification send");

               })

            }
            // if (compareWithDate.getTime() < comparetoDate.getTime()) {
            //     var timeDiff = Math.abs(compareWithDate.getTime() - comparetoDate.getTime());

            //     var diffDays = Math.ceil(timeDiff / (1000 * 3600 * 24));

            //     //console.log(diffDays);

            //     if (diffDays <= 1) {

            //         helper.sendNotification(rewards[i].shopDetail.deviceToken, "rewardValidity", msg, (cb) => {

            //             //console.log("notification send");

            //         })

            //     }
            //     //console.log(shopDetailData);
            // } else {
            //     //console.log('negativeshopDetailData');
            //     var timeDiff = Math.abs(compareWithDate.getTime() - comparetoDate.getTime());

            //     var diffDays = Math.ceil(timeDiff / (1000 * 3600 * 24));

            //     //console.log(diffDays);

            //     if (diffDays <= 1) {
            //         helper.sendNotification(rewards[i].shopDetail.deviceToken, "OfferValidity", msg, (cb) => {

            //             //console.log("notification send");

            //         })

            //     }
            //     //console.log(shopDetailData);
            // }

         };

      })
}

var checkIitemSizePresent = function(value, list) {

   for (i = 0; i < list.length; i++) {

      var cor = list[i].itemSize;
      //console.log(cor);
      //console.log(value);
      if (cor == value) {
         return true;
      }
   }

   return false;
}

var checkIfPresent = function(value, list) {

   for (i = 0; i < list.length; i++) {

      var cor = list[i].itemId;
      //console.log(cor);
      //console.log(value);
      if (cor == value) {
         return true;
      }
   }

   return false;
}

// var makeuserReward = function(shopDetail, CorrectOrder, token) {

//    reward
//       .find({
//          "shopDetail": shopDetail
//       })
//       .exec(function(err, reward) {
//          //console.log("reward>>>>>>>>>>>>>>>>>");
//          //console.log(reward);
//          if (err) {
//             //console.log("error finding rewrad");
//          }

//          if (!reward) {
//             //console.log("no reward");
//          } else {
//             ////console.log(CorrectOrder.length);
//                 var totalReward=0;
//                var reward_data;
//                for (j = 0; j < CorrectOrder.length; j++) {
//                var isEligible = CorrectOrder[j].eligibleForRewards.trim();

//                  if (isEligible == "true") {
//                      for(k in reward)
//                      {

//                            var temp_Data=reward[k];
//                             var enddateData = new Date(temp_Data.enddate);
//                            enddateData.setHours(0, 0, 0, 0);
//                            var startdateData = new Date(temp_Data.startdate);
//                            startdateData.setHours(0, 0, 0, 0);

//                            var dateData = new Date();
//                            dateData.setHours(0, 0, 0, 0);
//                            //console.log('enddateData');
//                            //console.log(enddateData);
//                            //console.log(startdateData);
//                            //console.log(dateData);
//                            //console.log((enddateData >= dateData) && (startdateData <= dateData));
//                            //console.log('(enddateData >= dateData) && (startdateData <= dateData)');
//                            if((enddateData >= dateData) && (startdateData <= dateData))
//                            {
//                                totalReward=totalReward +1
//                                reward_data=temp_Data;
                            
//                                break;
//                            }
                        
                          
//                      }
//                }

//             }

//             if(reward_data._id)
//             {
//                 usersReward
//                   .findOne({
//                      "shopDetail": shopDetail,
//                      "userDetail": token,
//                      "rewardId": reward_data._id
//                   })
//                   .exec(function(err, usersRewarddata) {
//                      //console.log("usersRewarddata>>>>>>>>>>>>>>>>>");
//                      //console.log(usersRewarddata);
//                      if (err) {
//                         //console.log("error finding rewrad");
//                      }
//                      // if (!usersRewarddata && ((enddateData >= dateData) && (startdateData <= dateData)))
//                    if (!usersRewarddata) {
//                                           var usersRe = new usersReward({
//                                              shopDetail: shopDetail,
//                                              userDetail: token,
//                                              rewardId: reward_data._id,
//                                              rewardCompleted: 1
//                                           });
//                                           usersRe.save((err, usewrre) => {

//                                              if (err) {
//                                                 //console.log("error creating users rewrad");
//                                              }
//                                              //console.log("users reward created successfully");
//                                           })
//                                        } 
//                                        else if (usersRewarddata) {
//                                           var totalUserRewards = usersRewarddata.rewardCompleted;

//                                           if (totalUserRewards < parseInt(reward_data.quantity)) {
//                                              usersRewarddata.rewardCompleted = usersRewarddata.rewardCompleted + totalReward;
//                                              if (usersRewarddata.rewardCompleted == parseInt(reward_data.quantity)) {
//                                                 usersRewarddata.claimedReward = true;
//                                              }
//                                           } else if (totalUserRewards == parseInt(reward_data.quantity)) {
//                                              if (totalUserRewards.claimedReward) {
//                                                 //console.log("do nothing")
//                                              } else {
//                                                 usersRewarddata.claimedReward = true;
//                                              }
//                                           } else {
//                                              usersRewarddata.rewardCompleted = reward_data.quantity;
//                                           }

//                                           usersRewarddata.save((err, dataSave) => {

//                                              if (err) {
//                                                 //console.log("error creating users rewrad");
//                                              }
//                                              //console.log("users reward created successfully again");
//                                           })

//                                        } else {
//                                           //console.log("no rewards ")
//                                        }


                  
//                   });
//             }

           


//          }
//          //var countReward=reward.quantity;
//       });

// }

var makeuserReward = function(shopDetail, CorrectOrder, token) {

   reward
      .find({
         "shopDetail": shopDetail
      })
      .exec(function(err, reward)
       {
         //console.log("reward>>>>>>>>>>>>>>>>>");
         //console.log(reward);
         if (err) {
            //console.log("error finding rewrad");
         }

         if (!reward) {
            //console.log("no reward");
         } else {
            var reward_data;
            var tempuserdataFinding = false;

            for (k in reward) {

               var temp_Data = reward[k];
               var enddateData = new Date(temp_Data.enddate);
               enddateData.setHours(0, 0, 0, 0);
               var startdateData = new Date(temp_Data.startdate);
               startdateData.setHours(0, 0, 0, 0);

               var dateDat = new Date();
               var timezone=moment.tz.guess();
               // //console.log(moment.tz.guess());
               var dec = moment.tz(dateDat,timezone);
               //console.log(dec);
               //console.log('dec');
               var dateDatat = dec.utc().format('YYYY-MM-DD HH:mm:ss');

               var dateData  =new Date(dateDatat) ;
               //console.log(dateData);
               //console.log('dateData');
               //console.log('enddateData');
               //console.log(enddateData);
               //console.log(startdateData);
               //console.log(dateData);
               //console.log((enddateData >= dateData) && (startdateData <= dateData));
               //console.log('(enddateData >= dateData) && (startdateData <= dateData)');
               if ((enddateData >= dateData) && (startdateData <= dateData)) {
                  var totalReward = 0;
                  for (j in CorrectOrder) {
                     var isEligible = CorrectOrder[j].eligibleForRewards.trim();
                     //console.log(isEligible);
                     if (isEligible == "true") {
                        //console.log("im here")
                        totalReward = 1;
                        tempuserdataFinding = true;

                     }
                  }
                  reward_data = temp_Data;
                  
               
               }

            }

         }

         if (tempuserdataFinding) 
         {
            //console.log("i m in temp user reward data^^^^^^^^^^^^^^");
            usersReward
               .findOne({
                  "shopDetail": shopDetail,
                  "userDetail": token,
                  "rewardId": reward_data._id
               })
               .exec(function(err, usersRewarddata) {
                  //console.log("usersRewarddata>>>>>>>>>>>>>>>>>");
                  //console.log(usersRewarddata);
                  if (err) {
                     //console.log("error finding rewrad");
                  }
                  // if (!usersRewarddata && ((enddateData >= dateData) && (startdateData <= dateData)))
                  if (!usersRewarddata) {
                

                     var usersRe = new usersReward({
                        shopDetail: shopDetail,
                        userDetail: token,
                        rewardId: reward_data._id,
                        rewardCompleted: 1
                     });
                     usersRe.save((err, usewrre) => {

                        if (err) {
                           //console.log("error creating users rewrad");
                        }
                        //console.log("users reward created successfully");
                     })
                  } else if (usersRewarddata) {
                     var totalUserRewards = usersRewarddata.rewardCompleted;

                     if (totalUserRewards < parseInt(reward_data.quantity)) {
                        usersRewarddata.rewardCompleted = usersRewarddata.rewardCompleted + totalReward;
                        if (usersRewarddata.rewardCompleted == parseInt(reward_data.quantity)) {
                           usersRewarddata.claimedReward = true;
                        }
                     } else if (totalUserRewards == parseInt(reward_data.quantity)) {
                        if (totalUserRewards.claimedReward) {
                           //console.log("do nothing")
                        } else {
                           usersRewarddata.claimedReward = true;
                        }
                     } else {
                        usersRewarddata.rewardCompleted = reward_data.quantity;
                     }

                     usersRewarddata.save((err, dataSave) => {

                        if (err) {
                           //console.log("error creating users rewrad");
                        }
                        //console.log("users reward created successfully again");
                     })

                  } else {
                     //console.log("no rewards ")
                  }

               });
         }

     });
}

exports.claimedReward = (req, res) => {

   var token = req.body.userToken;
   var decoded = jwt.decode(token, "pickup");
   var shopDetail = req.body.shopDetail;
   var timeForPickcup = req.body.timeForPickcup;
   var note = "Rewards";
   var parcelData = req.body.parcel;
   //var requestOrder = req.body.order;
   //var CorrectOrder = [];
   var CurrentUserDetail;
   var CurrentStoreDetail;

   reward
      .findOne({
         "shopDetail": shopDetail
      })
      .exec(function(err, reward) {
         //console.log("reward>>>>>>>>>>>>>>>>>");
         //console.log(reward);
         if (err) {
            //console.log("error finding rewrad");
            return res.status(500).json({
               title: 'An error occurred',
               error: "true",
               detail: err
            });
         }

         if (!reward) {
            //console.log("error finding rewrad");
            return res.status(200).json({
               title: 'no reward for such shop',
               error: "false",

            });
         } else {

            var enddateData = new Date(reward.enddate);
            enddateData.setHours(0, 0, 0, 0);
            var startdateData = new Date(reward.startdate);
            startdateData.setHours(0, 0, 0, 0);

            var dateData = new Date();
            dateData.setHours(0, 0, 0, 0);

            //console.log(enddateData);
            //console.log(startdateData);
            //console.log(dateData);
            if ((enddateData >= dateData) && (startdateData <= dateData)) {

               usersReward
                  .findOne({
                     "shopDetail": shopDetail,
                     "userDetail": decoded.user._id,
                     "rewardId": reward._id
                  })
                  .exec(function(err, usersRewarddata) {
                     if (err) {
                        return res.status(500).json({
                           title: 'An error occurred',
                           error: "true",
                           detail: err
                        });
                     }
                     if (!usersRewarddata) {
                        return res.status(200).json({
                           title: 'No user with such shop reward',
                           error: "false"

                        });
                     }

                     if (usersRewarddata.claimedReward) {
                        helper.findShopowner(shopDetail, function(cb) {
                           CurrentStoreDetail = cb;

                        });

                        helper.findUser(decoded.user._id, function(cb) {
                           CurrentUserDetail = cb;
                           //console.log(CurrentUserDetail);
                           //console.log('CurrentUserDetail');
                        });

                        var otpOfOrder = randomstring.generate({
                           length: 4,
                           charset: 'numeric'
                        });
                        var orderId = randomstring.generate({
                           length: 9,
                           charset: 'hex'
                        });
                        //console.log(timeForPickcup);
                        var dec = moment.tz(req.body.timeForPickcup, req.body.timezone);
                        //console.log(dec);
                        var timePickup = dec.utc().format('YYYY-MM-DD HH:mm:ss');
                        //console.log(timePickup);
                        //console.log('timePickup');
                        //moment(1369266934311).tz('America/Phoenix').format('YYYY-MM-DD HH:mm')
                        var totalPrice = req.body.totalPrice;
                        var ordered = new Orders({
                           shopDetail: shopDetail,
                           totalPrice: 0,
                           orderId: orderId,
                           userDetail: decoded.user._id,
                           otp: otpOfOrder,
                           parcel: true,
                           timeForPickcup: timePickup,
                           note: note,
                           Ordered: []

                        });
                        ordered.save((err, orderd) => {

                           if (err) {
                              //console.log("orser saveissue");
                              //console.log(err);
                              return res.status(500).json({
                                 title: 'An error occurred',
                                 error: "true",
                                 detail: err
                              });
                           }

                           if (CurrentStoreDetail == 'err' || CurrentStoreDetail == 'no store Found') {

                              //console.log("as no store found cannot send the notification to the user");
                              //console.log("as no store found cannot send the notification to the user");
                              res.status(200).json({
                                 message: 'Order saved Your otp is',
                                 otp: otpOfOrder,
                                 error: "false",

                                 obj: user

                              });

                           } else {

                              //console.log(orderd);
                              //console.log(CurrentUserDetail);
                              //console.log(CurrentStoreDetail.deviceToken);
                              //console.log('CurrentUserDetail?????????????');
                              var message = {
                                 registration_ids: CurrentStoreDetail.deviceToken,
                                 priority: "high",
                                 forceshow: true, // required fill with device token or topics
                                 collapse_key: 'Pickcup',
                                 data: {
                                    flag: "rewardOrder",
                                    order: orderd,
                                    currentUserDetail: CurrentUserDetail
                                 },
                                 notification: {
                                    title: 'Pickcup',
                                    body: "You have received a new order for claiming a reward",
                                    sound : "default"

                                 }
                              };

                              //promise style
                              fcm.send(message)
                                 .then(function(response) {
                                    //var msg =msgForNoti

                                    var msg = "Order " + orderd.orderId + " placed successfully and your OTP is " + orderd.otp + " for claiming your reward";
                                    // helper.sendNotification(CurrentUserDetail.deviceToken,"orderReady",msg,function(cb)
                                    // {

                                    var notifi = new notification({
                                       shopDetail: CurrentStoreDetail._id,
                                       userDetail: CurrentUserDetail._id,
                                        cafe_name:CurrentStoreDetail.cafe_name,
                                       message: msg
                                    });
                                    notifi.save((err, savedNoti) => {

                                       if (err) {
                                          res.status(200).json({
                                             message: 'Order saved Your otp is',
                                             otp: otpOfOrder,
                                             error: "false",

                                          });

                                       }

                                       helper.sendNotification(CurrentUserDetail.deviceToken, "rewardCompleted", msg, (cb) => {
                                          usersRewarddata.rewardCompleted = 0;
                                          usersRewarddata.claimedReward = false;
                                          usersRewarddata.save((err, savedNoti) => {

                                             if (err) {
                                                res.status(200).json({
                                                   message: 'Order saved Your otp is',
                                                   otp: otpOfOrder,
                                                   error: "false",

                                                });

                                             }

                                             res.status(200).json({
                                                message: 'Order saved Your otp is',
                                                otp: otpOfOrder,
                                                error: "false",

                                             });
                                          })

                                       }, orderd._id)

                                    })

                                 })
                                 .catch(function(err) {
                                    //console.log("Something has gone wrong1!");
                                    console.error(err);
                                    res.status(200).json({
                                       message: 'Order saved Your otp is',
                                       otp: otpOfOrder,
                                       error: "false",

                                       obj: user

                                    });
                                 });
                           }

                        })
                     } else {

                        return res.status(200).json({
                           title: 'User is not eligible for claiming rewards',
                           error: "false"

                        });

                     }

                  })

            } else {
               return res.status(200).json({
                  message: 'You cannot claimed a reward since Date expired',

                  error: "false",

                  // obj: user

               });
            }
         }
      })

}

exports.createOrder = (req, res) => {

    //console.log('new Date(timePickup) createOrder');
    var token = req.body.userToken;
    var decoded = jwt.decode(token, "pickup");
    var CurrentUserDetail;
    var CurrentStoreDetail;
       var shopDetail = req.body.shopDetail;
    var orderType = req.body.orderType;
    helper.findShopowner(shopDetail, function(cb) {
       CurrentStoreDetail = cb;
         // //console.log(CurrentStoreDetail);
       //console.log('CurrentStoreDetail');

    });

    helper.findUser(decoded.user._id, function(cb) {
       CurrentUserDetail = cb;
       ////console.log(CurrentUserDetail);
       //console.log('CurrentUserDetail');
    });

    if (orderType == 0) 
    {
     
       var timeForPickcup = req.body.timeForPickcup;
       var note = "Rewards";
       var parcelData = req.body.parcel;
        var actualPrice=0;
      
       reward
          .find({
             "shopDetail": shopDetail
          })
          .exec(function(err, reward) {
             // //console.log("reward>>>>>>>>>>>>>>>>>");
             // //console.log(reward);
             if (err) {
                //console.log("error finding rewrad");
                return res.status(500).json({
                   title: 'An error occurred',
                   error: "true",
                   detail: err
                });
             }

             if (!reward) {
                //console.log("error finding rewrad");
                return res.status(200).json({
                   title: 'no reward for such shop',
                   error: "false",

                });
             } 
             else {
                var rewardOrder=false;
                for(i in reward)
                {
                   var order_reward=reward[i];
                    var enddateData = new Date(order_reward.enddate);
                      enddateData.setHours(0, 0, 0, 0);
                      var startdateData = new Date(order_reward.startdate);
                      startdateData.setHours(0, 0, 0, 0);

                       var dateDat = new Date();
                        var timezone=moment.tz.guess();
                        // //console.log(moment.tz.guess());
                        var dec = moment.tz(dateDat,timezone);
                        //console.log(dec);
                        //console.log('dec');
                        var dateDatat = dec.utc().format('YYYY-MM-DD HH:mm:ss');

                        var dateData  =new Date(dateDatat) ;
                        //console.log(dateData);
                        //console.log('dateData');

                      //console.log(enddateData);
                      //console.log(startdateData);
                      //console.log(dateData);
                    if ((enddateData >= dateData) && (startdateData <= dateData)) 
                    {
                        rewardOrder=true;
                         usersReward
                            .findOne({
                               "shopDetail": shopDetail,
                               "userDetail": decoded.user._id,
                               "rewardId": order_reward._id
                            })
                            .exec(function(err, usersRewarddata) {
                               if (err) {
                                  return res.status(500).json({
                                     title: 'An error occurred',
                                     error: "true",
                                     detail: err
                                  });
                               }
                               if (!usersRewarddata) {
                                  return res.status(200).json({
                                     title: 'No user with such shop reward',
                                     error: "false"

                                  });
                               }

                               if (usersRewarddata.claimedReward) {
                                  // helper.findShopowner(shopDetail, function(cb) {
                                  //     CurrentStoreDetail = cb;

                                  // });

                                  // helper.findUser(decoded.user._id, function(cb) {
                                  //     CurrentUserDetail = cb;
                                  //     //console.log(CurrentUserDetail);
                                  //     //console.log('CurrentUserDetail');
                                  // });

                                  var otpOfOrder = randomstring.generate({
                                     length: 4,
                                     charset: 'numeric'
                                  });
                                  var orderId = randomstring.generate({
                                     length: 9,
                                     charset: 'hex'
                                  });
                                  //console.log(timeForPickcup);
                                  var dec = moment.tz(req.body.timeForPickcup, req.body.timezone);
                                  //console.log(dec);
                                  var timePickup = dec.utc().format('YYYY-MM-DD HH:mm:ss');
                                  //console.log(timePickup);
                                  //console.log('timePickup');
                                  if(timePickup == "Invalid date")
                                  {
                                      return res.status(200).json({
                                           title: 'date error',
                                           error: "false"
                                        });
                                  }
                                  //moment(1369266934311).tz('America/Phoenix').format('YYYY-MM-DD HH:mm')
                                  var totalPrice = req.body.totalPrice;
                                  var ordered = new Orders({
                                     shopDetail: shopDetail,
                                     totalPrice: 0,
                                     orderId: orderId,
                                     costPrice:actualPrice,
                                     userDetail: decoded.user._id,
                                     otp: otpOfOrder,
                                     parcel: true,
                                     timeForPickcup: timePickup,
                                     note: note,
                                     orderCategory:"Reward",
                                     Ordered: []

                                  });
                                  ordered.save((err, orderd) => {

                                     if (err) {
                                        //console.log("orser saveissue");
                                        //console.log(err);
                                        return res.status(500).json({
                                           title: 'An error occurred',
                                           error: "true",
                                           detail: err
                                        });
                                     }

                                     if (CurrentStoreDetail == 'err' || CurrentStoreDetail == 'no store Found') {

                                        //console.log("as no store found cannot send the notification to the user");
                                        //console.log("as no store found cannot send the notification to the user");
                                        res.status(200).json({
                                           message: 'Order saved Your otp is',
                                           otp: otpOfOrder,
                                           error: "false"

                                           

                                        });

                                     } else {

                                        //console.log(orderd);
                                        //console.log(CurrentUserDetail);
                                        //console.log(CurrentStoreDetail.deviceToken);
                                        //console.log('CurrentUserDetail?????????????');
                                        var message = {
                                           registration_ids: CurrentStoreDetail.deviceToken,
                                           priority: "high",
                                           forceshow: true, // required fill with device token or topics
                                           collapse_key: 'Pickcup',
                                           data: {
                                              flag: "rewardOrder",
                                              order: orderd,
                                              currentUserDetail: CurrentUserDetail
                                           },
                                           notification: {
                                              title: 'Pickcup',
                                              body: "You have received a new order for claiming a reward",
                                              sound : "default"

                                           }
                                        };

                                        //promise style
                                        fcm.send(message)
                                           .then(function(response) {
                                              //var msg =msgForNoti
                                      
                                              var msg = "Your reward order at " + CurrentStoreDetail.cafe_name + " is successfully claimed.";
                                              // helper.sendNotification(CurrentUserDetail.deviceToken,"orderReady",msg,function(cb)
                                              // {

                                              var notifi = new notification({
                                                 shopDetail: CurrentStoreDetail._id,
                                                 userDetail: CurrentUserDetail._id,
                                                 message: msg,
                                                cafe_name:CurrentStoreDetail.cafe_name,
                                                  orderId:orderd._id

                                              });
                                              notifi.save((err, savedNoti) => {

                                                 if (err) {
                                                    res.status(200).json({
                                                       message: 'Order saved Your otp is',
                                                       otp: otpOfOrder,
                                                       error: "false",

                                                    });

                                                 }

                                                 helper.sendNotification(CurrentUserDetail.deviceToken, "rewardCompleted", msg, (cb) => {
                                                    usersRewarddata.rewardCompleted = 0;
                                                    usersRewarddata.claimedReward = false;
                                                    usersRewarddata.save((err, savedNoti) => {

                                                       if (err) {
                                                          res.status(200).json({
                                                             message: 'Order saved Your otp is',
                                                             otp: otpOfOrder,
                                                             error: "false",

                                                          });

                                                       }

                                                       res.status(200).json({
                                                          message: 'Order saved Your otp is',
                                                          otp: otpOfOrder,
                                                          error: "false",

                                                       });
                                                    })

                                                 }, orderd._id)

                                              })

                                           })
                                           .catch(function(err) {
                                              //console.log("Something has gone wrong1!");
                                              console.error(err);
                                              res.status(200).json({
                                                 message: 'Order saved Your otp is',
                                                 otp: otpOfOrder,
                                                 error: "false",

                                               

                                              });
                                           });
                                     }

                                  })
                               } else {

                                  return res.status(200).json({
                                     title: 'User is not eligible for claiming rewards',
                                     error: "false"

                                  });

                               }

                            })

                      } 
                   }
                }
               

                if(!rewardOrder)
                {
                    return res.status(200).json({
                   message: 'You cannot claimed a reward since Date expired',

                   error: "false",

                });
              
             }
          })
    } else if (orderType == 1) {
        //console.log("orderType");

       var shopDetail = req.body.shopDetail;
       var timeForPickcup = req.body.timeForPickcup;
       var note = req.body.note;
       var parcelData = req.body.parcel;
       var requestOrder = req.body.order;
       var actualPrice= req.body.actualPrice;
       //console.log(actualPrice);
        //console.log('actualPrice');
       var CorrectOrder = [];
       for (var i = 0; i < requestOrder.length; i++) {
          var data = requestOrder[i];
          var pushedData = {};
          pushedData.itemId = data.itemId;
          pushedData.itemSize = data.itemSize;
          pushedData.itemCat = data.itemCat;
          pushedData.itemName = data.itemName;
          pushedData.itemPrice = data.itemPrice;
          pushedData.itemQuantity = data.itemQuantity;
          pushedData.eligibleForRewards = data.eligibleForRewards;

          CorrectOrder.push(pushedData);
       }

       if (CorrectOrder.length <= 0) {
          //console.log("length issue");
          return res.status(500).json({
             title: 'Incorrect data',
             error: "true"

          });
       }

       // order.findOne({ "userDetail": decoded.user._id}).exec(function (err,user){
       //  //console.log(user);
       var otpOfOrder = randomstring.generate({
          length: 4,
          charset: 'numeric'
       });
       var orderId = randomstring.generate({
          length: 9,
          charset: 'hex'
       });
       //console.log(timeForPickcup);
       var dec = moment.tz(req.body.timeForPickcup, req.body.timezone);
       //console.log(dec);
       var timePickup = dec.utc().format('YYYY-MM-DD HH:mm:ss');
       //console.log(timePickup);
       //console.log('timePickup');

       var totalPrice = req.body.totalPrice;
       var ordered = new Orders({
          shopDetail: shopDetail,
          totalPrice: totalPrice,
          orderId: orderId,
          userDetail: decoded.user._id,
          otp: otpOfOrder,
          costPrice:parseInt(actualPrice),
          parcel: parcelData,
          timeForPickcup: timePickup,
          note: note,
          orderCategory:"Order",
          Ordered: CorrectOrder

       });

       ordered.save((err, orderd) => {

          if (err) {
        
             //console.log("orser saveissue");
             //console.log(err);
             return res.status(500).json({
                title: 'An error occurred',
                error: "true",
                detail: err
             });
          }

          makeuserReward(shopDetail, CorrectOrder,decoded.user._id);
          // var mesg = "Order " + orderd.orderId + " placed successfully and your OTP is " + orderd.otp;
         

          Stripe.payCharges(req.body.userToken, totalPrice, (data, userData) => {

             if (data == "user not found or data finding err" || data == 'not a stripe user') {
                orderd.transactionId = " ";
                orderd.transactionMsg = 'User not found';
                orderd.balance_transaction = "";
                orderd.save((err, savedorder) => {
                   if (err) {
                      return res.status(200).json({
                         message: 'Order saved in db but not updated',
                         otp: otpOfOrder,
                         error: "false",

                         // obj: user

                      });
                   }

                   res.status(200).json({
                      message: 'Order saved in db but stripe finding user failed',
                      otp: otpOfOrder,
                      error: "false",

                      // obj: user

                   });

                });

             } else if (data == 'stripe payment succesfull') {
                orderd.transactionId = userData.id;
                orderd.transactionMsg = "Payment succesful";
                orderd.balance_transaction = userData.balance_transaction;
                orderd.save((err, savedorder) => {
                   if (err) {
                      return res.status(200).json({
                         message: 'Order saved in db but not updated',
                         otp: otpOfOrder,
                         error: "false",

                         // obj: user

                      });
                   }
                  var mesg = "Your order at " + CurrentStoreDetail.cafe_name + " is successfully placed.";
                  Storesmodu.updateOwnerBalance(req.body.shopDetail,decoded.user._id,totalPrice,userData.id,userData.balance_transaction,actualPrice);

                   removeTempOrder(decoded.user._id, req.body.shopDetail, otpOfOrder, CurrentStoreDetail, CurrentUserDetail, mesg, orderd, req, res);
                });

             } else if (data == 'stripe error no sources added' || data == 'stripe error not a primary card') {
                orderd.transactionId = userData.id;
                orderd.transactionMsg = "payment unsuccesful";
                orderd.balance_transaction = userData.balance_transaction;
                orderd.save((err, savedorder) => {
                   if (err) {
                      return res.status(200).json({
                         message: 'Order saved in db but not updated',
                         otp: otpOfOrder,
                         error: "false",

                         // obj: user

                      });
                   }

                   res.status(200).json({
                      message: 'Order saved in db but stripe error and err is',
                      otp: otpOfOrder,
                      error: "false",
                      errordta: data

                      //obj: user

                   });
                });

             } else if (data == 'stripe error something went wrong') {
                orderd.transactionId = userData.id;
                orderd.transactionMsg = "payment unsuccesful";
                orderd.balance_transaction = userData.balance_transaction;
                orderd.save((err, savedorder) => {
                   if (err) {
                      return res.status(200).json({
                         message: 'Order saved in db but not updated',
                         otp: otpOfOrder,
                         error: "false",

                         // obj: user

                      });
                   }

                   res.status(200).json({
                      message: 'Order saved in db but stripe error and err is',
                      otp: otpOfOrder,
                      error: "false",
                      errordta: data

                      // obj: user

                   });
                });

             } else {
                orderd.transactionId = " ";
                orderd.transactionMsg = data;
                orderd.balance_transaction = "";
                orderd.save((err, savedorder) => {
                   if (err) {
                      return res.status(200).json({
                         message: 'Order saved in db but not updated',
                         otp: otpOfOrder,
                         error: "false",

                         // obj: user

                      });
                   }

                   res.status(200).json({
                      message: 'Order saved in db but stripe error occured',
                      otp: otpOfOrder,
                      error: "false",

                      // obj: user

                   });
                });

             }

          });

       });
    } else {

       //var token = req.body.userToken;
       //var decoded = jwt.decode(token, "pickup");
       var shopDetail = req.body.shopDetail;
       var timeForPickcup = req.body.timeForPickcup;
       var note = req.body.note;
       var parcelData = req.body.parcel;
       var requestOrder = req.body.order;
       var CorrectOrder = [];
       var totalPrice = req.body.totalPrice;
        var actualPrice= req.body.actualPrice;
        //console.log(actualPrice);
        //console.log('actualPrice');
       for (var i = 0; i < requestOrder.length; i++) {
          var data = requestOrder[i];
          var pushedData = {};
          pushedData.itemId = data.itemId;
          pushedData.itemSize = data.itemSize;
          pushedData.itemCat = data.itemCat;
          pushedData.itemName = data.itemName;
          pushedData.itemPrice = data.itemPrice;
          pushedData.itemQuantity = data.itemQuantity;
          pushedData.eligibleForRewards = data.eligibleForRewards;

          CorrectOrder.push(pushedData);
       }

       if (CorrectOrder.length <= 0) {
          //console.log("length issue");
          return res.status(500).json({
             title: 'Incorrect data oreder cannot be placed',
             error: "true"

          });
       }
       // var CurrentUserDetail;
       // var CurrentStoreDetail;

       reward
          .find({
             "shopDetail": shopDetail
          })
          .exec(function(err, reward) {
             //console.log("reward>>>>>>>>>>>>>>>>>");
             //console.log(reward);
             if (err) {
                //console.log("error finding rewrad");
                return res.status(500).json({
                   title: 'An error occurred',
                   error: "true",
                   detail: err
                });
             }

             if (!reward) {
                //console.log("error finding rewrad");
                return res.status(200).json({
                   title: 'no reward for such shop order cannot be placed',
                   error: "false",

                });
             }
             else {

               for(i in reward)
               {
                       var enddateData = new Date(reward[i].enddate);
                       enddateData.setHours(0, 0, 0, 0);
                       var startdateData = new Date(reward[i].startdate);
                       startdateData.setHours(0, 0, 0, 0);

                       var dateDat = new Date();
                        var timezone=moment.tz.guess();
                        // //console.log(moment.tz.guess());
                        var dec = moment.tz(dateDat,timezone);
                        //console.log(dec);
                        //console.log('dec');
                        var dateDatat = dec.utc().format('YYYY-MM-DD HH:mm:ss');

                        var dateData  =new Date(dateDatat) ;
                        //console.log(dateData);
                        //console.log('dateData');

                       //console.log(enddateData);
                       //console.log(startdateData);
                       //console.log(dateData);
                       if ((enddateData >= dateData) && (startdateData <= dateData)) {

                                   usersReward
                                      .findOne({
                                         "shopDetail": shopDetail,
                                         "userDetail": decoded.user._id,
                                         "rewardId": reward[i]._id
                                      })
                                      .exec(function(err, usersRewarddata) {
                                         if (err) {
                                            return res.status(500).json({
                                               title: 'An error occurred',
                                               error: "true",
                                               detail: err
                                            });
                                         }
                                         if (!usersRewarddata) {
                                            return res.status(200).json({
                                               title: 'No user with such shop reward order cannot be placed',
                                               error: "false"

                                            });
                                         }

                                         if (usersRewarddata.claimedReward) {
                                          

                                            var otpOfOrder = randomstring.generate({
                                               length: 4,
                                               charset: 'numeric'
                                            });
                                            var orderId = randomstring.generate({
                                               length: 9,
                                               charset: 'hex'
                                            });
                                            //console.log(timeForPickcup);
                                            var dec = moment.tz(req.body.timeForPickcup, req.body.timezone);
                                            //console.log(dec);
                                            var timePickup = dec.utc().format('YYYY-MM-DD HH:mm:ss');
                                            //console.log(timePickup);
                                            //console.log('timePickup');
                                            //moment(1369266934311).tz('America/Phoenix').format('YYYY-MM-DD HH:mm')
                                            //var totalPrice = req.body.totalPrice;
                                            var ordered = new Orders({
                                               shopDetail: shopDetail,
                                               totalPrice: totalPrice,
                                               orderId: orderId,
                                               userDetail: decoded.user._id,
                                               otp: otpOfOrder,
                                               costPrice:parseInt(actualPrice),
                                               parcel: parcelData,
                                               timeForPickcup: timePickup,
                                               note: note,
                                               orderCategory:"Order and Reward",
                                               Ordered:CorrectOrder

                                            });
                                           ordered.save((err, orderd) => {

                                              if (err) {
                                                 //console.log("orser saveissue");
                                                 //console.log(err);
                                                 return res.status(500).json({
                                                    title: 'An error occurred',
                                                    error: "true",
                                                    detail: err
                                                 });
                                              }

                                              
                                              //var mesg = "Order and Reward with order id" + orderd.orderId + " placed successfully and your OTP is " + orderd.otp;
                                             
                                              Stripe.payCharges(req.body.userToken, totalPrice, (data, userData) => {

                                                 if (data == "user not found or data finding err" || data == 'not a stripe user') {
                                                    orderd.transactionId = " ";
                                                    orderd.transactionMsg = 'User not found';
                                                    orderd.balance_transaction = "";
                                                    orderd.save((err, savedorder) => {
                                                       if (err) {
                                                          return res.status(200).json({
                                                             message: 'Order saved in db but not updated',
                                                             otp: otpOfOrder,
                                                             error: "false",

                                                             // obj: user

                                                          });
                                                       }

                                                       res.status(200).json({
                                                          message: 'Order saved in db but stripe finding user failed',
                                                          otp: otpOfOrder,
                                                          error: "false",

                                                          // obj: user

                                                       });

                                                    });

                                                 } else if (data == 'stripe payment succesfull') {
                                                    orderd.transactionId = userData.id;
                                                    orderd.transactionMsg = "Payment succesful";
                                                    orderd.balance_transaction = userData.balance_transaction;
                                                    orderd.save((err, savedorder) => {
                                                       if (err) {
                                                          return res.status(200).json({
                                                             message: 'Order saved in db but not updated',
                                                             otp: otpOfOrder,
                                                             error: "false",

                                                             // obj: user

                                                          });
                                                       }

                                                              usersRewarddata.rewardCompleted = 0;
                                                              usersRewarddata.claimedReward = false;
                                                              usersRewarddata.save((err, savedData) => {

                                                                 if (err) {
                                                                    res.status(200).json({
                                                                       message: 'Order saved in db but userreward not updated',
                                                                       otp: otpOfOrder,
                                                                       error: "false",

                                                                    });

                                                                 }
                                                                 makeuserReward(shopDetail, CorrectOrder, decoded.user._id);
                                                                 var mesg = "Your reward and order at " + CurrentStoreDetail.cafe_name + " is successfully placed.";
                                                                Storesmodu.updateOwnerBalance(req.body.shopDetail,decoded.user._id,totalPrice,userData.id,userData.balance_transaction,actualPrice);
                                                                removeTempOrder(decoded.user._id, req.body.shopDetail, otpOfOrder, CurrentStoreDetail, CurrentUserDetail, mesg, orderd, req, res);
                                                              })


                                                       
                                                    });

                                                 } else if (data == 'stripe error no sources added' || data == 'stripe error not a primary card') {
                                                    orderd.transactionId = "";
                                                    orderd.transactionMsg = "payment unsuccesful";
                                                    orderd.balance_transaction = userData.balance_transaction;
                                                    orderd.save((err, savedorder) => {
                                                       if (err) {
                                                          return res.status(200).json({
                                                             message: 'Order saved in db but not updated',
                                                             otp: otpOfOrder,
                                                             error: "false",

                                                             // obj: user

                                                          });
                                                       }

                                                       res.status(200).json({
                                                          message: 'Order saved in db but stripe error and err is',
                                                          otp: otpOfOrder,
                                                          error: "false",
                                                          errordta: data

                                                          //obj: user

                                                       });
                                                    });

                                                 } else if (data == 'stripe error something went wrong') {
                                                    orderd.transactionId = userData.id;
                                                    orderd.transactionMsg = "payment unsuccesful";
                                                    orderd.balance_transaction = userData.balance_transaction;
                                                    orderd.save((err, savedorder) => {
                                                       if (err) {
                                                          return res.status(200).json({
                                                             message: 'Order saved in db but not updated',
                                                             otp: otpOfOrder,
                                                             error: "false",

                                                             // obj: user

                                                          });
                                                       }

                                                       res.status(200).json({
                                                          message: 'Order saved in db but stripe error and err is',
                                                          otp: otpOfOrder,
                                                          error: "false",
                                                          errordta: data

                                                          // obj: user

                                                       });
                                                    });

                                                 } else {
                                                    orderd.transactionId = " ";
                                                    orderd.transactionMsg = data;
                                                    orderd.balance_transaction = "";
                                                    orderd.save((err, savedorder) => {
                                                       if (err) {
                                                          return res.status(200).json({
                                                             message: 'Order saved in db but not updated',
                                                             otp: otpOfOrder,
                                                             error: "false",

                                                             // obj: user

                                                          });
                                                       }

                                                       res.status(200).json({
                                                          message: 'Order saved in db but stripe error occured',
                                                          otp: otpOfOrder,
                                                          error: "false",

                                                          // obj: user

                                                       });
                                                    });

                                                 }

                                              });

                                           });
                                         } else {

                                            return res.status(200).json({
                                               title: 'User is not eligible for claiming rewards',
                                               error: "false"

                                            });

                                         }

                                      })

                                }
                }
            }

        })
    }
}

// exports.createOrder = (req, res) => {

//    //console.log('new Date(timePickup) createOrder');
//    var token = req.body.userToken;
//    var decoded = jwt.decode(token, "pickup");
//    var CurrentUserDetail;
//    var CurrentStoreDetail;
//       var shopDetail = req.body.shopDetail;
//    var orderType = req.body.orderType;
//    //console.log(orderType);
//    //console.log('orderType');
//    helper.findShopowner(shopDetail, function(cb) {
//       CurrentStoreDetail = cb;
//         // //console.log(CurrentStoreDetail);
//       //console.log('CurrentStoreDetail');

//    });

//    helper.findUser(decoded.user._id, function(cb) {
//       CurrentUserDetail = cb;
//       ////console.log(CurrentUserDetail);
//       //console.log('CurrentUserDetail');
//    });

//    if (orderType == 0) 
//    {
    
//       var timeForPickcup = req.body.timeForPickcup;
//       var note = "Rewards";
//       var parcelData = req.body.parcel;
//       // var CurrentUserDetail;
//       // var CurrentStoreDetail;

//       reward
//          .findOne({
//             "shopDetail": shopDetail
//          })
//          .exec(function(err, reward) {
//             // //console.log("reward>>>>>>>>>>>>>>>>>");
//             // //console.log(reward);
//             if (err) {
//                //console.log("error finding rewrad");
//                return res.status(500).json({
//                   title: 'An error occurred',
//                   error: "true",
//                   detail: err
//                });
//             }

//             if (!reward) {
//                //console.log("error finding rewrad");
//                return res.status(200).json({
//                   title: 'no reward for such shop',
//                   error: "false",

//                });
//             } else {

//                var enddateData = new Date(reward.enddate);
//                enddateData.setHours(0, 0, 0, 0);
//                var startdateData = new Date(reward.startdate);
//                startdateData.setHours(0, 0, 0, 0);

//                var dateData = new Date();
//                dateData.setHours(0, 0, 0, 0);

//                //console.log(enddateData);
//                //console.log(startdateData);
//                //console.log(dateData);
//                if ((enddateData >= dateData) && (startdateData <= dateData)) {

//                   usersReward
//                      .findOne({
//                         "shopDetail": shopDetail,
//                         "userDetail": decoded.user._id,
//                         "rewardId": reward._id
//                      })
//                      .exec(function(err, usersRewarddata) {
//                         if (err) {
//                            return res.status(500).json({
//                               title: 'An error occurred',
//                               error: "true",
//                               detail: err
//                            });
//                         }
//                         if (!usersRewarddata) {
//                            return res.status(200).json({
//                               title: 'No user with such shop reward',
//                               error: "false"

//                            });
//                         }

//                         if (usersRewarddata.claimedReward) {
//                            // helper.findShopowner(shopDetail, function(cb) {
//                            //     CurrentStoreDetail = cb;

//                            // });

//                            // helper.findUser(decoded.user._id, function(cb) {
//                            //     CurrentUserDetail = cb;
//                            //     //console.log(CurrentUserDetail);
//                            //     //console.log('CurrentUserDetail');
//                            // });

//                            var otpOfOrder = randomstring.generate({
//                               length: 4,
//                               charset: 'numeric'
//                            });
//                            var orderId = randomstring.generate({
//                               length: 9,
//                               charset: 'hex'
//                            });
//                            //console.log(timeForPickcup);
//                            var dec = moment.tz(req.body.timeForPickcup, req.body.timezone);
//                            //console.log(dec);
//                            var timePickup = dec.utc().format('YYYY-MM-DD HH:mm:ss');
//                            // //console.log(timePickup);
//                            // //console.log('timePickup');
//                            if(timePickup == "Invalid date")
//                            {
//                                return res.status(200).json({
//                                     title: 'date error',
//                                     error: "false"
//                                  });
//                            }
//                            //moment(1369266934311).tz('America/Phoenix').format('YYYY-MM-DD HH:mm')
//                            var totalPrice = req.body.totalPrice;
//                            var ordered = new Orders({
//                               shopDetail: shopDetail,
//                               totalPrice: 0,
//                               orderId: orderId,
//                               userDetail: decoded.user._id,
//                               otp: otpOfOrder,
//                               parcel: true,
//                               timeForPickcup: timePickup,
//                               note: note,
//                               orderCategory:"Reward",
//                               Ordered: []

//                            });
//                            ordered.save((err, orderd) => {

//                               if (err) {
//                                  //console.log("orser saveissue");
//                                  //console.log(err);
//                                  return res.status(500).json({
//                                     title: 'An error occurred',
//                                     error: "true",
//                                     detail: err
//                                  });
//                               }

//                               if (CurrentStoreDetail == 'err' || CurrentStoreDetail == 'no store Found') {

//                                  //console.log("as no store found cannot send the notification to the user");
//                                  //console.log("as no store found cannot send the notification to the user");
//                                  res.status(200).json({
//                                     message: 'Order saved Your otp is',
//                                     otp: otpOfOrder,
//                                     error: "false",
//                                     obj: user

//                                  });

//                               } else {

//                                  // //console.log(orderd);
//                                  // //console.log(CurrentUserDetail);
//                                  // //console.log(CurrentStoreDetail.deviceToken);
//                                  // //console.log('CurrentUserDetail?????????????');
//                                  var message = {
//                                     registration_ids: CurrentStoreDetail.deviceToken,
//                                     priority: "high",
//                                     forceshow: true, // required fill with device token or topics
//                                     collapse_key: 'Pickcup',
//                                     data: {
//                                        flag: "rewardOrder",
//                                        order: orderd,
//                                        currentUserDetail: CurrentUserDetail
//                                     },
//                                     notification: {
//                                        title: 'Pickcup',
//                                        body: "You have received a new order for claiming a reward",

//                                     }
//                                  };

//                                  //promise style
//                                  fcm.send(message)
//                                     .then(function(response) {
//                                        //var msg =msgForNoti
                               
//                                        var msg = "Your reward order at " + CurrentStoreDetail.cafe_name + " is successfully placed.";
//                                        // helper.sendNotification(CurrentUserDetail.deviceToken,"orderReady",msg,function(cb)
//                                        // {

//                                        var notifi = new notification({
//                                           shopDetail: CurrentStoreDetail._id,
//                                           userDetail: CurrentUserDetail._id,
//                                           message: msg,
//                                            orderId:orderd._id

//                                        });
//                                        notifi.save((err, savedNoti) => {

//                                           if (err) {
//                                              res.status(200).json({
//                                                 message: 'Order saved Your otp is',
//                                                 otp: otpOfOrder,
//                                                 error: "false",

//                                              });

//                                           }

//                                           helper.sendNotification(CurrentUserDetail.deviceToken, "rewardCompleted", msg, (cb) => {
//                                              usersRewarddata.rewardCompleted = 0;
//                                              usersRewarddata.claimedReward = false;
//                                              usersRewarddata.save((err, savedNoti) => {

//                                                 if (err) {
//                                                    res.status(200).json({
//                                                       message: 'Order saved Your otp is',
//                                                       otp: otpOfOrder,
//                                                       error: "false",

//                                                    });

//                                                 }

//                                                 res.status(200).json({
//                                                    message: 'Order saved Your otp is',
//                                                    otp: otpOfOrder,
//                                                    error: "false",

//                                                 });
//                                              })

//                                           }, orderd._id)

//                                        })

//                                     })
//                                     .catch(function(err) {
//                                        //console.log("Something has gone wrong1!");
//                                        console.error(err);
//                                        res.status(200).json({
//                                           message: 'Order saved Your otp is',
//                                           otp: otpOfOrder,
//                                           error: "false",

//                                           obj: user

//                                        });
//                                     });
//                               }

//                            })
//                         } else {

//                            return res.status(200).json({
//                               title: 'User is not eligible for claiming rewards',
//                               error: "false"

//                            });

//                         }

//                      })

//                } else {
//                   return res.status(200).json({
//                      message: 'You cannot claimed a reward since Date expired',

//                      error: "false",

//                      // obj: user

//                   });
//                }
//             }
//          })
//    } else if (orderType == 1) {
//        //console.log("orderType");
//       //var token = req.body.userToken;
//       //var decoded = jwt.decode(token, "pickup");
//       var shopDetail = req.body.shopDetail;
//       var timeForPickcup = req.body.timeForPickcup;
//       var note = req.body.note;
//       var parcelData = req.body.parcel;
//       var requestOrder = req.body.order;
//       var actualPrice= req.body.actualPrice;
//       //console.log(actualPrice);
//        //console.log('actualPrice');
//       var CorrectOrder = [];
//       for (var i = 0; i < requestOrder.length; i++) {
//          var data = requestOrder[i];
//          var pushedData = {};
//          pushedData.itemId = data.itemId;
//          pushedData.itemSize = data.itemSize;
//          pushedData.itemCat = data.itemCat;
//          pushedData.itemName = data.itemName;
//          pushedData.itemPrice = data.itemPrice;
//          pushedData.itemQuantity = data.itemQuantity;
//          pushedData.eligibleForRewards = data.eligibleForRewards;

//          CorrectOrder.push(pushedData);
//       }

//       if (CorrectOrder.length <= 0) {
//          //console.log("length issue");
//          return res.status(500).json({
//             title: 'Incorrect data',
//             error: "true"

//          });
//       }

//       // order.findOne({ "userDetail": decoded.user._id}).exec(function (err,user){
//       //  //console.log(user);
//       var otpOfOrder = randomstring.generate({
//          length: 4,
//          charset: 'numeric'
//       });
//       var orderId = randomstring.generate({
//          length: 9,
//          charset: 'hex'
//       });
//       //console.log(timeForPickcup);
//       var dec = moment.tz(req.body.timeForPickcup, req.body.timezone);
//       //console.log(dec);
//       var timePickup = dec.utc().format('YYYY-MM-DD HH:mm:ss');
//       //console.log(timePickup);
//       //console.log('timePickup');

//       var totalPrice = req.body.totalPrice;
//       var ordered = new Orders({
//          shopDetail: shopDetail,
//          totalPrice: totalPrice,
//          orderId: orderId,
//          userDetail: decoded.user._id,
//          otp: otpOfOrder,
//          parcel: parcelData,
//          timeForPickcup: timePickup,
//          note: note,
//          orderCategory:"Order",
//          Ordered: CorrectOrder

//       });

//       ordered.save((err, orderd) => {

//          if (err) {
//             //console.log("orser saveissue");
//             //console.log(err);
//             return res.status(500).json({
//                title: 'An error occurred',
//                error: "true",
//                detail: err
//             });
//          }

//          makeuserReward(shopDetail, CorrectOrder,decoded.user._id);
//          // var mesg = "Order " + orderd.orderId + " placed successfully and your OTP is " + orderd.otp;
        

//          Stripe.payCharges(req.body.userToken, totalPrice, (data, userData) => {

//             if (data == "user not found or data finding err" || data == 'not a stripe user') {
//                orderd.transactionId = " ";
//                orderd.transactionMsg = 'User not found';
//                orderd.balance_transaction = "";
//                orderd.save((err, savedorder) => {
//                   if (err) {
//                      return res.status(200).json({
//                         message: 'Order saved in db but not updated',
//                         otp: otpOfOrder,
//                         error: "false",

//                         // obj: user

//                      });
//                   }

//                   res.status(200).json({
//                      message: 'Order saved in db but stripe finding user failed',
//                      otp: otpOfOrder,
//                      error: "false",

//                      // obj: user

//                   });

//                });

//             } else if (data == 'stripe payment succesfull') {
//                orderd.transactionId = userData.id;
//                orderd.transactionMsg = "Payment succesful";
//                orderd.balance_transaction = userData.balance_transaction;
//                orderd.save((err, savedorder) => {
//                   if (err) {
//                      return res.status(200).json({
//                         message: 'Order saved in db but not updated',
//                         otp: otpOfOrder,
//                         error: "false",

//                         // obj: user

//                      });
//                   }
//                  var mesg = "Your order at " + CurrentStoreDetail.cafe_name + " is successfully placed.";
//                  Storesmodu.updateOwnerBalance(req.body.shopDetail,decoded.user._id,totalPrice,userData.id,userData.balance_transaction,actualPrice);

//                   removeTempOrder(decoded.user._id, req.body.shopDetail, otpOfOrder, CurrentStoreDetail, CurrentUserDetail, mesg, orderd, req, res);
//                });

//             } else if (data == 'stripe error no sources added' || data == 'stripe error not a primary card') {
//                orderd.transactionId = userData.id;
//                orderd.transactionMsg = "payment unsuccesful";
//                orderd.balance_transaction = userData.balance_transaction;
//                orderd.save((err, savedorder) => {
//                   if (err) {
//                      return res.status(200).json({
//                         message: 'Order saved in db but not updated',
//                         otp: otpOfOrder,
//                         error: "false",

//                         // obj: user

//                      });
//                   }

//                   res.status(200).json({
//                      message: 'Order saved in db but stripe error and err is',
//                      otp: otpOfOrder,
//                      error: "false",
//                      errordta: data

//                      //obj: user

//                   });
//                });

//             } else if (data == 'stripe error something went wrong') {
//                orderd.transactionId = userData.id;
//                orderd.transactionMsg = "payment unsuccesful";
//                orderd.balance_transaction = userData.balance_transaction;
//                orderd.save((err, savedorder) => {
//                   if (err) {
//                      return res.status(200).json({
//                         message: 'Order saved in db but not updated',
//                         otp: otpOfOrder,
//                         error: "false",

//                         // obj: user

//                      });
//                   }

//                   res.status(200).json({
//                      message: 'Order saved in db but stripe error and err is',
//                      otp: otpOfOrder,
//                      error: "false",
//                      errordta: data

//                      // obj: user

//                   });
//                });

//             } else {
//                orderd.transactionId = " ";
//                orderd.transactionMsg = data;
//                orderd.balance_transaction = "";
//                orderd.save((err, savedorder) => {
//                   if (err) {
//                      return res.status(200).json({
//                         message: 'Order saved in db but not updated',
//                         otp: otpOfOrder,
//                         error: "false",

//                         // obj: user

//                      });
//                   }

//                   res.status(200).json({
//                      message: 'Order saved in db but stripe error occured',
//                      otp: otpOfOrder,
//                      error: "false",

//                      // obj: user

//                   });
//                });

//             }

//          });

//       });
//    } else {

//       //var token = req.body.userToken;
//       //var decoded = jwt.decode(token, "pickup");
//       var shopDetail = req.body.shopDetail;
//       var timeForPickcup = req.body.timeForPickcup;
//       var note = req.body.note;
//       var parcelData = req.body.parcel;
//       var requestOrder = req.body.order;
//       var CorrectOrder = [];
//       var totalPrice = req.body.totalPrice;
//        var actualPrice= req.body.actualPrice;
//        //console.log(actualPrice);
//        //console.log('actualPrice');
//       for (var i = 0; i < requestOrder.length; i++) {
//          var data = requestOrder[i];
//          var pushedData = {};
//          pushedData.itemId = data.itemId;
//          pushedData.itemSize = data.itemSize;
//          pushedData.itemCat = data.itemCat;
//          pushedData.itemName = data.itemName;
//          pushedData.itemPrice = data.itemPrice;
//          pushedData.itemQuantity = data.itemQuantity;
//          pushedData.eligibleForRewards = data.eligibleForRewards;

//          CorrectOrder.push(pushedData);
//       }

//       if (CorrectOrder.length <= 0) {
//          //console.log("length issue");
//          return res.status(500).json({
//             title: 'Incorrect data oreder cannot be placed',
//             error: "true"

//          });
//       }
//       // var CurrentUserDetail;
//       // var CurrentStoreDetail;

//       reward
//          .findOne({
//             "shopDetail": shopDetail
//          })
//          .exec(function(err, reward) {
//             //console.log("reward>>>>>>>>>>>>>>>>>");
//             //console.log(reward);
//             if (err) {
//                //console.log("error finding rewrad");
//                return res.status(500).json({
//                   title: 'An error occurred',
//                   error: "true",
//                   detail: err
//                });
//             }

//             if (!reward) {
//                //console.log("error finding rewrad");
//                return res.status(200).json({
//                   title: 'no reward for such shop order cannot be placed',
//                   error: "false",

//                });
//             } else {

//                var enddateData = new Date(reward.enddate);
//                enddateData.setHours(0, 0, 0, 0);
//                var startdateData = new Date(reward.startdate);
//                startdateData.setHours(0, 0, 0, 0);

//                var dateData = new Date();
//                dateData.setHours(0, 0, 0, 0);

//                //console.log(enddateData);
//                //console.log(startdateData);
//                //console.log(dateData);
//                if ((enddateData >= dateData) && (startdateData <= dateData)) {

//                   usersReward
//                      .findOne({
//                         "shopDetail": shopDetail,
//                         "userDetail": decoded.user._id,
//                         "rewardId": reward._id
//                      })
//                      .exec(function(err, usersRewarddata) {
//                         if (err) {
//                            return res.status(500).json({
//                               title: 'An error occurred',
//                               error: "true",
//                               detail: err
//                            });
//                         }
//                         if (!usersRewarddata) {
//                            return res.status(200).json({
//                               title: 'No user with such shop reward order cannot be placed',
//                               error: "false"

//                            });
//                         }

//                         if (usersRewarddata.claimedReward) {
                         

//                            var otpOfOrder = randomstring.generate({
//                               length: 4,
//                               charset: 'numeric'
//                            });
//                            var orderId = randomstring.generate({
//                               length: 9,
//                               charset: 'hex'
//                            });
//                            //console.log(timeForPickcup);
//                            var dec = moment.tz(req.body.timeForPickcup, req.body.timezone);
//                            //console.log(dec);
//                            var timePickup = dec.utc().format('YYYY-MM-DD HH:mm:ss');
//                            //console.log(timePickup);
//                            //console.log('timePickup');
//                            //moment(1369266934311).tz('America/Phoenix').format('YYYY-MM-DD HH:mm')
//                            //var totalPrice = req.body.totalPrice;
//                            var ordered = new Orders({
//                               shopDetail: shopDetail,
//                               totalPrice: totalPrice,
//                               orderId: orderId,
//                               userDetail: decoded.user._id,
//                               otp: otpOfOrder,
//                               parcel: parcelData,
//                               timeForPickcup: timePickup,
//                               note: note,
//                               orderCategory:"Order and Reward",
//                               Ordered:CorrectOrder

//                            });
//                           ordered.save((err, orderd) => {

//                              if (err) {
//                                 //console.log("orser saveissue");
//                                 //console.log(err);
//                                 return res.status(500).json({
//                                    title: 'An error occurred',
//                                    error: "true",
//                                    detail: err
//                                 });
//                              }

//                              makeuserReward(shopDetail, CorrectOrder, decoded.user._id);
//                              //var mesg = "Order and Reward with order id" + orderd.orderId + " placed successfully and your OTP is " + orderd.otp;
                            
//                              Stripe.payCharges(req.body.userToken, totalPrice, (data, userData) => {

//                                 if (data == "user not found or data finding err" || data == 'not a stripe user') {
//                                    orderd.transactionId = " ";
//                                    orderd.transactionMsg = 'User not found';
//                                    orderd.balance_transaction = "";
//                                    orderd.save((err, savedorder) => {
//                                       if (err) {
//                                          return res.status(200).json({
//                                             message: 'Order saved in db but not updated',
//                                             otp: otpOfOrder,
//                                             error: "false",

//                                             // obj: user

//                                          });
//                                       }

//                                       res.status(200).json({
//                                          message: 'Order saved in db but stripe finding user failed',
//                                          otp: otpOfOrder,
//                                          error: "false",

//                                          // obj: user

//                                       });

//                                    });

//                                 } else if (data == 'stripe payment succesfull') {
//                                    orderd.transactionId = userData.id;
//                                    orderd.transactionMsg = "Payment succesful";
//                                    orderd.balance_transaction = userData.balance_transaction;
//                                    orderd.save((err, savedorder) => {
//                                       if (err) {
//                                          return res.status(200).json({
//                                             message: 'Order saved in db but not updated',
//                                             otp: otpOfOrder,
//                                             error: "false",

//                                             // obj: user

//                                          });
//                                       }

//                                              usersRewarddata.rewardCompleted = 0;
//                                              usersRewarddata.claimedReward = false;
//                                              usersRewarddata.save((err, savedData) => {

//                                                 if (err) {
//                                                    res.status(200).json({
//                                                       message: 'Order saved in db but userreward not updated',
//                                                       otp: otpOfOrder,
//                                                       error: "false",

//                                                    });

//                                                 }
//                                                 var mesg = "Your reward and order at " + CurrentStoreDetail.cafe_name + " is successfully placed.";
//                                                Storesmodu.updateOwnerBalance(req.body.shopDetail,decoded.user._id,totalPrice,userData.id,userData.balance_transaction,actualPrice);
//                                                removeTempOrder(decoded.user._id, req.body.shopDetail, otpOfOrder, CurrentStoreDetail, CurrentUserDetail, mesg, orderd, req, res);
//                                              })


                                      
//                                    });

//                                 } else if (data == 'stripe error no sources added' || data == 'stripe error not a primary card') {
//                                    orderd.transactionId = "";
//                                    orderd.transactionMsg = "payment unsuccesful";
//                                    orderd.balance_transaction = userData.balance_transaction;
//                                    orderd.save((err, savedorder) => {
//                                       if (err) {
//                                          return res.status(200).json({
//                                             message: 'Order saved in db but not updated',
//                                             otp: otpOfOrder,
//                                             error: "false",

//                                             // obj: user

//                                          });
//                                       }

//                                       res.status(200).json({
//                                          message: 'Order saved in db but stripe error and err is',
//                                          otp: otpOfOrder,
//                                          error: "false",
//                                          errordta: data

//                                          //obj: user

//                                       });
//                                    });

//                                 } else if (data == 'stripe error something went wrong') {
//                                    orderd.transactionId = userData.id;
//                                    orderd.transactionMsg = "payment unsuccesful";
//                                    orderd.balance_transaction = userData.balance_transaction;
//                                    orderd.save((err, savedorder) => {
//                                       if (err) {
//                                          return res.status(200).json({
//                                             message: 'Order saved in db but not updated',
//                                             otp: otpOfOrder,
//                                             error: "false",

//                                             // obj: user

//                                          });
//                                       }

//                                       res.status(200).json({
//                                          message: 'Order saved in db but stripe error and err is',
//                                          otp: otpOfOrder,
//                                          error: "false",
//                                          errordta: data

//                                          // obj: user

//                                       });
//                                    });

//                                 } else {
//                                    orderd.transactionId = " ";
//                                    orderd.transactionMsg = data;
//                                    orderd.balance_transaction = "";
//                                    orderd.save((err, savedorder) => {
//                                       if (err) {
//                                          return res.status(200).json({
//                                             message: 'Order saved in db but not updated',
//                                             otp: otpOfOrder,
//                                             error: "false",

//                                             // obj: user

//                                          });
//                                       }

//                                       res.status(200).json({
//                                          message: 'Order saved in db but stripe error occured',
//                                          otp: otpOfOrder,
//                                          error: "false",

//                                          // obj: user

//                                       });
//                                    });

//                                 }

//                              });

//                           });
//                         } else {

//                            return res.status(200).json({
//                               title: 'User is not eligible for claiming rewards',
//                               error: "false"

//                            });

//                         }

//                      })

//                } else {
//                   return res.status(200).json({
//                      message: 'You cannot claimed a reward since Date expired',

//                      error: "false",

//                      // obj: user

//                   });
//                }
//             }
//          })
//     }

// }

var removeTempOrder = (token, shopDetail, otpOfOrder, CurrentStoreDetail, CurrentUserDetail, msgForNoti, orderd, req, res) => {

   tempOrder.remove({
      "userDetail": token,
      "shopDetail": shopDetail
   }).exec(function(err, user) {

      if (CurrentStoreDetail == 'err' || CurrentStoreDetail == 'no store Found') {

         ////console.log("as no store found cannot send the notification to the user");
         ////console.log("as no store found cannot send the notification to the user");
         res.status(200).json({
            message: 'Order saved Your otp is',
            otp: otpOfOrder,
            error: "false",

            obj: user

         });

      } else {

         // //console.log(orderd);
         // //console.log(CurrentUserDetail);
         // //console.log(CurrentStoreDetail.deviceToken);
        // //console.log('CurrentUserDetail?????????????');
         var message = {
            registration_ids: CurrentStoreDetail.deviceToken,
            priority: "high",
            forceshow: true, // required fill with device token or topics
            collapse_key: 'Pickcup',
            data: {
               flag: "newOrder",
               order: orderd,
               currentUserDetail: CurrentUserDetail
            },
            notification: {
               title: 'Pickcup',
               body: "You have received a new order",
               sound : "default"

            }
         };

         //promise style
         fcm.send(message)
            .then(function(response) {
               var msg = msgForNoti

             
               var notifi = new notification({
                  shopDetail: CurrentStoreDetail._id,
                  userDetail: CurrentUserDetail._id,
                  message: msg,
                  cafe_name:CurrentStoreDetail.cafe_name,
                  orderId:orderd._id
               });
               notifi.save((err, savedNoti) => {

                  if (err) {
                     res.status(200).json({
                        message: 'Order saved Your otp is',
                        otp: otpOfOrder,
                        error: "false",

                        obj: user

                     });

                  }

                  helper.sendNotification(CurrentUserDetail.deviceToken, "orderCompleted", msg, (cb) => {
                  
                      res.status(200).json({
                        message: 'Order saved Your otp is',
                        otp: otpOfOrder,
                        error: "false",

                        obj: user

                     });
                  
                    

                  },orderd._id)

               })

            })
            .catch(function(err) {
               //console.log("Something has gone wrong1!");
               console.error(err);
               //console.log(serverKey);
                   //console.log(CurrentUserDetail.deviceToken);
              
               //console.log('serverKey/////////////////////');
                      var msg = msgForNoti;

             
               var notifi = new notification({
                  shopDetail: CurrentStoreDetail._id,
                  userDetail: CurrentUserDetail._id,
                  message: msg,
                  cafe_name:CurrentStoreDetail.cafe_name,
                  orderId:orderd._id
               });
               notifi.save((err, savedNoti) => {

                  if (err) {
                     res.status(200).json({
                        message: 'Order saved Your otp is',
                        otp: otpOfOrder,
                        error: "false",

                        obj: user

                     });

                  }

                  helper.sendNotification(CurrentUserDetail.deviceToken, "orderCompleted", msg, (cb) => {
                  
                      res.status(200).json({
                        message: 'Order saved Your otp is',
                        otp: otpOfOrder,
                        error: "false",

                        obj: user

                     });
                  
                    

                  },orderd._id)

               })
            });

      }

   });
}

exports.findpartiOrder = (req, res) => {

   var token = req.body.userToken;
   var decoded = jwt.decode(token, "pickup");
   //console.log(decoded);
   Orders
      .find({
         "_id": ObjectId(req.body.orderId)
      })
      .populate('shopDetail', 'status imageurl cafe_name  rating')
      .exec(function(err, user) {
         if (err) {
            return res.status(500).json({
               title: 'An error occurred',
               error: "true",
               detail: err
            });
         }

         if (!user) {
            return res.status(200).json({
               title: 'No order found for this user',
               error: "true"

            });
         }
         if (user.length <= 0) {
            return res.status(200).json({
               title: 'No order found for this user',
               error: "true"

            });
         }

         //console.log(user);
         //console.log("users");
         res.status(200).json({
            title: 'User found ',
            error: "false",
            data: user
         });

      })
}

exports.orderListing = (req, res) => {

   var token = req.body.userToken;
   var decoded = jwt.decode(token, "pickup");
   //console.log(decoded);
   var initialData = 10;
   var requestData = parseInt(req.body.requestData);
   var skip_D = parseInt(req.body.skipData);
   var limitData = initialData * requestData;
   var skipingData = 0;
   if (requestData > 1) {
      var skipingData = skip_D * initialData;
   }
   Orders
      .find({
         "shopDetail": decoded.data.id
      })
      .limit(limitData)
      .skip(skipingData)
      .sort({
         'updatedAt': -1
      })
      .exec(function(err, user) {
         if (err) {
            return res.status(500).json({
               title: 'An error occurred',
               error: "true",
               detail: err
            });
         }

         if (!user) {
            return res.status(200).json({
               title: 'No order found for this user',
               error: "true"

            });
         }
         if (user.length <= 0) {
            return res.status(200).json({
               title: 'No order found for this user',
               error: "true"

            });
         }

         return res.status(200).json({
            title: 'User found ',
            error: "false",
            data: user
         });

      })
}

exports.addItemToCart = (req, res) => {
   var token = req.body.userToken;
   //console.log(req.body);
   // //console.log(req.body);
   var decoded = jwt.decode(token, "pickup");

   //var itemCat=req.body.itemCat;
   var shopDetail = req.body.shopDetail;

   // var requestOrder=req.body.order;
   // //console.log(decoded);
   // //console.log('decoded');
   var CorrectOrder = [];

   // for (var i = 0; i < requestOrder.length; i++) {
   //var data=requestOrder[i];
   var pushedData = {};
   pushedData.itemId = req.body.itemId;
   pushedData.itemSize = req.body.itemSize;
   pushedData.itemName = req.body.itemName;
   pushedData.itemCat = req.body.itemCat;
   pushedData.itemPrice = req.body.itemPrice;
   pushedData.itemQuantity = req.body.itemQuantity;
   pushedData.eligibleForRewards = req.body.eligibleForRewards;
   CorrectOrder.push(pushedData);
   // }

   if (CorrectOrder.length <= 0) {
      return res.status(200).json({
         title: 'Incorrect data',
         error: "true"

      });
   }

   tempOrder.findOne({
      "userDetail": decoded.user._id
   }).exec(function(err, user) {

      // //console.log(user);
      // //console.log(err);
      if (err) {

         return res.status(500).json({
            title: 'An error occurred',
            error: "true",
            detail: err
         });
      }

      if (!user) {
         var ordered = new tempOrder({
            shopDetail: shopDetail,

            userDetail: decoded.user._id,

            Ordered: CorrectOrder

         });

         ordered.save((err, user) => {

            if (err) {
               return res.status(500).json({
                  title: 'An error occurred',
                  error: "true",
                  detail: err
               });
            }
            return res.status(200).json({
               title: 'Order saved to cart',
               message: 'Order saved to cart',
               error: "false",
               data: user

            });

         })

      } else {
         if (!(user.shopDetail == req.body.shopDetail)) {
            return res.status(200).json({
               title: 'multiple shopDetail',
               error: "true",
               data: user
            });
         }

         var AlreadyIncart = checkIfPresent(req.body.itemId, user.Ordered);
         var ofSameSize = checkIitemSizePresent(req.body.itemSize, user.Ordered);
         //console.log(ofSameSize);
         //console.log(AlreadyIncart);
         //console.log('AlreadyIncart');

         if (AlreadyIncart && ofSameSize) {
            //console.log('AlreadyIncart >>>>>>>>>>>.if');
            for (i = 0; i < user.Ordered.length; i++) {

               var cor = user.Ordered[i].itemId;
               var corSize = user.Ordered[i].itemSize;

               if (cor == req.body.itemId && corSize == req.body.itemSize) {

                  user.Ordered[i].itemId = req.body.itemId;
                  user.Ordered[i].itemSize = req.body.itemSize;
                  user.Ordered[i].itemName = req.body.itemName;
                  user.Ordered[i].itemPrice = req.body.itemPrice;
                  user.Ordered[i].itemCat = req.body.itemCat;
                  user.Ordered[i].eligibleForRewards = req.body.eligibleForRewards;
                  user.Ordered[i].itemQuantity = parseInt(user.Ordered[i].itemQuantity) + parseInt(req.body.itemQuantity);
                  user.save((err, user) => {

                     if (err) {
                        return res.status(500).json({
                           title: 'An error occurred',
                           error: "true",
                           detail: err
                        });
                     }

                     res.status(200).json({
                        title: 'Duplicate Item in cart',
                        error: "false",
                        data: user
                     });

                  });
                  break;

               }
            }

         } else {

            //console.log('AlreadyIncart >>>>>>>>>>>.else');

            for (i = 0; i < CorrectOrder.length; i++) {
               user.Ordered.push(CorrectOrder[i]);
            }

            user.save((err, user) => {

               if (err) {
                  return res.status(500).json({
                     title: 'An error occurred',
                     error: "true",
                     detail: err
                  });
               }

               res.status(200).json({
                  title: 'Order saved to cart for exist user',
                  message: 'Order saved to cart for exist user',
                  error: "false",
                  data: user
               });

            })

         }

      }

   });

}

exports.addItemToCartwithOkclick = (req, res) => {
   var token = req.body.userToken;
   //console.log(req.body);
   var decoded = jwt.decode(token, "pickup");

   //var itemCat=req.body.itemCat;
   var shopDetail = req.body.shopDetail;

   // var requestOrder=req.body.order;
   // //console.log(decoded);
   // //console.log('decoded');
   var CorrectOrder = [];

   // for (var i = 0; i < requestOrder.length; i++) {
   //var data=requestOrder[i];
   var pushedData = {};
   pushedData.itemId = req.body.itemId;
   pushedData.itemSize = req.body.itemSize;
   pushedData.itemName = req.body.itemName;
   pushedData.itemPrice = req.body.itemPrice;
   pushedData.itemCat = req.body.itemCat;
   pushedData.itemQuantity = req.body.itemQuantity;
   pushedData.eligibleForRewards = req.body.eligibleForRewards;

   CorrectOrder.push(pushedData);
   // }

   if (CorrectOrder.length <= 0) {
      return res.status(200).json({
         title: 'Incorrect data',
         error: "true"

      });
   }

   tempOrder.findOneAndRemove({
      "userDetail": decoded.user._id
   }).exec(function(err, user) {
      //console.log(user);

      if (err) {

         return res.status(500).json({
            title: 'An error occurred',
            error: "true",
            detail: err
         });
      }

      if (user) {
         var ordered = new tempOrder({
            shopDetail: shopDetail,

            userDetail: decoded.user._id,

            Ordered: CorrectOrder

         });

         ordered.save((err, user) => {

            if (err) {
               return res.status(500).json({
                  title: 'An error occurred',
                  error: "true",
                  detail: err
               });
            }
            res.status(200).json({
               message: 'Order saved to cart',
               error: "false",

               data: user

            });

         })

      }

   });

}



exports.checkIfSameOrderCart = (req, res) => {

   var token = req.body.userToken;
   var decoded = jwt.decode(token, "pickup");
   var shopDetail=req.body.shopDetail;
  // var canClaimedReward = "false";
   // var adminTax = helper.adminChargesforUser();
   // var stripeCharge = helper.stripeCharges();

   tempOrder
      .findOne({
         "userDetail": decoded.user._id
      })
      .exec(function(err, user) {
         //console.log(user);
         if (err) {
            return res.status(500).json({
               title: 'An error occurred',
               error: "true",
               detail: err
            });
         }

         if (user) {
            if(ObjectId(shopDetail).equals(ObjectId(user.shopDetail )))
            {
               return res.status(200).json({
               title: 'Can claim reward with order',
               error: "false"
               });
            }
            else
            {
               return res.status(200).json({
               title: 'Cannot claim reward as order with other shop exist',
               error: "true"
               });
            }
           
         }
        
        res.status(200).json({
               title: ' can claim reward',
               error: "false"
               });






         });
   }

   exports.deleteCart = (req, res) => {

   var token = req.body.userToken;
   var decoded = jwt.decode(token, "pickup");
   var shopDetail=req.body.shopDetail;
  // var canClaimedReward = "false";
   // var adminTax = helper.adminChargesforUser();
   // var stripeCharge = helper.stripeCharges();

   tempOrder
      .findOneAndRemove({
         "userDetail": decoded.user._id
      })
      .exec(function(err, user) {
         //console.log(user);
         if (err) {
            return res.status(500).json({
               title: 'An error occurred',
               error: "true",
               detail: err
            });
         }

         if (!user) {
            
            res.status(200).json({
               title: 'cannot delete',
               error: "true"
               });
         }
        
        res.status(200).json({
               title: 'deleted succesfullyh',
               error: "false"
               });






         });
   }

// exports.cartListing = (req, res) => {

//    var token = req.body.userToken;
//    var decoded = jwt.decode(token, "pickup");
//    var canClaimedReward = "false";
//    var adminTax = helper.adminChargesforUser();
//    var stripeCharge = helper.stripeCharges();
//    var shopDetail = req.body.shopDetail;
//    var dataDetails={};
//    var rewardQuantity=0;
//    var rewardCompleted=0;
//    //console.log(req.body);
//      if(shopDetail)
//      {
//         helper.findShopownerwith(shopDetail, function(cb) {
//        CurrentStoreDetail = cb;
      
//        dataDetails.shopDetail=CurrentStoreDetail
//          // //console.log(CurrentStoreDetail);
//        //console.log('CurrentStoreDetail');

//         });
//      }
   
//    // //console.log(stripeCharge);
//    // //console.log('stripeCharge');
//    // //console.log(adminTax);
//    // //console.log('adminTax');
//    tempOrder
//       .findOne({
//          "userDetail": decoded.user._id
//       })
//       .populate('userDetail', 'cardDetails')
//       .populate('shopDetail', 'status imageurl cafe_name status rating')
//       .exec(function(err, user) {
//          if (err) {
//             return res.status(500).json({
//                title: 'An error occurred',
//                error: "true",
//                detail: err
//             });
//          }

//          if(user)
//          {
//             var tempDataofCart=user.Ordered;
//             var Datatocheck=[]
//             for(i in tempDataofCart)
//             {
//                Datatocheck.push(tempDataofCart[i].itemId)
//             }

//             StoreDetail.find({'Ordered.itemId':{$all:Datatocheck},shopName:user.shopDetail)},(err,presentData)=>{
//                   if (err) {
//                   return res.status(500).json({
//                      title: 'An error occurred',
//                      error: "true",
//                      detail: err
//                   });
//                  }

//                if(!presentData)
//                {
//                   return res.status(200).json({
//                      title: 'One or more item from cart is unavailable at this moment',
//                      error: "true"
//                   });
//                }

               
//                if (shopDetail) {
//                   //console.log(stripeCharge);
//                   //console.log('stripeCharge');
//                   //console.log(adminTax);
//                   //console.log('adminTax');
//                   reward
//                      .find({
//                         "shopDetail": shopDetail
//                      })
//                      .exec(function(err, reward) {
//                         // //console.log("reward>>>>>>>>>>>>>>>>>");
//                         // //console.log(reward);
//                         if (err || reward.length <= 0) {
//                            canClaimedReward = "false";
//                            if (!user) {
//                              //console.log("i m in not user");
//                               return res.status(200).json({
//                                  title: 'No order in cart found for this user',
//                                  error: "true",

//                                  canClaimedReward: canClaimedReward,
//                                  adminTax: adminTax,
//                                  stripeCharge: stripeCharge,
//                                  data:dataDetails,
//                                  rewardQuantity:rewardQuantity,
//                                 rewardCompleted:rewardCompleted

//                               });
//                            }

//                            res.status(200).json({
//                               title: 'Cart item found',
//                               error: "false",
//                               canClaimedReward: canClaimedReward,
//                               data: user,
//                               adminTax: adminTax,
//                               stripeCharge: stripeCharge,
//                               rewardQuantity:rewardQuantity,
//                               rewardCompleted:rewardCompleted

//                            });
//                         } else {
//                                  var userClaimedrewd;
//                                  async.each(reward, function(rew, rew_cb) {
                                      
//                                         var enddateData = new Date(rew.enddate);
//                                         enddateData.setHours(0, 0, 0, 0);
//                                         var startdateData = new Date(rew.startdate);
//                                         startdateData.setHours(0, 0, 0, 0);

//                                         var dateDat = new Date();
//                                         var timezone = moment.tz.guess();
//                                         // //console.log(moment.tz.guess());
//                                         var dec = moment.tz(dateDat, timezone);
//                                         //console.log(dec);
//                                         //console.log('dec');
//                                         var dateDatat = dec.utc().format('YYYY-MM-DD HH:mm:ss');

//                                         var dateData = new Date(dateDatat);
//                                         //console.log(dateData);
//                                         //console.log('dateData');

//                                         //console.log(enddateData);
//                                         //console.log(startdateData);
//                                         //console.log(dateData);
//                                         if ((enddateData >= dateData) && (startdateData <= dateData)) {

//                                             rewardQuantity = rew.quantity;
//                                             usersReward
//                                                 .findOne({
//                                                     "shopDetail": shopDetail,
//                                                     "userDetail": decoded.user._id,
//                                                     "rewardId": rew._id
//                                                 })
//                                                 .exec(function(err, userreward) {

//                                                     if (err || !userreward) {
//                                                         canClaimedReward = "false";

//                                                     } else if (userreward.claimedReward) {
//                                                         canClaimedReward = "true";
//                                                         userClaimedrewd = true;
//                                                         rewardCompleted = userreward.rewardCompleted;

//                                                     } else {
//                                                         canClaimedReward = "false";
//                                                         rewardCompleted = userreward.rewardCompleted;

//                                                     }
//                                                     //console.log("i m in userreward");
//                                                     //console.log(userClaimedrewd);
//                                                     //console.log(canClaimedReward);
//                                                     rew_cb();



//                                                 })
//                                         } else {
//                                             rew_cb();
//                                         }
//                                     }, function(err) {

//                                         //console.log('All files have been processed successfully');
//                                         if (userClaimedrewd) {
//                                             //console.log("i m in userreward loop");
//                                             //console.log(canClaimedReward);

//                                             if (!user) {

//                                                 return res.status(200).json({
//                                                     title: 'No order in cart found for this user',
//                                                     error: "true",
//                                                     canClaimedReward: canClaimedReward,
//                                                     adminTax: adminTax,
//                                                     stripeCharge: stripeCharge,
//                                                     data: dataDetails,
//                                                     rewardQuantity: rewardQuantity,
//                                                     rewardCompleted: rewardCompleted


//                                                 });
//                                             }

//                                             res.status(200).json({
//                                                 title: 'Cart item found',
//                                                 error: "false",
//                                                 canClaimedReward: canClaimedReward,
//                                                 data: user,
//                                                 adminTax: adminTax,
//                                                 stripeCharge: stripeCharge,
//                                                 rewardQuantity: rewardQuantity,
//                                                 rewardCompleted: rewardCompleted

//                                             });
//                                         } else {
//                                             //console.log("loop else>>>>>>>>>>>>");

//                                             if (!user) {

//                                                 return res.status(200).json({
//                                                     title: 'No order in cart found for this user',
//                                                     error: "true",
//                                                     canClaimedReward: canClaimedReward,
//                                                     adminTax: adminTax,
//                                                     stripeCharge: stripeCharge,
//                                                     data: dataDetails,
//                                                     rewardQuantity: rewardQuantity,
//                                                     rewardCompleted: rewardCompleted


//                                                 });
//                                             }

//                                             res.status(200).json({
//                                                 title: 'Cart item found',
//                                                 error: "false",
//                                                 canClaimedReward: canClaimedReward,
//                                                 data: user,
//                                                 adminTax: adminTax,
//                                                 stripeCharge: stripeCharge,
//                                                 rewardQuantity: rewardQuantity,
//                                                 rewardCompleted: rewardCompleted
//                                             });

//                                         }
//                                     })
//                               }


                      

//                      })
//                } else {
//                   //console.log(stripeCharge);
//                   //console.log('stripeCharge');
//                   //console.log(adminTax);
//                   //console.log('adminTax');
//                   //console.log("i m in ek");
//                   //console.log(user);
//                   if (!user) {

//                      return res.status(200).json({
//                         title: 'No order in cart found for this user',
//                         error: "true",
//                         canClaimedReward: canClaimedReward,
//                         adminTax: adminTax,
//                         stripeCharge: stripeCharge,
//                         rewardQuantity:rewardQuantity,
//                         rewardCompleted:rewardCompleted

//                      });
//                   }

//                   reward
//                      .find({
//                         "shopDetail": user.shopDetail
//                      })
//                      .exec(function(err, reward) {
//                         //console.log("reward>>>>>>>>>>>>>>>>>");
//                         //console.log(reward);
//                         if (err || reward.length<=0) {
//                            canClaimedReward = "false";

//                            if (!user) {

//                               return res.status(200).json({
//                                  title: 'No order in cart found for this user',
//                                  error: "true",
//                                  canClaimedReward: canClaimedReward,
//                                  adminTax: adminTax,
//                                  stripeCharge: stripeCharge,
//                                  rewardQuantity:rewardQuantity,
//                                  rewardCompleted:rewardCompleted

//                               });
//                            }

//                            res.status(200).json({
//                               title: 'Cart item found',
//                               error: "false",
//                               canClaimedReward: canClaimedReward,
//                               data: user,
//                               adminTax: adminTax,
//                               stripeCharge: stripeCharge,
//                               rewardQuantity:rewardQuantity,
//                              rewardCompleted:rewardCompleted
//                            });
//                         } else {

//                              var userClaimedrewd;
                         
//                            for(i in reward)
//                            {
//                                 var done = false;
//                                 var enddateData = new Date(reward[i].enddate);
//                                  enddateData.setHours(0, 0, 0, 0);
//                                  var startdateData = new Date(reward[i].startdate);
//                                  startdateData.setHours(0, 0, 0, 0);
//                                  var dateDat = new Date();
//                                  var timezone=moment.tz.guess();
//                                 // //console.log(moment.tz.guess());
//                                  var dec = moment.tz(dateDat,timezone);
//                                  //console.log(dec);
//                                  //console.log('dec');
//                                  var dateDatat = dec.utc().format('YYYY-MM-DD HH:mm:ss');

//                                  var dateData  =new Date(dateDatat) ;
//                                  //console.log(dateData);
//                                  //console.log('dateData');

//                                  //console.log(enddateData);
//                                  //console.log(startdateData);
//                                  //console.log(dateData);

//                                  //console.log(enddateData);
//                                  //console.log(startdateData);
//                                  //console.log(dateData);
//                                  if ((enddateData >= dateData) && (startdateData <= dateData)) {
//                                       rewardQuantity=reward[i].quantity;
//                                         //console.log('userreward before');
                                  
//                                        //console.log('userreward');
//                                     usersReward
//                                        .findOne({
//                                           "shopDetail": user.shopDetail,
//                                           "userDetail": decoded.user._id,
//                                           "rewardId": reward[i]._id
//                                        })
//                                        .exec(function(err, userreward) {
//                                        //console.log(userreward);
//                                           if (err || !userreward) {
//                                              canClaimedReward = "false";
//                                           }
//                                           else if (userreward.claimedReward) {
//                                              canClaimedReward = "true";
//                                              userClaimedrewd=true;
//                                              rewardCompleted=userreward.rewardCompleted;
//                                           } else {
//                                              canClaimedReward = "false";
//                                              rewardCompleted=userreward.rewardCompleted;
//                                           }
//                                            done = true;



//                                        })

//                                  }
//                                  else
//                                  {
//                                      done = true;
//                                  }
//                                require('deasync').loopWhile(function(){return !done;});  
//                            }

//                            if(userClaimedrewd)
//                            {
//                                       if (!user) {

//                                        return res.status(200).json({
//                                           title: 'No order in cart found for this user',
//                                           error: "true",
//                                           canClaimedReward: canClaimedReward,
//                                           adminTax: adminTax,
//                                           stripeCharge: stripeCharge,
//                                           data:dataDetails,
//                                          rewardQuantity:rewardQuantity,
//                                           rewardCompleted:rewardCompleted


//                                        });
//                                     }

//                                     res.status(200).json({
//                                        title: 'Cart item found',
//                                        error: "false",
//                                        canClaimedReward: canClaimedReward,
//                                        data: user,
//                                        adminTax: adminTax,
//                                        stripeCharge: stripeCharge,
//                                        rewardQuantity:rewardQuantity,
//                                        rewardCompleted:rewardCompleted

//                                     });
//                            }
//                            else
//                            {

//                                if (!user) {

//                                        return res.status(200).json({
//                                           title: 'No order in cart found for this user',
//                                           error: "true",
//                                           canClaimedReward: canClaimedReward,
//                                           adminTax: adminTax,
//                                           stripeCharge: stripeCharge,
//                                           data:dataDetails,
//                                           rewardQuantity:rewardQuantity,
//                                           rewardCompleted:rewardCompleted


//                                        });
//                                     }

//                                     res.status(200).json({
//                                        title: 'Cart item found',
//                                        error: "false",
//                                        canClaimedReward: canClaimedReward,
//                                        data: user,
//                                        adminTax: adminTax,
//                                        stripeCharge: stripeCharge,
//                                        rewardQuantity:rewardQuantity,
//                                           rewardCompleted:rewardCompleted
//                                     });

//                            }


//                            // var enddateData = new Date(reward.enddate);
//                            // enddateData.setHours(0, 0, 0, 0);
//                            // var startdateData = new Date(reward.startdate);
//                            // startdateData.setHours(0, 0, 0, 0);

//                            // var dateData = new Date();
//                            // dateData.setHours(0, 0, 0, 0);

//                            // //console.log(enddateData);
//                            // //console.log(startdateData);
//                            // //console.log(dateData);
//                            // if ((enddateData >= dateData) && (startdateData <= dateData)) {

//                            //    usersReward
//                            //       .findOne({
//                            //          "shopDetail": user.shopDetail._id,
//                            //          "userDetail": decoded.user._id,
//                            //          "rewardId": reward._id
//                            //       })
//                            //       .exec(function(err, userreward) {

//                            //          if (err || !userreward) {
//                            //             canClaimedReward = "false";
//                            //          }
//                            //          if (userreward) {
//                            //             if (userreward.claimedReward) {
//                            //                canClaimedReward = "true";
//                            //             } else {
//                            //                canClaimedReward = "false";
//                            //             }
//                            //          } else {
//                            //             canClaimedReward = "false";
//                            //          }

//                            //          if (!user) {

//                            //             return res.status(200).json({
//                            //                title: 'No order in cart found for this user',
//                            //                error: "true",
//                            //                canClaimedReward: canClaimedReward,
//                            //                adminTax: adminTax,
//                            //                stripeCharge: stripeCharge

//                            //             });
//                            //          }

//                            //          res.status(200).json({
//                            //             title: 'Cart item found',
//                            //             error: "false",
//                            //             canClaimedReward: canClaimedReward,
//                            //             data: user,
//                            //             adminTax: adminTax,
//                            //             stripeCharge: stripeCharge
//                            //          });

//                            //       })
//                            // } else {
//                            //    canClaimedReward = "false";
//                            //    if (!user) {

//                            //       return res.status(200).json({
//                            //          title: 'No order in cart found for this user',
//                            //          error: "true",
//                            //          canClaimedReward: canClaimedReward,
//                            //          adminTax: adminTax,
//                            //          stripeCharge: stripeCharge

//                            //       });
//                            //    }

//                            //    res.status(200).json({
//                            //       title: 'Cart item found',
//                            //       error: "false",
//                            //       canClaimedReward: canClaimedReward,
//                            //       data: user,
//                            //       adminTax: adminTax,
//                            //       stripeCharge: stripeCharge
//                            //    });
//                            // }

//                         }

//                      })

                 
//                }

//             });
//          }
      

//       })
// }

exports.cartListing = (req, res) => {
//console.log(req.body);
   var token = req.body.userToken;
   var decoded = jwt.decode(token, "pickup");
   var canClaimedReward = "false";
   var adminTax = helper.adminChargesforUser();
   var stripeCharge = helper.stripeCharges();
   var shopDetail = req.body.shopDetail;
   var dataDetails={};
   var rewardQuantity=0;
   var rewardCompleted=0;
     if(shopDetail)
     {
        helper.findShopownerwith(shopDetail, function(cb) {
       CurrentStoreDetail = cb;
      
       dataDetails.shopDetail=CurrentStoreDetail
         // //console.log(CurrentStoreDetail);
       //console.log('CurrentStoreDetail');

        });
     }
   
   // //console.log(stripeCharge);
   // //console.log('stripeCharge');
   // //console.log(adminTax);
   // //console.log('adminTax');
   tempOrder
      .findOne({
         "userDetail": decoded.user._id
      })
      .populate('userDetail', 'cardDetails')
      .populate('shopDetail', 'status imageurl cafe_name status rating')
      .exec(function(err, user) {
         if (err) {
            return res.status(500).json({
               title: 'An error occurred',
               error: "true",
               detail: err
            });
         }
      
         if (shopDetail) {
            //console.log(stripeCharge);
            //console.log('stripeCharge');
            //console.log(adminTax);
            //console.log('adminTax');
            reward
               .find({
                  "shopDetail": shopDetail
               })
               .exec(function(err, reward) {
                  // //console.log("reward>>>>>>>>>>>>>>>>>");
                  // //console.log(reward);
                  if (err || reward.length <= 0) {
                     canClaimedReward = "false";
                     if (!user) {
                       //console.log("i m in not user");
                        return res.status(200).json({
                           title: 'No order in cart found for this user',
                           error: "true",

                           canClaimedReward: canClaimedReward,
                           adminTax: adminTax,
                           stripeCharge: stripeCharge,
                           data:dataDetails,
                           rewardQuantity:rewardQuantity,
                          rewardCompleted:rewardCompleted

                        });
                     }

                     res.status(200).json({
                        title: 'Cart item found',
                        error: "false",
                        canClaimedReward: canClaimedReward,
                        data: user,
                        adminTax: adminTax,
                        stripeCharge: stripeCharge,
                        rewardQuantity:rewardQuantity,
                        rewardCompleted:rewardCompleted

                     });
                  } else {
                            var userClaimedrewd;
                           async.each(reward, function(rew, rew_cb) {
                                
                                  var enddateData = new Date(rew.enddate);
                                  enddateData.setHours(0, 0, 0, 0);
                                  var startdateData = new Date(rew.startdate);
                                  startdateData.setHours(0, 0, 0, 0);

                                  var dateDat = new Date();
                                  var timezone = moment.tz.guess();
                                  // //console.log(moment.tz.guess());
                                  var dec = moment.tz(dateDat, timezone);
                                  //console.log(dec);
                                  //console.log('dec');
                                  var dateDatat = dec.utc().format('YYYY-MM-DD HH:mm:ss');

                                  var dateData = new Date(dateDatat);
                                  //console.log(dateData);
                                  //console.log('dateData');

                                  //console.log(enddateData);
                                  //console.log(startdateData);
                                  //console.log(dateData);

                                  if ((enddateData >= dateData) && (startdateData <= dateData)) {
                                           //console.log(rew);
                                           //console.log("i m here");
                                      rewardQuantity = rew.quantity;
                                      usersReward
                                          .findOne({
                                              "shopDetail": shopDetail,
                                              "userDetail": decoded.user._id,
                                              "rewardId": rew._id
                                          })
                                          .exec(function(err, userreward) {

                                              if (err || !userreward) {
                                                  canClaimedReward = "false";

                                              } else if (userreward.claimedReward) {
                                                  canClaimedReward = "true";
                                                  userClaimedrewd = true;
                                                  rewardCompleted = userreward.rewardCompleted;

                                              } else {
                                                  canClaimedReward = "false";
                                                  rewardCompleted = userreward.rewardCompleted;

                                              }
                                              //console.log("i m in userreward");
                                              //console.log(userClaimedrewd);
                                              //console.log(canClaimedReward);
                                              rew_cb();



                                          })
                                  } else {
                                      rew_cb();
                                  }
                              }, function(err) {

                                  //console.log('All files have been processed successfully');
                                  if (userClaimedrewd) {
                                      //console.log("i m in userreward loop");
                                      //console.log(canClaimedReward);

                                      if (!user) {

                                          return res.status(200).json({
                                              title: 'No order in cart found for this user',
                                              error: "true",
                                              canClaimedReward: canClaimedReward,
                                              adminTax: adminTax,
                                              stripeCharge: stripeCharge,
                                              data: dataDetails,
                                              rewardQuantity: rewardQuantity,
                                              rewardCompleted: rewardCompleted


                                          });
                                      }

                                      res.status(200).json({
                                          title: 'Cart item found',
                                          error: "false",
                                          canClaimedReward: canClaimedReward,
                                          data: user,
                                          adminTax: adminTax,
                                          stripeCharge: stripeCharge,
                                          rewardQuantity: rewardQuantity,
                                          rewardCompleted: rewardCompleted

                                      });
                                  } else {
                                      //console.log("loop else>>>>>>>>>>>>");

                                      if (!user) {

                                          return res.status(200).json({
                                              title: 'No order in cart found for this user',
                                              error: "true",
                                              canClaimedReward: canClaimedReward,
                                              adminTax: adminTax,
                                              stripeCharge: stripeCharge,
                                              data: dataDetails,
                                              rewardQuantity: rewardQuantity,
                                              rewardCompleted: rewardCompleted


                                          });
                                      }

                                      res.status(200).json({
                                          title: 'Cart item found',
                                          error: "false",
                                          canClaimedReward: canClaimedReward,
                                          data: user,
                                          adminTax: adminTax,
                                          stripeCharge: stripeCharge,
                                          rewardQuantity: rewardQuantity,
                                          rewardCompleted: rewardCompleted
                                      });

                                  }
                              })
                        }


                

               })
         } else {
            //console.log(stripeCharge);
            //console.log('stripeCharge');
            //console.log(adminTax);
            //console.log('adminTax');
            //console.log("i m in ek");
            //console.log(user);
            if (!user) {

               return res.status(200).json({
                  title: 'No order in cart found for this user',
                  error: "true",
                  canClaimedReward: canClaimedReward,
                  adminTax: adminTax,
                  stripeCharge: stripeCharge,
                  rewardQuantity:rewardQuantity,
                  rewardCompleted:rewardCompleted

               });
            }

            reward
               .find({
                  "shopDetail": user.shopDetail
               })
               .exec(function(err, reward) {
                  //console.log("reward>>>>>>>>>>>>>>>>>");
                  //console.log(reward);
                  if (err || reward.length<=0) {
                     canClaimedReward = "false";

                     if (!user) {

                        return res.status(200).json({
                           title: 'No order in cart found for this user',
                           error: "true",
                           canClaimedReward: canClaimedReward,
                           adminTax: adminTax,
                           stripeCharge: stripeCharge,
                           rewardQuantity:rewardQuantity,
                           rewardCompleted:rewardCompleted

                        });
                     }

                     res.status(200).json({
                        title: 'Cart item found',
                        error: "false",
                        canClaimedReward: canClaimedReward,
                        data: user,
                        adminTax: adminTax,
                        stripeCharge: stripeCharge,
                        rewardQuantity:rewardQuantity,
                       rewardCompleted:rewardCompleted
                     });
                  } else {

                       var userClaimedrewd;
                   
                     for(i in reward)
                     {
                          var done = false;
                          var enddateData = new Date(reward[i].enddate);
                           enddateData.setHours(0, 0, 0, 0);
                           var startdateData = new Date(reward[i].startdate);
                           startdateData.setHours(0, 0, 0, 0);
                           var dateDat = new Date();
                           var timezone=moment.tz.guess();
                          // //console.log(moment.tz.guess());
                           var dec = moment.tz(dateDat,timezone);
                           //console.log(dec);
                           //console.log('dec');
                           var dateDatat = dec.utc().format('YYYY-MM-DD HH:mm:ss');

                           var dateData  =new Date(dateDatat) ;
                           //console.log(dateData);
                           //console.log('dateData');

                           //console.log(enddateData);
                           //console.log(startdateData);
                           //console.log(dateData);

                           //console.log(enddateData);
                           //console.log(startdateData);
                           //console.log(dateData);
                           if ((enddateData >= dateData) && (startdateData <= dateData)) {
                                rewardQuantity=reward[i].quantity;
                                  //console.log('userreward before');
                            
                                 //console.log('userreward');
                              usersReward
                                 .findOne({
                                    "shopDetail": user.shopDetail,
                                    "userDetail": decoded.user._id,
                                    "rewardId": reward[i]._id
                                 })
                                 .exec(function(err, userreward) {
                                 //console.log(userreward);
                                    if (err || !userreward) {
                                       canClaimedReward = "false";
                                    }
                                    else if (userreward.claimedReward) {
                                       canClaimedReward = "true";
                                       userClaimedrewd=true;
                                       rewardCompleted=userreward.rewardCompleted;
                                    } else {
                                       canClaimedReward = "false";
                                       rewardCompleted=userreward.rewardCompleted;
                                    }
                                     done = true;



                                 })

                           }
                           else
                           {
                               done = true;
                           }
                         require('deasync').loopWhile(function(){return !done;});  
                     }

                     if(userClaimedrewd)
                     {
                                if (!user) {

                                 return res.status(200).json({
                                    title: 'No order in cart found for this user',
                                    error: "true",
                                    canClaimedReward: canClaimedReward,
                                    adminTax: adminTax,
                                    stripeCharge: stripeCharge,
                                    data:dataDetails,
                                   rewardQuantity:rewardQuantity,
                                    rewardCompleted:rewardCompleted


                                 });
                              }

                              res.status(200).json({
                                 title: 'Cart item found',
                                 error: "false",
                                 canClaimedReward: canClaimedReward,
                                 data: user,
                                 adminTax: adminTax,
                                 stripeCharge: stripeCharge,
                                 rewardQuantity:rewardQuantity,
                                 rewardCompleted:rewardCompleted

                              });
                     }
                     else
                     {

                         if (!user) {

                                 return res.status(200).json({
                                    title: 'No order in cart found for this user',
                                    error: "true",
                                    canClaimedReward: canClaimedReward,
                                    adminTax: adminTax,
                                    stripeCharge: stripeCharge,
                                    data:dataDetails,
                                    rewardQuantity:rewardQuantity,
                                    rewardCompleted:rewardCompleted


                                 });
                              }

                              res.status(200).json({
                                 title: 'Cart item found',
                                 error: "false",
                                 canClaimedReward: canClaimedReward,
                                 data: user,
                                 adminTax: adminTax,
                                 stripeCharge: stripeCharge,
                                 rewardQuantity:rewardQuantity,
                                    rewardCompleted:rewardCompleted
                              });

                     }


                  
                  }

               })

           
         }

      })
}



exports.deleteCartItem = (req, res) => {
   ////console.log("deleteCartItem=============>>>>>>>>>>>>>>>>>>>>>>>>>>>>>");
   var token = req.body.userToken;

   var decoded = jwt.decode(token, "pickup");
   //console.log(decoded);
   var shopDetail = req.body.shopDetail;
   var ItemTodelete = req.body.itemId;
   var itemSize = req.body.itemSize;
   //console.log(itemSize);
   //console.log('itemSize');
   tempOrder
      .findOneAndUpdate({
         "userDetail": decoded.user._id,
         'shopDetail': shopDetail
      }, {
         $pull: {
            'Ordered': {
               "itemId": ObjectId(ItemTodelete),
               "itemSize": itemSize
            }
         }
      }, {
         multi: true
      })
      // .findOne({ "userDetail": decoded.user._id,"shopDetail": shopDetail})
      // .populate('shopDetail','status imageurl cafe_name status')
      .exec(function(err, user) {
         if (err) {
            return res.status(500).json({
               title: 'An error occurred',
               error: "true",
               detail: err
            });
         }
        
})
}

exports.deleteItemFromCart = (req, res) => {
   //console.log("deleteCartItem=============>>>>>>>>>>>>>>>>>>>>>>>>>>>>>");
   var token = req.body.userToken;
   var decoded = jwt.decode(token, "pickup");
   var ItemTodelete = req.body.itemId;
   var itemSize = req.body.itemSize;
   //console.log(itemSize);
   //console.log('itemSize');

   tempOrder
      .update({
         "userDetail": decoded.user._id,
         "shopDetail": req.body.shopDetail
      }, {
         "$pull": {
            "Ordered": {
               "itemId": ItemTodelete,
               "itemSize": itemSize
            }
         }
      })
      .exec(function(err, data) {
         if (err) {
            return res.status(500).json({
               title: 'An error occurred',
               error: "true",
               detail: err
            });
         }
         //console.log(data);
         if (!data) {
            return res.status(200).json({
               title: 'No order in cart found for this user',
               error: "true"

            });
         }

          tempOrder
        .findOne({
         "userDetail": decoded.user._id,
         'shopDetail': req.body.shopDetail
          })
              .exec(function(err, shop) {
               if (err) {
                  return res.status(500).json({
                     title: 'An error occurred',
                     error: "true",
                     detail: err
                  });
               }
               if(!shop)
               {
                  return res.status(200).json({
                     title: 'Cart item deleted',
                     error: "false",
                     data: data
                  });
               }

               var orderLength=shop.Ordered.length;
               if(orderLength >=1)
               {
                  return res.status(200).json({
                     title: 'Cart item deleted',
                     error: "false",
                     data: data
                  });
               }

               tempOrder
              .findOneAndRemove({
               "userDetail": decoded.user._id,
               'shopDetail': req.body.shopDetail
                })
                .exec(function(err, shopdata) {

                       if (err) {
                           return res.status(500).json({
                              title: 'An error occurred',
                              error: "true",
                              detail: err
                           });
                        }
                     return res.status(200).json({
                     title: 'Cart item deleted',
                     error: "false",
                     data: data
                   });

                  })
         })


         // return res.status(200).json({
         //    title: 'Cart item deleted',
         //    error: "false"

         // });

      })
}

exports.orderHistory = (req, res) => {

   var token = req.body.userToken;
   var decoded = jwt.decode(token, "pickup");
   //console.log(decoded);
   var initialData = 10;
   var requestData = parseInt(req.body.requestData);
   var skip_D = parseInt(req.body.skipData);
   var limitData = initialData * requestData;
   var skipingData = 0;
   if (requestData > 1) {
      var skipingData = skip_D * initialData;
   }
   Orders
      .find({
         "userDetail": decoded.user._id
      })
      .limit(limitData)
      .skip(skipingData)
      .sort({
         'updatedAt': -1
      })
      .populate('shopDetail', 'status imageurl cafe_name  rating')
      .exec(function(err, order) {
         if (err) {
            return res.status(500).json({
               title: 'An error occurred',
               error: "true",
               detail: err
            });
         }

         if (order.length <= 0) {
            return res.status(200).json({
               title: 'No order found for this user',
               error: "true"

            });
         }

         return res.status(200).json({
            title: 'User found ',
            error: "false",
            data: order
         });

      })
}
// exports.orderHistory = (req, res) => {

//    var token = req.body.userToken;
//    var decoded = jwt.decode(token, "pickup");
//    //console.log(decoded);
//    Orders
//       .find({
//          "userDetail": decoded.user._id
//       })
//       .populate('shopDetail', 'status imageurl cafe_name  rating')
//       .exec(function(err, order) {
//          if (err) {
//             return res.status(500).json({
//                title: 'An error occurred',
//                error: "true",
//                detail: err
//             });
//          }

//          if (order.length <= 0) {
//             return res.status(200).json({
//                title: 'No order found for this user',
//                error: "true"

//             });
//          }

//          return res.status(200).json({
//             title: 'User found ',
//             error: "false",
//             data: order
//          });

//       })
// }