var express = require('express');
var router = express.Router();
var User =  require('../../module/user');
var Cafe =  require('../../module/cafe');
var Stripe =  require('../../module/stripe');
var Noti = require('../../module/notification');
var CoffeeShop = require('../../module/coffeeShop');
var Order = require('../../module/order');
var jwt = require('jsonwebtoken');
var multer = require("multer");
var fs = require('fs');
var moment = require('moment-timezone');
var cronJob = require('cron').CronJob;
var timeZone=moment.tz.guess();




var job = new cronJob({
  //cronTime: '05 * * * * *',
cronTime: '0 0 23 * * *',
  onTick: function() {
    console.log("listing ");
     Order.rewardcron();
  // Runs everyday
  // at exactly 12:00:00 AM.

  },
  start: false,
  timeZone: timeZone
});

console.log('job1 status', job.running);

job.start();

// console.log('job1 status', job.running);

var jobv = new cronJob({
  //cronTime: '05 * * * * *',
cronTime: '0 0 23 * * *',
  onTick: function() {
    console.log("ending reward ");
     Order.userEndingRewardscron();
  // Runs everyday
  // at exactly 12:00:00 AM.

  },
  start: false,
  timeZone: timeZone
});

console.log('job1 status', jobv.running);

jobv.start();

console.log('job1 status', job.running);

var transferOnSeven = new cronJob({
  //cronTime: '05 * * * * *',
cronTime: '0 30 10 7 * *',
  onTick: function() {
    console.log("ending reward ");
      Stripe.checkIfavailablebalance();
  // Runs everyday
  // at exactly 12:00:00 AM.

  },
  start: false,
  timeZone:timeZone
});

transferOnSeven.start();

var transferOnTwentySix = new cronJob({
  //cronTime: '05 * * * * *',
cronTime: '00 30 10 26 * *',
  onTick: function() {
    console.log("ending reward ");
       Stripe.checkIfavailablebalance();
  // Runs everyday
  // at exactly 12:00:00 AM.

  },
  start: false,
  timeZone: timeZone
});

transferOnTwentySix.start();




// var imgName='user._id' + '.png';
//                 // var fs = require("fs");
//               //var image = req.body.userImage;
//                var dir =  require('path').basename(__dirname) + '/upload/';
//  var storage = multer.diskStorage({
//                         destination: function (req, file, cb) {
//                           cb(null, dir);
//                           console.log(file);
//                         },
//                         filename: function (req, file, cb) {
//                           cb(null, imgName);
//                           console.log(file);
//                         }
//                       })
// var upload = multer({ storage: storage });
//var upload = multer({ dest: 'uploads/' })



router.get('/test', function (req, res) {

  Stripe.checkIfavailablebalance(req,res);
//  fs.stat('uploads/stores/59afb7f2f2c2c60f5f30ba9b.png', function(err, stat) {
//     if(err == null) {
//         console.log('File exists');
//     } else if(err.code == 'ENOENT') {
//         // file does not exist
//         fs.writeFile('log.txt', 'Some log\n');
//     } else {
//         console.log('Some other error: ', err.code);
//     }
// });


});


router.post('/signup', function (req, res) {

     User.signup(req,res);
});

router.post('/signin', function (req, res, next) {
  console.log("req.body signin");
  console.log(req.body)
     User.signin(req,res);
});

router.post('/forgotPassword', function (req, res, next) {
  console.log("req.body forgotPassword");
  console.log(req.body)
     User.forgotPassword(req,res);
});

router.post('/resetPassword', function (req, res, next) {

     User.resetPassword(req,res);
});
router.post('/verifyresetPasswordToken', function (req, res, next) {

     User.verifyresetPasswordToken(req,res);
});

router.post('/coffeeShopLogin', function (req, res, next) {

     Cafe.coffeeShopLogin(req,res);
});

router.post('/coffeeShopForgotPassword', function (req, res, next) {

      Cafe.coffeeShopForgotPassword(req,res);
});

router.post('/coffeeShopResetPassword', function (req, res, next) {

      Cafe.coffeeShopResetPassword(req,res);
});


// router.post('/editProfile', function (req, res, next) {
     
//      User.editProfile(req,res);
// });



// THis function is used to check if token is present or not if not it will through error
// router.use(function (req, res, next) {

//   var token=req.body.userToken;
//   if(!token)
//   {
//     return res.status(500).json({
//                   title: 'User not verified security issue',
                  
//               });
//   }

//     next();


// });






router.post('/editAddCardDetails', function (req, res, next) {

      User.editAddCardDetails(req,res);
});

router.post('/logoutUser', function (req, res, next) {

      User.logoutUser(req,res);
});




router.post('/removeUserProfileImage', function (req, res, next) {

      User.removeUserProfileImage(req,res);
});


router.post('/editProfile', function (req, res, next) {
 
    var token=req.headers.usertoken;
    var imageexist=req.headers.imageexist;
    console.log(imageexist);
            console.log('imageexist>>>>>>>>>>>>>>>');
    var decoded = jwt.decode(token, "pickup");
    console.log(decoded);
    var Imagename=decoded.user._id + '.jpg';
    var tempImagename=decoded.user._id ;
    
    var direc = './uploads';
     var dattat=fs.existsSync(direc);
     console.log("uuuhughfuh");
     console.log(dattat);
     var  dir = './uploads/users';
    if (!fs.existsSync(direc)){
        fs.mkdirSync(direc,function(err,datta){
          if(err){
            console.log("errrrr");
          }
          else
          {
           
            if (!fs.existsSync(dir)){
                fs.mkdirSync(dir,function(err,datta){
                  if(err){
                    console.log("errrrr");
                  }
                  else
                  {
                    console.log(datta);
                  }
                });
            }
          }
        });
    }
    else
    {
        if (!fs.existsSync(dir)){
                fs.mkdirSync(dir,function(err,datta){
                  if(err){
                    console.log("errrrr");
                  }
                  else
                  {
                    console.log(datta);
                  }
                });
            }
    }
    console.log(Imagename);
     console.log(tempImagename);
    var storage = multer.diskStorage({
    destination: function(req, file, callback) {
      callback(null,dir);
    },
    filename: function(req, file, callback) {
      console.log(file);
      callback(null, Imagename);
    }
     });
   

    var upload = multer({
    storage: storage
    }).single('files')
    upload(req, res, function(err) {
      //allData.body=req.body;
      if(err)
      {
        console.log(err);
        console.log('err');
        User.editProfile(req,res);
      }
      else{
            console.log(imageexist);
            console.log('imageexist');
            console.log('allData');
             if(imageexist == "true")
             {
               console.log("if");
              var thumb = require('node-thumbnail').thumb;
                 User.editProfile(req,res);
              thumb({
                     prefix: '',
                     suffix: '_small',
                     source: dir + '/'+Imagename,
                     destination: './uploads/users',
                     width: 100,
                     overwrite: true,   
                     concurrency: 4,
                      basename:tempImagename
                    }).then(function()
                         {
                            console.log('Success  width: 100');
                               //User.editProfile(req,res);
                        }).catch(function(e) {
                          console.log('Error  width: 100', e.toString());
                        });

                 thumb({
                               prefix: '',
                               suffix: '_medium',
                               source: dir + '/'+Imagename,
                               destination: './uploads/users',
                               width: 200,
                               overwrite: true,   
                               concurrency: 4,
                                basename:tempImagename
                              }).then(function() {
                                console.log('Success  width: 200');
                             
                              }).catch(function(e) {
                                console.log('Error  width: 200', e.toString());
                              });


             }
             else
             {console.log("ifgftf");
                 User.editProfile(req,res);
             }
              
         //console.log(allData);
         
       
        
      }
     
    })


});


router.post('/coffeeShopEditProfile', function (req, res, next) {
 
   var token=req.headers.usertoken;
    var decoded = jwt.decode(token, "pickup");
    var Imagename=decoded.data.id;
     var imageexist=req.headers.imageexist;
    var tempdir = './uploads';
    //var thumb= './uploads/stores/storeThumb';
     var dattat=fs.existsSync(dir);
       var dir = './uploads/stores';
       console.log(decoded);
          console.log(req.files);
       console.log('decoded');
    if (!fs.existsSync(tempdir)){
        fs.mkdirSync(tempdir,function(err,datta){
          if(err){
            console.log("errrrr");
          }
          else
          {
               if (!fs.existsSync(dir)){
                fs.mkdirSync(dir,function(err,datta){
               if(err){
                console.log("errrrr");
               }
               else
               {
                console.log("created folder succesfully");
               }
             })
              }
        }
        });
    }
    else
    {
       if (!fs.existsSync(dir)){
                fs.mkdirSync(dir,function(err,datta){
                   if(err){
                    console.log("errrrr");
                   }
                   else
                   {
                    console.log("created folder succesfully");
                   }
                })
              }
    }
    var storage = multer.diskStorage({
    destination: function(req, file, callback) {
      callback(null,dir);
    },
    filename: function(req, file, callback) {
      console.log(file);
      callback(null, Imagename+ '.jpg');
    }
  });
     console.log('if of img');
    var upload = multer({
    storage: storage
    }).single('files')
    upload(req, res, function(err) {
      if(err)
      {
        console.log(err);
        console.log('err');
      }
      else{
         console.log(imageexist);
            console.log('imageexist');
            console.log('allData');

          
         var src='./uploads/stores/'+Imagename+ '.jpg';
         var thumb = require('node-thumbnail').thumb;
         if(imageexist == "true")
         {
          thumb({
             prefix: '',
             suffix: '_small',
             source:src,
             destination: dir,
             width: 200,
              overwrite: true,
             concurrency: 4,
             basename:Imagename,
             logger: function(message) {
                console.log(message);
              }
            }).then(function() {
                 console.log('Success  width: 200');
               }).catch(function(e) {
                  console.log('Error  width: 200', e.toString());
                });

          thumb({
               prefix: '',
               suffix: '_medium',
               source: src,
               destination:dir,
               width: 300,
                overwrite: true,
               concurrency: 4,
               basename:Imagename,
              }).then(function() {
                    console.log('Success  width: 300');
                  
                  }).catch(function(e) {
                    console.log('Error  width: 300', e.toString());
              });
            Cafe.coffeeShopEditProfile(req,res);


             thumb({
                     prefix: '',
                     suffix: '_large',
                     source: src,
                     destination:dir,
                     width: 400,
                      overwrite: true,
                     concurrency: 4,
                      basename:Imagename,
                    }).then(function() {
                          console.log('Success  width: 400');
                         
                        }).catch(function(e) {
                          console.log('Error  width: 400', e.toString());
                        });
               
         }
         else
         {
           Cafe.coffeeShopEditProfile(req,res);
         }
         
        
      }
     
    })
});

router.post('/updateUserlastseen', function (req, res, next) {

      User.updateUserlastseen(req,res);
});



router.post('/cafelisting', function (req, res, next) {

     Cafe.cafelisting(req,res);
});
router.post('/menulisting', function (req, res, next) {

     Cafe.menulisting(req,res);
});


router.post('/coffeeShopLogout', function (req, res, next) {

     Cafe.coffeeShopLogout(req,res);
});

router.get('/', function (req, res) {

     //Order.rewardcron();
     Stripe.transferingTobankaccount(req,res);
});




router.post('/coffeeShopSetStatus', function (req, res, next) {

      Cafe.coffeeShopSetStatus(req,res);
});

router.post('/notificationListing', function (req, res, next) {

      Cafe.notificationListing(req,res);
});


// router.post('/coffeeShopaddBankdetails', function (req, res, next) {

     
// });

router.post('/coffeeShopaddBankdetails', function (req, res, next) {
     var token=req.headers.usertoken;
     console.log(token);
    var decoded = jwt.decode(token, "pickup");
    var Imagename=decoded.data.id;
    
    var tempdir = './uploads';
    //var thumb= './uploads/stores/storeThumb';
     //var dattat=fs.existsSync(dir);
       var dir = './uploads/stripedoc';
    if (!fs.existsSync(tempdir)){

        fs.mkdirSync(tempdir,function(err,datta){
          if(err){
            console.log("errrrr");
          }
          else
          {
               if (!fs.existsSync(dir)){
                fs.mkdirSync(dir,function(err,datta){
               if(err){
                console.log("errrrr");
               }
               else
               {
                console.log("created folder succesfully");
               }
             })
              }
        }
        });
    }
    else{
       if (!fs.existsSync(dir)){
                fs.mkdirSync(dir,function(err,datta){
                   if(err){
                    console.log("errrrr");
                   }
                   else
                   {
                    console.log("created folder succesfully");
                   }
                })
              }
    }
    var storage = multer.diskStorage({
    destination: function(req, file, callback) {
      callback(null,dir);
    },
    filename: function(req, file, callback) {
      console.log(file);
      callback(null, Imagename+ '.jpg');
    }
  });
     console.log('if of img');
    var upload = multer({
    storage: storage
    }).single('files')
          upload(req, res, function(err) {
            if(err)
            {
              console.log(err);
              console.log('err');
            }
            else{
              Cafe.coffeeShopaddBankdetails(req,res);
             }
            
      });
  });

router.post('/deleteBankaccount', function (req, res, next) {

      Cafe.deleteBankaccount(req,res);
});

router.post('/ListNotification', function (req, res, next) {

      Noti.ListNotification(req,res);
});
router.post('/createNoti', function (req, res, next) {

      Noti.createNoti(req,res);
});

router.post('/coffeeShopGetMenu', function (req, res, next) {

      CoffeeShop.coffeeShopGetMenu(req,res);
});


router.post('/coffeeShopAddCategory', function (req, res, next) {

      CoffeeShop.coffeeShopAddCategory(req,res);
});

router.post('/coffeeShopaddMenu', function (req, res, next) {

      CoffeeShop.coffeeShopaddMenu(req,res);
});

router.post('/getRewards', function (req, res, next) {

      CoffeeShop.getRewards(req,res);
});

router.post('/coffeeShopeditMenu', function (req, res, next) {

      CoffeeShop.coffeeShopeditMenu(req,res);
});

router.post('/coffeeShopdeleteMenu', function (req, res, next) {

      CoffeeShop.coffeeShopdeleteMenu(req,res);
});

router.post('/coffeeShopsetrewardLogic', function (req, res, next) {

      CoffeeShop.coffeeShopsetrewardLogic(req,res);
});

router.post('/coffeeShopgetRewardData', function (req, res, next) {

      CoffeeShop.coffeeShopgetRewardData(req,res);
});

router.post('/coffeeShopshowRewardListing', function (req, res, next) {

      CoffeeShop.coffeeShopshowRewardListing(req,res);
});

router.post('/coffeeShopShowOrderListing', function (req, res, next) {

      CoffeeShop.coffeeShopShowOrderListing(req,res);
});

router.post('/coffeeShopMoveOrderToReadyState', function (req, res, next) {

      CoffeeShop.coffeeShopMoveOrderToReadyState(req,res);
});

router.post('/coffeeShopVerifyOtp', function (req, res, next) {

      CoffeeShop.coffeeShopVerifyOtp(req,res);
});


// router.post('/coffeeShopMoveOrderToCompletedState', function (req, res, next) {
//
//       CoffeeShop.coffeeShopMoveOrderToCompletedState(req,res);
// });

router.post('/userPrepareOrder', function (req, res, next) {

      CoffeeShop.userPrepareOrder(req,res);
});
router.post('/createOrder', function (req, res, next) {
   console.log('req.body');
    console.log(req.body);
      Order.createOrder(req,res);
});

router.post('/orderListing', function (req, res, next) {

      Order.orderListing(req,res);
});

router.post('/orderHistory', function (req, res, next) {

      Order.orderHistory(req,res);
});

router.post('/deleteCart', function (req, res, next) {

      Order.deleteCart(req,res);
});

router.post('/checkIfSameOrderCart', function (req, res, next) {

      Order.checkIfSameOrderCart(req,res);
});


router.post('/addItemToCart', function (req, res, next) {

      Order.addItemToCart(req,res);
});


router.post('/findpartiOrder', function (req, res, next) {

      Order.findpartiOrder(req,res);
});

router.post('/cartListing', function (req, res, next) {

      Order.cartListing(req,res);
});

router.post('/addItemToCartwithOkclick', function (req, res, next) {

      Order.addItemToCartwithOkclick(req,res);
});

router.post('/coffeeShopShowCompletedOrderListing', function (req, res, next) {

      CoffeeShop.coffeeShopShowCompletedOrderListing(req,res);
});

router.post('/coffeeShopdeleteReward', function (req, res, next) {

      CoffeeShop.coffeeShopdeleteReward(req,res);
});

router.post('/deleteCartItem', function (req, res, next) {

      Order.deleteCartItem(req,res);
});

router.post('/claimedReward', function (req, res, next) {

      Order.claimedReward(req,res);
});

router.post('/deleteItemFromCart', function (req, res, next) {

      Order.deleteItemFromCart(req,res);
});

router.post('/payCreateUserCards', function (req, res, next) {

      Stripe.payCreateUserCards(req,res);
});

router.post('/payMakePrimary', function (req, res, next) {

      Stripe.payMakePrimary(req,res);
});
router.post('/cardListing', function (req, res, next) {

      Stripe.cardListing(req,res);
});
router.post('/payCharges', function (req, res, next) {

      Stripe.payCharges(req,res);
});


router.post('/deletecard', function (req, res, next) {

      Stripe.deletecard(req,res);
});

router.post('/transferingTobankaccount', function (req, res, next) {

      Stripe.transferingTobankaccount(req,res);
});

router.post('/stripeWebhookbankaccountupdate', function (req, res, next) {
   console.log(req.body);
   Cafe.coffeeShopupdateAccountdetailsWh(req,res);
 //    console.log(req.body.data.object.verification);
 //    console.log(req.body.data.object.legal_entity.verification);
 // console.table(req.body.data.object.verification);
 //  console.table(req.body.data.object.legal_entity.verification);
 // Cafe.coffeeShopupdateAccountdetailsWh(req,res);
   
//  console.log(req.body.verification);
//   console.log('req.body');
//   var sig = req.headers["stripe-signature"];
//    var stripe = require("stripe")(
//   "sk_test_GaZgJAs0cki20ViJlstYlJOC"
// );
//    console.log(sig);
//    var eventdata =stripe.webhooks.constructEvent(req.body, sig, 'whsec_6tGWg4Q7BHL6gS5X5HDjigOgjPmOUVPE');
//  console.log(eventdata);
// console.log('eventdata');
//   if(sig == 'whsec_6tGWg4Q7BHL6gS5X5HDjigOgjPmOUVPE')
//   {
//     Cafe.coffeeShopupdateAccountdetailsWh(req,res);
//   }
//    Cafe.coffeeShopupdateAccountdetailsWh(req,res);
      //Stripe.transferingTobankaccount(req,res);
});



module.exports = router;
