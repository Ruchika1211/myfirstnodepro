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
//var ObjectId = mongoose.Types.ObjectId;
var IterateObject = require("iterate-object");
var usersReward = require('../models/userReward');
var reward = require('../models/reward');
var stripe = require('stripe')(process.env.stripeKey);
var serverKey = process.env.serverKey;
var smtpTransport = nodemailer.createTransport({
    service: "gmail",
    host: "smtp.gmail.com",
    auth: {
        user: process.env.mail_username,
        pass: process.env.mail_password
   }
   })
var helper = require('../services/helper.js');
var mongoose = require('mongoose');
var ObjectId = mongoose.Types.ObjectId;
var fs = require('fs');

var distance = (cafeLat, cafeLong, userLat, userLong) => {
   var dist = geodist({
      lat: cafeLat,
      lon: cafeLong
   }, {
      lat: userLat,
      lon: userLong
   }, {
      limit: 50
   });
   return dist;
}

// exports.cafelisting = (req, res) => {

//     var token = req.body.userToken;
//     var nearbyCafe = [];
//     var decoded = jwt.decode(token, "pickup");
//     var unreadNotification=0;
//     var claimedReward=0;
//     var initialData = 10;
//     var requestData = parseInt(req.body.requestData);
//     var skip_D = parseInt(req.body.skipData);
//     var limitData = initialData * requestData;
//     var skipingData = 0;
//     if (requestData > 1) {
//         var skipingData = skip_D * initialData;
//     }
//     helper.findUser(decoded.user._id,(data)=>{
//         if(data=="err" || data=="no user Found"){
//             return res.status(500).json({
//                 title: 'no user found logout',
//                 error: "true",

//             });

//         }
//             var lastseenofuser=data.lastseen;
//             notification.count({"createdAt":{$gte:lastseenofuser}},function (err, count) {
//                    if (!count || err) {
//                        unreadNotification=0;
//                     }

//                     unreadNotification=count;
//                     usersReward.count({"userDetail":decoded.user._id,"claimedReward":true},function (err, countreward) {
//                           if (!count || err) {
//                            claimedReward=0;
//                           }
//                           else
//                           {
//                             claimedReward=countreward;
//                           }

//                              Stores
//                             .find({})
//                              .limit(limitData)
//                              .skip(skipingData)
//                             .exec(function(err, cafes) {
//                             // {skip:skipingData,limit:limitData}, (err, cafes) => {

//                                     if (err) {
//                                         return res.status(500).json({
//                                             title: 'An error occurred',
//                                             error: "true",
//                                             detail: err
//                                         });
//                                     }
//                                     if (cafes.length <= 0) {
//                                         return res.status(200).json({
//                                             title: 'No cafe found',
//                                             error: "true",
//                                             unreadNotification:unreadNotification,
//                                              claimedReward:claimedReward

//                                         });
//                                     }
//                                     // console.log(cafes);
//                                     // console.log('cafes');
//                                     for (i in cafes) {
//                                         var Lat = cafes[i].position.latitude;
//                                         var Long = cafes[i].position.longitude;
//                                         // console.log(Lat);
//                                         //console.log(Long);
//                                         var TotalDistance = distance(Lat, Long, req.body.lat, req.body.lng);
//                                         //console.log(TotalDistance);
//                                         if (TotalDistance) {
//                                             nearbyCafe.push(cafes[i]);
//                                         }

//                                     }
//                                     res.status(200).json({
//                                         title: 'Listing of cafe ',
//                                         error: "false",
//                                         cafes: nearbyCafe,
//                                         unreadNotification:unreadNotification,
//                                         claimedReward:claimedReward

//                                     });
//                                 });
//                               })

//             });

//     });

// }

var checkIfPresent = function(value, list) {
  var data={};
        data.present=false;
    for (i = 0; i < list.length; i++) {

        var cor = list[i].shopDetail;
        console.log(cor);
        console.log(value);
      
      
                if (ObjectId(cor).equals(ObjectId(value))) {

                      var enddateData = new Date(list[i].enddate);
                                enddateData.setHours(0, 0, 0, 0);
                                var startdateData = new Date(list[i].startdate);
                                startdateData.setHours(0, 0, 0, 0);

                                var dateDat = new Date();
                                var timezone=moment.tz.guess();
                                // console.log(moment.tz.guess());
                                var dec = moment.tz(dateDat,timezone);
                                console.log(dec);
                                console.log('dec');
                                var dateDatat = dec.utc().format('YYYY-MM-DD HH:mm:ss');

                                var dateData  =new Date(dateDatat) ;
                                console.log(dateData);
                                console.log('dateData');
                                dateData.setHours(0, 0, 0, 0);

                                console.log(enddateData.getTime());
                                console.log(startdateData.getTime());
                                console.log(dateData.getTime());
                                console.log((enddateData.getTime() >= dateData.getTime()) && (startdateData.getTime() <= dateData.getTime()));
                      if (((enddateData.getTime() >= dateData.getTime()) && (startdateData.getTime() <= dateData.getTime())))
                       {
                         data.index=i;
                              data.present=true;
                         return data;
                       }
            }

     }

    return data;
}

exports.cafelisting = (req, res) => {

   var token = req.body.userToken;
   var nearbyCafe = [];
   var decoded = jwt.decode(token, "pickup");
   var unreadNotification = 0;
   var claimedReward = 0;
   var initialData = 10;
   var requestData = parseInt(req.body.requestData);
   var skip_D = parseInt(req.body.skipData);
   var limitData = initialData * requestData;
   var skipingData = 0;
   if (requestData > 1) {
      var skipingData = skip_D * initialData;
   }

   console.log(req.body);
   console.log("req.body")
   helper.findUser(decoded.user._id, (data) => {
      if (data == "err" || data == "no user Found") {
         return res.status(500).json({
            title: 'no user found logout',
            error: "true",

         });

      }
      var lastseenofuser =data.lastseen;
      notification.count({
         "createdAt": {
            $gte: lastseenofuser
         },  "userDetail": decoded.user._id
      }, function(err, count) {
         if (!count || err) {
            unreadNotification = 0;
         }
         else
         {
          unreadNotification = count;
         }

      usersReward
      .find({"userDetail": decoded.user._id,"claimedReward": true})
      .populate('rewardId')
      .exec(function(err, rerwarddata){
             console.log(rerwarddata);
              console.log('countreward');
              var dataReward=rerwarddata;
              console.log(dataReward.length);
               console.log('dataReward.length');
            if(err)
            {
              claimedReward = 0;
            }
            else if(dataReward.length>0)
            {
                   console.log(dataReward.length);
               console.log('else if');
                  var countreward=0;
                   for(i in dataReward)
                   {
                     if(dataReward[i].rewardId)
                     { 
                      var dateDat = new Date();
                      var timezone=moment.tz.guess();
                      // console.log(moment.tz.guess());
                      var dec = moment.tz(dateDat,timezone);
                      console.log(dec);
                      console.log('dec');
                      var dateDatat = dec.utc().format('YYYY-MM-DD HH:mm:ss');

                      var compareWithDate  =new Date(dateDatat) ;
                      console.log(compareWithDate);
                      console.log('compareWithDate');
                      compareWithDate.setHours(0, 0, 0, 0);
                      // var end = new Date();

                      // var compareWithDate = new Date(end);
                      // compareWithDate.setHours(0, 0, 0, 0);

                      var comparetoDate = new Date(rerwarddata[i].rewardId.enddate);
                      comparetoDate.setHours(0, 0, 0, 0);
                      console.log(comparetoDate);
                        console.log(compareWithDate);
                      if(compareWithDate <= comparetoDate)
                      {
                        countreward=countreward+1;
                      }
                     }

                      
                   }
                      

                   claimedReward = countreward;
                
            }
            else
            {
              console.log('else ');
              claimedReward = 0;
            }
         
            

            StoreDetail
               .find({})
               .limit(limitData)
               .skip(skipingData)
               .populate('shopName', 'status imageurl cafe_name bankDetails position isblocked')
               .exec(function(err, cafes) {
                  // {skip:skipingData,limit:limitData}, (err, cafes) => {
                  var storeDatawithQuan = [];

                  if (err) {
                     return res.status(500).json({
                        title: 'An error occurred',
                        error: "true",
                        detail: err
                     });
                  }
                  if (cafes.length <= 0) {
                     return res.status(200).json({
                        title: 'No cafe found',
                        error: "true",
                        unreadNotification: unreadNotification,
                        claimedReward: claimedReward

                     });
                  }
                  // console.log(cafes);
                  // console.log('cafes');
                  for (i in cafes) {
                     var Lat = cafes[i].shopName.position.latitude;
                     var Long = cafes[i].shopName.position.longitude;
                     console.log(Lat);
                     console.log(Long);
                      console.log(req.body.lat);
                       console.log(req.body.lng);
                     var TotalDistance = distance(Lat, Long, req.body.lat, req.body.lng);
                     console.log(TotalDistance);
                     if (TotalDistance && cafes[i].shopName.bankDetails.length > 0 && cafes[i].shopName.isblocked == 0) {
                        nearbyCafe.push(cafes[i]);
                     }

                  }

                  console.log(nearbyCafe);
                    console.log('nearbyCafe');

                  reward
                     .find({})
                     .exec(function(err, rewards) {

                        usersReward
                           .find({
                              "userDetail": decoded.user._id
                           })
                           .exec(function(err, userrewards) {
                              for (i in nearbyCafe) {

                                 var cafeDetail = nearbyCafe[i];
                                 console.log(cafeDetail.shopName._id);
                                 console.log('cafeDetail.shopName._id');
                                 var DataPresent = checkIfPresent(cafeDetail.shopName._id, rewards);
                                 var tempstoreDatawithQuan = {};
                                 console.log(DataPresent);
                                 console.log('DataPresent');
                                 if (DataPresent.present) {
                                    tempstoreDatawithQuan._id = cafeDetail.shopName._id;
                                    tempstoreDatawithQuan.cafe_name = cafeDetail.shopName.cafe_name;
                                    tempstoreDatawithQuan.status = cafeDetail.shopName.status;
                                    tempstoreDatawithQuan.imageurl = cafeDetail.shopName.imageurl;
                                    tempstoreDatawithQuan.rewardQuan = rewards[DataPresent.index].quantity;
                                    tempstoreDatawithQuan.rewardId = rewards[DataPresent.index]._id;
                                    storeDatawithQuan.push(tempstoreDatawithQuan);
                                 } else {
                                    tempstoreDatawithQuan._id = cafeDetail.shopName._id;
                                    tempstoreDatawithQuan.cafe_name = cafeDetail.shopName.cafe_name;
                                    tempstoreDatawithQuan.status = cafeDetail.shopName.status;
                                    tempstoreDatawithQuan.imageurl = cafeDetail.shopName.imageurl;
                                    tempstoreDatawithQuan.rewardQuan = 0;
                                    storeDatawithQuan.push(tempstoreDatawithQuan);
                                 }

                              }
                                  // console.log(storeDatawithQuan);
                                  // console.log('storeDatawithQuan');
                              for (j in storeDatawithQuan) {
                                 //var DataPresent = checkIfPresent(cafeDetail.shopDetail._id,rewards); 
                                 var tempDataofquan = storeDatawithQuan[j];
                                 if (tempDataofquan.rewardId) {
                                    console.log("i m in if");
                                    for (i in userrewards) {

                                       var tempUserReward = userrewards[i];
                                        console.log((ObjectId(tempDataofquan._id).equals(ObjectId(tempUserReward.shopDetail))));
                                        console.log((ObjectId(tempDataofquan.rewardId).equals(ObjectId(tempUserReward.rewardId))));
                                         console.log(((ObjectId(tempDataofquan._id).equals(ObjectId(tempUserReward.shopDetail))) && (ObjectId(tempDataofquan.rewardId).equals(ObjectId(tempUserReward.rewardId)))));
                                         console.log('userrewards');
                                       if (((ObjectId(tempDataofquan._id).equals(ObjectId(tempUserReward.shopDetail))) && (ObjectId(tempDataofquan.rewardId).equals(ObjectId(tempUserReward.rewardId))))) {
                                           console.log(tempUserReward.rewardCompleted);
                                            console.log('tempUserReward.rewardCompleted');
                                          storeDatawithQuan[j].rewardCompleted = tempUserReward.rewardCompleted;
                                       }
                                       
                                    }

                                 } else {
                                    console.log("i m in if else");
                                    storeDatawithQuan[j].rewardCompleted = 0;
                                 }

                              }


                              res.status(200).json({
                                 title: 'Listing of cafe ',
                                 error: "false",
                                 cafes: storeDatawithQuan,
                                 unreadNotification: unreadNotification,
                                 claimedReward: claimedReward

                              });

                           })

                     });

               });
         })

      })

   });

}

exports.menulisting = (req, res) => {

   var token = req.body.userToken;
   var decoded = jwt.decode(token, "pickup");

   var toFind = req.body.sid;

   StoreDetail.findOne({
      "shopName": toFind
   }).populate('shopName','status imageurl cafe_name bankDetails position isblocked')
   .exec(function(err, cafes) {
      if (err) {
         return res.status(500).json({
            title: 'An error occurred',
            error: "true",
            detail: err
         });
      }
      if (!cafes) {
         return res.status(200).json({
            title: 'No menu found',
            error: "true"

         });
      }
      var keysObject = Object.keys(cafes.category);
      //console.log(cafes.category);
      var totalSize = keysObject.length;
      if (totalSize <= 0) {
         return res.status(200).json({
            title: 'No menu found',
            error: "true"

         });
      }
      var itemData = [];
      IterateObject(cafes.category, function(value, name) {

         var catData = {
            itemCategory: name,
            itemData: value
         }
         itemData.push(catData);
      })
      var totalPrice = 0;
      var totalCount = 0;
      tempOrder.findOne({
         "userDetail": decoded.user._id
      }).exec(function(err, order) {

         if (err) {
            return res.status(500).json({
               title: 'An error occurred',
               error: "true",
               detail: err
            });
         }

         if (!order) {
            return res.status(200).json({
               title: 'Listing of cafe ',
               error: "false",
               cafes: cafes.shopName,
               totalPrice: 0,
               totalCount: 0,
               data: itemData

            });
         }

         //totalPrice=order.totalPrice;
         totalCount = order.Ordered.length;
         for (i = 0; i < totalCount; i++) {
            var dataOfOrder = order.Ordered[i];
            totalPrice = totalPrice + parseFloat(dataOfOrder.itemQuantity) * parseFloat(dataOfOrder.itemPrice)
         }
         console.log(totalPrice);
         console.log('totalPrice');
         res.status(200).json({
            title: 'Listing of cafe ',
            error: "false",
            cafes: cafes.shopName,
            totalPrice: totalPrice,
            totalCount: totalCount,
            data: itemData

         });

      })

   });

}

exports.coffeeShopLogin = (req, res) => {
   console.log(req.body);
   Stores.findOne({
      'storeId': req.body.storeId
   },{'bankDetails':0, 'incomesourceDetail':0 ,'totalamounttotransfer':0 ,'bankAccountId':0}, (err, coffeeShop) => {
      console.log(coffeeShop);
      if (err) {
         return res.status(500).json({
            title: 'An error occurred',
            error: "true",
            detail: err
         });
      }
      if (!coffeeShop) {
         return res.status(200).json({
            title: 'No such shop found',
            error: "true"
         });
      }

       if (parseInt(coffeeShop.isDelete) == 1) {
         return res.status(200).json({
            title: 'You are blocked.Please contact admin',
            error: "true"
         });
      }

      if (parseInt(coffeeShop.isblocked) == 1) {
         return res.status(200).json({
            title: 'You are blocked.Please contact admin',
            error: "true"
         });
      }

      console.log('req.body.storePass');
      console.log(req.body.storePass);
      console.log(bcrypt.compareSync(req.body.storePass, coffeeShop.storePass));
      if (!bcrypt.compareSync(req.body.storePass, coffeeShop.storePass)) {
         return res.status(200).json({
            title: 'Invalid password',
            error: "true"
         });
      }
      var data = {
         storeId: coffeeShop.storeId,
         storePass: coffeeShop.storePass,
         id: coffeeShop._id,
      }

      var device_id = req.body.deviceToken;
      var valueexist = helper.checkIfduplicates(coffeeShop.deviceToken, device_id);
      if (valueexist) {
         console.log('do nothing');

         var token = jwt.sign({
            data: data
         }, 'secret', {
            expiresIn: 7200
         });
         res.status(200).json({
            title: 'Login Succesful',
            message: "Shop found",
            error: "false",
            shop: coffeeShop,
            token: token

         });
      } else {

         coffeeShop.deviceToken.push(device_id);
         coffeeShop.save(function(err) {
            if (err) {
               return res.status(500).json({
                  title: 'An error occurred',
                  error: "true",
                  detail: err
               });
            }

            var token = jwt.sign({
               data: data
            }, 'secret', {
               expiresIn: 7200
            });
            res.status(200).json({
               title: 'Login Succesful',
               message: "Shop found",
               error: "false",
               shop: coffeeShop,
               token: token

            });

         });

      }

   });

}

exports.coffeeShopLogout = (req, res) => {

   var token = req.body.userToken;
   console.log(token);
   var decoded = jwt.decode(token, "pickup");
   console.log(decoded);
   console.log("decoded");
   // if (!decoded) {
   //    return res.status(200).json({
   //       title: 'Security issue',
   //       error: "true",
   //       detail: "User token mismatched"
   //    });
   // }
 
   Stores.findOne({
      _id: decoded.data.id
   }, (err, coffeeShop) => {

      if (err) {
         return res.status(500).json({
            title: 'An error occurred',
            error: "true",
            detail: err
         });
      }
      if (!coffeeShop) {
         return res.status(200).json({
            title: 'No such shop found',
            error: "true"
         });
      }

      var arrayofToken = coffeeShop.deviceToken;
      console.log(arrayofToken);
      console.log('arrayofToken');
      console.log(req.body)
      var index = arrayofToken.indexOf(req.body.deviceToken);
      if (index > -1) {
        console.log('found');
         coffeeShop.deviceToken.splice(index, 1);
      }
      coffeeShop.isLoggedIn = false;
      coffeeShop.save((err, data) => {

         if (err) {
            return res.status(500).json({
               title: 'An error occurred',
               error: "true",
               detail: err
            });
         }
         res.status(200).json({
            message: 'Logout succesfull',
            error: "false"

         });

      })

   });

}

exports.coffeeShopEditProfile = (req, res) => {

   var token = req.body.userToken;
   console.log(req.body);
   console.log('req.body>>>>>>>>>>>>.');
   var decoded = jwt.decode(token, "pickup");
   console.log(decoded);
   console.log('decoded');
   var password=req.body.password;
    var imageUpload=req.body.imageUpload;

   // jwt.verify(token,"pickup", function (err, decoded){

   Stores.findOne({
      "_id": decoded.data.id
   },{'bankDetails':0, 'incomesourceDetail':0 ,'totalamounttotransfer':0 ,'bankAccountId':0}, (err, user) => {

      if (err) {
         return res.status(500).json({
            title: 'An error occurred',
            error: "true",
            detail: err
         });
      }
      if (!user) {
         return res.status(200).json({
            title: 'user not found',
            error: "true",

         });
      }

      if (parseInt(user.isDelete) == 1) {
         return res.status(200).json({
            title: 'You are blocked.Please contact admin',
            error: "true"
         });
      }

      if (parseInt(user.isblocked) == 1) {
         return res.status(200).json({
            title: 'You are blocked.Please contact admin',
            error: "true"
         });
      }

      user.cafe_name = req.body.cafe_name;
      user.storeId = req.body.storeId;
        
         if(imageUpload == "true")
        {
            user.imageurl = req.body.imageUrl;
        }
        else
        {
           user.imageUrl = 'noImage';
        }

            if(password)
            {
              user.storePass=bcrypt.hashSync(password, bcrypt.genSaltSync(10)); 
            }

      // user.status = req.body.status;
      // user.rating = req.body.rating;

      // user.position.addressline = req.body.addressline;
      // user.position.postal_code = req.body.postal_code;
      // user.position.city = req.body.city;
      // user.position.state = req.body.state;
      // user.position.latitude = req.body.latitude;
      // user.position.longitude = req.body.longitude;
      //user.imageurl = helper.url() + '/stores/' + decoded.data.id;
      user.save((err, user) => {

         if (err) {
            return res.status(500).json({
               title: 'An error occurred',
               error: "true",
               detail: err
            });
         }
         res.status(200).json({
            title: 'user updated Succesfully',
            error: "false",

            data: user
         });

      });

   });

}

exports.coffeeShopForgotPassword = (req, res) => {

   var token = randomstring.generate({
      length: 7,
      charset: 'numeric'
   });
   Stores.findOne({
      storeId: req.body.storeId
   }, (err, coffeeShop) => {

      if (err) {
         return res.status(500).json({
            title: 'An error occurred',
            error: "true",
            detail: err
         });
      }
      if (!coffeeShop) {
         return res.status(200).json({
            title: 'user not found',
            error: "true",
            detail: err
         });
      }

       if (parseInt(coffeeShop.isDelete) == 1) {
         return res.status(200).json({
            title: 'You are blocked.Please contact admin',
            error: "true"
         });
      }

      if (parseInt(coffeeShop.isblocked) == 1) {
         return res.status(200).json({
            title: 'You are blocked.Please contact admin',
            error: "true"
         });
      }
      coffeeShop.resetPasswordToken = token;
      coffeeShop.resetPasswordExpires = Date.now() + 3600000; // 1 hour
      coffeeShop.save(function(err) {
         if (err) {
            return res.status(500).json({
               title: 'An error occurred while updating',
               error: "true",
               detail: err
            });
         }

         var mailOptions = {
            // to: coffeeShop.storeId,
            to:coffeeShop.storeId,
            from: helper.adminMailFrom(),
            subject: 'Pickcup Password Reset',
            text: 'You are receiving this because you (or someone else) have requested the reset of the password for your account.\n\n' +
               'Your token to reset your password is:\n\n' +
               token + '\n\n' +
               'If you did not request this, please ignore this email and your password will remain unchanged.\n'
         };

         smtpTransport.sendMail(mailOptions, function(err) {
            if (err) {
               return res.status(500).json({
                  title: 'An error occurred while sending email',
                  error: "true",
                  detail: err
               });
            }

            res.status(200).json({
               title: 'RESET PASSSWORD',
               error: "false",
               message: 'Reset email sent'
            });
         });
      });
   });

}

exports.coffeeShopResetPassword = (req, res) => {
   console.log(req.body);
   Stores.findOne({
      resetPasswordToken: req.body.token,
      resetPasswordExpires: {
         $gt: Date.now()
      }
   }, (err, user) => {

      if (err) {
         return res.status(500).json({
            title: 'An error occurred',
            error: "true",
            detail: err
         });
      }
      if (!user) {
         return res.status(200).json({
            title: 'user not found',
            error: "true"
         });
      }
      user.storePass = req.body.password;
      user.resetPasswordToken = undefined;
      user.resetPasswordExpires = undefined;
      user.save(function(err) {
         if (err) {
            return res.status(500).json({
               title: 'An error occurred',
               error: "true",
               detail: err
            });
         }
         res.status(200).json({
            title: 'Password Reset Succesful',
            error: "false",
            message: 'Succesfully set your password.'
         });

      });

   });

}

exports.coffeeShopSetStatus = (req, res) => {
   var token = req.body.userToken;
   console.log(token);
   var decoded = jwt.decode(token, "pickup");
   console.log(decoded);
   console.log("decoded");
   Stores.findOne({
      _id: decoded.data.id
   }, (err, coffeeShop) => {

      if (err) {
         return res.status(500).json({
            title: 'An error occurred',
            error: "true",
            detail: err
         });
      }
      if (coffeeShop.length <= 0) {
         return res.status(200).json({
            title: ' Shop not found',
            error: "true"
         });
      }

      coffeeShop.status = req.body.status;
      coffeeShop.save(function(err) {
         if (err) {
            return res.status(500).json({
               title: 'An error occurred',
               error: "true",
               detail: err
            });
         }
         res.status(200).json({
            title: 'Status saved succesfully',
            error: "false",

            message: req.body.status
         })
      });
   });

}
// exports.editBankdetails = (req, res) => {
//    var token = req.headers.usertoken;
//    console.log(token);
//    var decoded = jwt.decode(token, "pickup");
//    console.log(decoded);
//    console.log("decoded");

//     // var add= results[0].formatted_address ;
//     //                 var  value=add.split(",");

//     //                 count=value.length;
//     //                 country=value[count-1];
//     //                 state=value[count-2];
//     //                 city=value[count-3];
//     //                 alert("city name is: " + city);
                
//    Stores.findOne({
//       _id: decoded.data.id
//    },{'incomesourceDetail':0 ,'totalamounttotransfer':0}, (err, coffeeShop) => {

//       if (err) {
//          return res.status(500).json({
//             title: 'An error occurred',
//             error: "true",
//             detail: err
//          });
//       }
//       if (!coffeeShop) {
//          return res.status(200).json({
//             title: ' Shop not found',
//             error: "true"
//          });
//       }

//       if (coffeeShop.bankAccountId) {
//          stripe.accounts.update(coffeeShop.bankAccountId, {
//             email: coffeeShop.storeId
//          }, function(err, account) {

//             if (err) {
//                return res.status(500).json({
//                   title: 'stripe updating account error',
//                   error: "true",
//                   detail: err
//                });
//             }

//             if (!account) {
//                return res.status(500).json({
//                   title: 'stripe updating account error no account found',
//                   error: "true"
//                });
//             }

//             // for(i in coffeeShop.bankDetails)
//             // {
//             //  var bank_detail=coffeeShop.bankDetails[i];
//             //   if(bank_detail.bankId == req.body)
//             // }
//             stripe.customers.retrieveSource(
//                account.id,
//                coffeeShop.bankDetails[0].bankId,
//                function(err, external_account) {
//                   if (err) {
//                      return res.status(500).json({
//                         title: 'stripe updating account error',
//                         error: "true",
//                         detail: err
//                      });
//                   }

//                   if (!external_account) {
//                      return res.status(200).json({
//                         title: 'stripe updating account error no account found',
//                         error: "false"
//                      });
//                   }

//                   res.status(200).json({
//                      title: 'user with stripe account found',
//                      error: "false"
//                   });

//                });

//          })
//       } else {
//          console.log(req.body.file);
//          console.log('file');
//          var documentPath = './uploads/stripedoc/' + coffeeShop._id + ".png";
//          var fp = fs.readFileSync(documentPath);
//          stripe.fileUploads.create({
//             purpose: 'identity_document',
//             file: {
//                data: fp,
//                name: 'file.jpg',
//                type: 'application/octet-stream'
//             }
//          }, function(err, fileUpload) {

//             if (err) {
//                return res.status(500).json({
//                   title: 'stripe file upload account error',
//                   error: "true",
//                   detail: err
//                });
//             }

//             var ipadress = req.headers['x-forwarded-for'] || req.connection.remoteAddress || req.socket.remoteAddress || req.connection.socket.remoteAddress;
//             ipadress.replace(/^.*:/, '');
//             console.log('ipadress');
//             console.log(ipadress);
//             //var documentPath='./uploads/stores/'+coffeeShop._id+".png";
//             console.log('fileUpload');
//             console.log(documentPath);
//             console.log(coffeeShop.position.addressline);
//             console.log(coffeeShop.position.city);
//             console.log(coffeeShop.position.postal_code);
//             console.log(coffeeShop);
//             stripe.accounts.create({
//                type: 'custom',
//                country: 'GB',
//                email: coffeeShop.storeId,
//                payout_schedule: {
               
//                  "interval": "daily"
//                },
//                payout_statement_descriptor: coffeeShop.cafe_name,

//                tos_acceptance: {
//                   ip: ipadress,
//                   date: Math.floor(Date.now() / 1000),
//                },
//                legal_entity: {
//                   address: {
//                      line1: coffeeShop.position.addressline,
//                      city: coffeeShop.position.city,
//                      postal_code: coffeeShop.position.postal_code,
//                      state: "Uk"
//                   },
//                   dob: {
//                      day: req.body.day,

//                      month: req.body.month,

//                      year: req.body.year

//                   },
//                   first_name: req.body.first_name,
//                   last_name: req.body.last_name,
            
//                   // verification: {
//                   //    document: fileUpload.id
//                   // }

//                }
//             }, function(err, account) {

//                if (err) {
//                   return res.status(500).json({
//                      title: 'stripe creating account error',
//                      error: "true",
//                      detail: err
//                   });
//                }

//                if (!account) {
//                   return res.status(500).json({
//                      title: 'stripe creating account error',
//                      error: "true"
//                   });
//                }
//                console.log(account);
//                console.log('account');
//                // coffeeShop.bankAccountId =account.id
//                stripe.accounts.createExternalAccount(
//                   account.id, {
//                      external_account: req.body.bankToken
//                   },
//                   function(err, bank_account) {
//                      if (err) {
//                         return res.status(500).json({
//                            title: 'stripe creating external_account error',
//                            error: "true",
//                            detail: err
//                         });
//                      }

//                      if (!bank_account) {
//                         return res.status(500).json({
//                            title: 'stripe creating external_account error',
//                            error: "true"
//                         });
//                      }

//                      console.log(bank_account);
//                      console.log('bank_account');

//                      coffeeShop.bankAccountId = bank_account.account;
//                      coffeeShop.bankDetails = {
//                         bankId: bank_account.id,
//                         bankNumber: bank_account.last4,
//                         accountholderName: bank_account.account_holder_name,
//                         isPrimary: bank_account.default_for_currency,
//                         status: bank_account.status,
//                         fingerprint: bank_account.fingerprint
//                      }

//                      coffeeShop.save(function(err,coffeeShopData) {
//                         if (err) {
//                            return res.status(500).json({
//                               title: 'An error occurred',
//                               error: "true",
//                               detail: err
//                            });
//                         }

//                         res.status(200).json({
//                            title: 'bank detail updated succesfully',
//                            error: "false",
//                            data:coffeeShopData

//                         })
//                      });
//                      // asynchronously called
//                   });

//             });
//          });

//       }

//    });

// }
exports.editBankdetails = (req, res) => {
   var token = req.headers.usertoken;
   console.log(token);
   var decoded = jwt.decode(token, "pickup");
   console.log(decoded);
   console.log("decoded");

   
                
   Stores.findOne({
      _id: decoded.data.id
   },{'incomesourceDetail':0 ,'totalamounttotransfer':0}, (err, coffeeShop) => {

      if (err) {
         return res.status(500).json({
            title: 'An error occurred',
            error: "true",
            detail: err
         });
      }
      if (!coffeeShop) {
         return res.status(200).json({
            title: ' Shop not found',
            error: "true"
         });
      }

       
         console.log(req.body.file);
         console.log('file');
         var documentPath = './uploads/stripedoc/' + coffeeShop._id + ".jpg";
         var fp = fs.readFileSync(documentPath);
         stripe.fileUploads.create({
            purpose: 'identity_document',
            file: {
               data: fp,
               name: 'file.jpg',
               type: 'application/octet-stream'
            }
         }, function(err, fileUpload) {

            if (err) {
               return res.status(500).json({
                  title: 'stripe file upload account error',
                  error: "true",
                  detail: err
               });
            } 
            console.log(fileUpload);
            console.log('fileUpload');

            res.status(200).json({
                  title: 'document uploaded succesfully',
                  error: "false"
               });

           
       });



})

}
exports.coffeeShopupdateAccountdetailsWh=(req,res)=>{

    console.log("i m in webhook ??????????????????////////////////");
  Stores.findOne({
      bankAccountId: req.body.account
   },{'incomesourceDetail':0 ,'totalamounttotransfer':0}, (err, coffeeShop) => {

     if(err)
     {
      console.log("err webhook" + err)
     }
     if(!coffeeShop)
     {
      console.log("err webhook no shop found" )
     }

      
                    // "display this string to user"
                   

     // coffeeShop.bankAccountId = req.body.data.object.id;
     
     
    
     
   
    


                     console.log(req.body.data.object);
                     console.log('bank_account');

                     if(req.body.data.object.verification.disabled_reason){
                       coffeeShop.accountdisabledReason=req.body.data.object.verification.disabled_reason;
                     }
                     else
                     {
                       coffeeShop.accountdisabledReason='';
                     }

                     if(req.body.data.object.verification.due_by){
                        coffeeShop.accountdueby=req.body.data.object.verification.due_by;
                     }
                     else
                     {
                        coffeeShop.accountdueby='';
                     }


                     if(req.body.data.object.verification.document){
                      coffeeShop.accountdocument=req.body.data.object.legal_entity.verification.document;
                     }
                     else
                     {
                        coffeeShop.accountdocument='';
                     }

                     if(req.body.data.object.verification.fields_needed){
                       
                       coffeeShop.accountdetails_code=req.body.data.object.verification.fields_needed;
                     }
                     else
                     {
                        coffeeShop.accountdetails_code='';
                     }

                     if(req.body.data.object.legal_entity.verification.status){
                        

                        coffeeShop.accountStatus=req.body.data.object.legal_entity.verification.status;
                     }
                     else
                     {
                        coffeeShop.accountStatus='';
                     }

                     if(req.body.data.object.legal_entity.verification.details){
                        coffeeShop.accountdetails=req.body.data.object.legal_entity.verification.details;
                     }
                     else
                     {
                        coffeeShop.accountdetails='';
                     }

  
      var dataMessg=req.body.data.object.legal_entity.verification.status;
      coffeeShop.save(function(err,coffeeShopData) {
          if (err) {
             console.log("err webhook" + err)
          }


               if(dataMessg == 'new')
                         { 
                            var mailOptions = {
                                      to: coffeeShop.storeId,
                                      from:helper.adminMailFrom(),
                                      subject: 'Pickcup Account details',
                                      text: 'Thank you for submitting your form your Verfication is under processed.' 
                                          
                                  };
                            helper.sendemail(mailOptions,(data)=>{
                                var msg="Thank you for submitting your bank details. Your account verification is under process.";
                                helper.sendNotification(coffeeShopData.deviceToken,'bankStatus', msg, (cb) => {
                                  console.log("message send");
                                  res.send(200);
                                },coffeeShopData.accountStatus);
                            })
                          
                         }
                         else if(dataMessg == 'verification_failed'){

                           var mailOptions = {
                                      to: coffeeShop.storeId,
                                      from: helper.adminMailFrom(),
                                      subject: 'Pickcup Account details',
                                      text: 'Verification failed \n\n'+
                                            'Your account verification has been failed due to some security features.Please contact admin@pickcup.in for further details' 
                                          
                                  };
                            helper.sendemail(mailOptions,(data)=>{
                                var msg="Your account verification has been failed.";
                              helper.sendNotification(coffeeShopData.deviceToken,'bankStatus', msg, (cb) => {
                                  console.log("message send");
                                  res.send(200);
                                },coffeeShopData.accountStatus);
                            })

                         }
                          else if(dataMessg == 'errored'){

                              var mailOptions = {
                                      to: coffeeShop.storeId,
                                      from: helper.adminMailFrom(),
                                      subject: 'Pickcup Account details',
                                      text: 'Verification failed \n\n'+
                                            'Your account verification has been failed due to some security features.Please contact admin@pickcup.in for further details' 
                                          
                                  };
                            helper.sendemail(mailOptions,(data)=>{
                                var msg="Your account verification has been failed.";
                               helper.sendNotification(coffeeShopData.deviceToken,'bankStatus', msg, (cb) => {
                                  console.log("message send");
                                  res.send(200);
                                },coffeeShopData.accountStatus);
                            })

                         }
                         else if(dataMessg == 'validated'){
                          console.log("hbxhxgh");
                         }
                         else
                         {

                              var mailOptions = {
                                      to:helper.adminMailFrom(),
                                      from: 'ruchika.s@infiny.in',
                                      subject: 'Pickcup Account details',
                                      text: 'Verification Succesful \n\n'+
                                            'Your account has been succesfully verified' 
                                          
                                  };
                            helper.sendemail(mailOptions,(data)=>{
                                var msg="Your account has been succesfully verified";
                                helper.sendNotification(coffeeShopData.deviceToken,'bankStatus', msg, (cb) => {
                                  console.log("message send");
                                  res.send(200);
                                },coffeeShopData.accountStatus);
                              })

                         }
         
         console.log("success webhook")
        
       });



   })
}


exports.coffeeShopaddBankdetails = (req, res) => {
  console.log("i m in api ??????????????????////////////////");
   var token = req.body.userToken;
   console.log(token);
   var decoded = jwt.decode(token, "pickup");
   console.log(decoded);
   console.log("decoded");
    console.log(req.body);
   console.log("req.body>>>>>>>>");
   var addressdata=req.body.address;
    var add= addressdata;
    var  value=add.split(",");

    var  count=value.length;
    var addressLine=value[count-count];
    var country=value[count-1];
    var state=value[count-2];
    var postCode=state.split(" ");
    postCode = postCode.filter(Boolean);
    var stateLen=postCode.length;
    console.log(postCode);
    console.log(postCode.length);
    console.log('postCode');
    if(postCode.length > 2)
    { 
       var stat=postCode[0];
       var temp='';
       for(i=1;i<postCode.length;i++)
       {
         temp= temp + '' +postCode[i];
       }
       temp.trim();
       console.log(temp);
       console.log('temp');
       var postal_code=temp;

    }
    else
    {
        console.log("i m in else");
        var postal_code=postCode[stateLen-1];
         var stat=postCode[stateLen-2];
    }
  
    var city=value[count-3];

    console.log(country);
    console.log(stat);
    console.log(city);
    console.log(postal_code);
    console.log(value);
    console.log("address");
  country=country.trim();
                
   Stores.findOne({
      _id: decoded.data.id
   },{'incomesourceDetail':0 ,'totalamounttotransfer':0}, (err, coffeeShop) => {

      if (err) {
         return res.status(500).json({
            title: 'An error occurred',
            error: "true",
            detail: err
         });
      }
      if (!coffeeShop) {
         return res.status(200).json({
            title: ' Shop not found',
            error: "true"
         });
      }
      
       // console.log(req.body.file);
       // console.log('file');
       var documentPath = './uploads/stripedoc/' + coffeeShop._id + ".jpg";
       var fp = fs.readFileSync(documentPath);
       stripe.fileUploads.create({
          purpose: 'identity_document',
          file: {
             data: fp,
             name: 'file.jpg',
             type: 'application/octet-stream'
          }
       }, function(err, fileUpload) {

          if (err) {
             return res.status(200).json({
                title: 'stripe file upload account error',
                error: "true",
                detail: err
             });
          }

           var ipadress = req.headers['x-forwarded-for'] || req.connection.remoteAddress || req.socket.remoteAddress || req.connection.socket.remoteAddress;
            ipadress.replace(/^.*:/, '');
            console.log('ipadress');
            console.log(ipadress);
            console.log(fileUpload.id)
         
            stripe.accounts.create({
               type: 'custom',
               country:'GB',
               email: coffeeShop.storeId,
               payout_schedule: {
               
                 "interval": "daily"
               },
               payout_statement_descriptor: coffeeShop.cafe_name,

               tos_acceptance: {
                  ip: ipadress,
                  date: Math.floor(Date.now() / 1000),
               },
               legal_entity: {
                  address: {
                     line1:addressLine,
                     city: city,
                     postal_code:postal_code,
                     state: stat
                  },
                  dob: {
                     day: req.body.day,

                     month: req.body.month,

                     year: req.body.year

                  },
                  first_name: req.body.first_name,
                  last_name: req.body.last_name,
                  type:req.body.acctType,
                  verification: {
                     document: fileUpload.id
                  }

               }
            }, function(err, account) {

               if (err) {
                  return res.status(200).json({
                     title: 'stripe creating account error',
                     error: "true",
                     detail: err
                  });
               }

               if (!account) {
                  return res.status(200).json({
                     title: 'stripe creating account error',
                     error: "true"
                  });
               }
               console.log(account);
               console.log('account');
               // coffeeShop.bankAccountId =account.id
               stripe.accounts.createExternalAccount(
                  account.id, {
                     external_account: req.body.bankToken
                  },
                  function(err, bank_account) {
                     if (err) {
                        return res.status(200).json({
                           title: 'stripe creating external_account error',
                           error: "true",
                           detail: err
                        });
                     }

                     if (!bank_account) {
                        return res.status(200).json({
                           title: 'stripe creating external_account error',
                           error: "true"
                        });
                     }

                     console.log(bank_account);
                     console.log('bank_account');

                     if(account.verification.disabled_reason){
                       coffeeShop.accountdisabledReason=account.verification.disabled_reason;
                     }
                     else
                     {
                       coffeeShop.accountdisabledReason='';
                     }

                     if(account.verification.due_by){
                       coffeeShop.accountdueby=account.verification.due_by;
                     }
                     else
                     {
                        coffeeShop.accountdueby='';
                     }


                     if(account.verification.document){
                       coffeeShop.accountdocument=account.verification.document;
                     }
                     else
                     {
                        coffeeShop.accountdocument='';
                     }

                     if(account.verification.fields_needed){
                       
                        coffeeShop.accountdetails_code=account.verification.fields_needed;
                     }
                     else
                     {
                        coffeeShop.accountdetails_code='';
                     }

                     if(bank_account.status){
                        coffeeShop.accountStatus=bank_account.status;
                     }
                     else
                     {
                        coffeeShop.accountStatus='';
                     }

                     if(account.legal_entity.verification.details){
                       coffeeShop.accountdetails=account.legal_entity.verification.details;
                     }
                     else
                     {
                        coffeeShop.accountdetails='';
                     }

                    coffeeShop.bankAccountId = bank_account.account;
                    
                   
                    
                   
                    coffeeShop.position.addressline = addressLine;
                    coffeeShop.position.postal_code = postal_code;
                    coffeeShop.position.city = city;
                    coffeeShop.position.state = state;
                    coffeeShop.position.latitude = req.body.latitude;
                    coffeeShop.position.longitude = req.body.longitude;
                     coffeeShop.bankDetails = {
                        bankId: bank_account.id,
                        bankNumber: bank_account.last4,
                        typeOfaccount: bank_account.account_holder_type,
                        accountholderName: bank_account.account_holder_name,
                        isPrimary: bank_account.default_for_currency,
                         fingerprint: bank_account.fingerprint,
                        routingNumber: bank_account.routing_number
                     }

                     coffeeShop.save(function(err,coffeeShopData) {
                        if (err) {
                           return res.status(500).json({
                              title: 'An error occurred',
                              error: "true",
                              detail: err
                           });
                        }
                         if(bank_account.status == 'new')
                         { 
                            var mailOptions = {
                                      to: coffeeShop.storeId,
                                      from: 'ruchika.s@infiny.in',
                                      subject: 'Pickcup Account details',
                                      text: 'Thank you for submitting your bank details.\n\n Your account verification is under process.' 
                                          
                                  };
                            helper.sendemail(mailOptions,(data)=>{
                                var msg="Thank you for submitting your bank details. Your account verification is under process.";
                               helper.sendNotification(coffeeShopData.deviceToken,'bankStatus', msg, (cb) => {
                                  console.log("message send");
                                },bank_account.status);
                            })
                          
                         }
                         else if(bank_account.status == 'verification_failed'){

                           var mailOptions = {
                                      to: coffeeShop.storeId,
                                      from: 'ruchika.s@infiny.in',
                                      subject: 'Pickcup Account details',
                                      text: 'Verification failed \n\n'+
                                            'Your account verification has been failed due to some security features.Please contact admin@pickcup.in for further details' 
                                          
                                  };
                            helper.sendemail(mailOptions,(data)=>{
                                var msg="Your account verification has been failed.";
                                helper.sendNotification(coffeeShopData.deviceToken,'bankStatus', msg, (cb) => {
                                  console.log("message send");
                                },bank_account.status);
                            })

                         }
                          else if(bank_account.status == 'errored'){

                              var mailOptions = {
                                      to: coffeeShop.storeId,
                                      from: 'ruchika.s@infiny.in',
                                      subject: 'Pickcup Account details',
                                      text: 'Verification failed \n\n'+
                                            'Your account verification has been failed due to some security features.Please contact admin@pickcup.in for further details' 
                                          
                                  };
                            helper.sendemail(mailOptions,(data)=>{
                                var msg="Your account verification has been failed.";
                                helper.sendNotification(coffeeShopData.deviceToken,'bankStatus', msg, (cb) => {
                                  console.log("message send");
                                },bank_account.status);
                            })

                         }
                         else if(bank_account.status == 'validated'){
                          console.log("hbxhxgh");
                         }
                         else
                         {

                              var mailOptions = {
                                      to: coffeeShop.storeId,
                                      from: 'ruchika.s@infiny.in',
                                      subject: 'Pickcup Account details',
                                      text: 'Verification Succesful \n\n'+
                                            'Your account has been succesfully verified/' 
                                          
                                  };
                            helper.sendemail(mailOptions,(data)=>{
                                var msg="Your account has been succesfully verified.";
                                helper.sendNotification(coffeeShopData.deviceToken,'bankStatus', msg, (cb) => {
                                  console.log("message send");
                                },bank_account.status);
                            })

                         }

                         // if(account.verification.fields_needed == "external_account,legal_entity.verification.document")
                         // {
                         //  var dataRequired="Please upload a verfication document";
                         // }

                        res.status(200).json({
                           title: 'bank detail updated succesfully',
                           error: "false",
                           data:coffeeShopData

                        })
                     });
                     // asynchronously called
                  });

            });
        












        })
      
   });

}


exports.deleteBankaccount = (req, res) => {
   var token = req.body.userToken;
   console.log(token);
   var decoded = jwt.decode(token, "pickup");
   console.log(decoded);
   console.log("decoded");
   Stores.findOne({
      _id: decoded.data.id
   }, (err, coffeeShop) => {

      if (err) {
         return res.status(500).json({
            title: 'An error occurred',
            error: "true",
            detail: err
         });
      }
      if (!coffeeShop) {
         return res.status(200).json({
            title: ' Shop not found',
            error: "true"
         });
      }

      if (coffeeShop.bankAccountId) {
         console.log(coffeeShop.bankAccountId);
         var deletedata = coffeeShop.bankAccountId.trim();
         stripe.customers.deleteSource(
            deletedata,
            coffeeShop.bankDetails[0].bankId,
            function(err, confirmation) {

               if (err) {
                  return res.status(500).json({
                     title: 'stripe error account error',
                     error: "true",
                     detail: err
                  });
               }

               if (!confirmation) {
                  return res.status(200).json({
                     title: 'stripe error   no account found',
                     error: "true"
                  });
               }

               coffeeShop.bankAccountId = " ";
               coffeeShop.bankDetails = [];
               coffeeShop.save(function(err) {
                  if (err) {
                     return res.status(500).json({
                        title: 'An error occurred while saving',
                        error: "true",
                        detail: err
                     });
                  }

                  res.status(200).json({
                     title: 'deleted succesfully',
                     error: "false"

                  })
               });
            })
      } else {
         res.status(200).json({
            title: 'user donot have a bank account',
            error: "false"
         });
      }

   });

}

exports.updateOwnerBalance = (ownerDetail, userdetail, totalPrice, transId, balancetransId,costP) => {
  console.log("ypdate>>>>>>>>>>>>>>>>")
   console.log(totalPrice);
   console.log('totalPrice');
   var costPrice = costP;
   var adminPrice =helper.amountTotransfertoAdmin(totalPrice);
   console.log(costPrice);
   console.log('costPrice');
   var payadmincharge = false;
   Stores
      .findOne({
         "_id": ownerDetail
      })
      .exec(function(err, store) {
         if (err) {
            //var previoustrans = store.totalamounttotransfer;
            //store.totalamounttotransfer = previoustrans;
            payadmincharge = false;
            var userdata = {
               userDetails: userdetail,
               totalAmount: parseFloat(totalPrice),
               afterDeducAmount:  parseFloat(costPrice),
                adminPrice:adminPrice,
               datetransfer: helper.findCurrentDateinutc(),
               transId: transId,
               balancetransId: balancetransId,
               remarks: "failed due to err:" + err.message
            }
         }
         if (!store) {
            var previoustrans = store.totalamounttotransfer;
           // store.totalamounttotransfer = previoustrans + costPrice;
            payadmincharge = false;
            var userdata = {
               userDetails: userdetail,
               totalAmount: parseFloat(totalPrice),
               afterDeducAmount:  parseFloat(costPrice),
               adminPrice:adminPrice,
               transId: transId,
               balancetransId: balancetransId,
               datetransfer: helper.findCurrentDateinutc(),
               remarks: "failed due to err:No such store found"
            }
         } else {
            var previoustrans = store.totalamounttotransfer;
           // store.totalamounttotransfer = previoustrans + costPrice;
            payadmincharge = true;
            var userdata = {
               userDetails: userdetail,
               totalAmount: parseFloat(totalPrice),
               afterDeducAmount:  parseFloat(costPrice),
                adminPrice:adminPrice,
               transId: transId,
               balancetransId: balancetransId,
               datetransfer:helper.findCurrentDateinutc(),
               remarks: "Success"
            }
         }

         store.incomesourceDetail.push(userdata);
         store.save(function(err) {
            if (err) {
               console.log(" err");
               console.log( err);

            }


         });

      });

}