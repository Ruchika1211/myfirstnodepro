var Stores = require('../models/cafeListing');
var StoreDetail = require('../models/menuListing');
var reward = require('../models/reward');
var order = require('../models/order');
var bcrypt = require('bcrypt-nodejs');
var jwt = require('jsonwebtoken');
var mongoose = require('mongoose');
var ObjectId = mongoose.Types.ObjectId;
var IterateObject = require("iterate-object");
var notification = require('../models/notification');
var randomstring = require("randomstring");
var moment = require('moment-timezone');
var helper = require('../services/helper.js');
var usersReward = require('../models/userReward');
var geodist = require('geodist');

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

var upperCaseFirstLetter = function(string) {
    return string.charAt(0).toUpperCase() + string.slice(1);
}


exports.coffeeShopGetMenu = (req, res) => {

    var token = req.body.userToken;
    var decoded = jwt.decode(token, "pickup");



    StoreDetail.findOne({
        "shopName": decoded.data.id
    }).exec(function(err, shopMenu) {
        if (err) {
            return res.status(500).json({
                title: 'An error occurred',
                error: "true",
                detail: err
            });
        }
        if (!shopMenu) {
            return res.status(200).json({
                title: 'No shop found',
                error: "true"


            });
        }

        var keysObject = Object.keys(shopMenu.category);
        var totalSize = keysObject.length;
        if (totalSize <= 0) {
            return res.status(200).json({
                title: 'No category found',
                error: "true"

            });
        }
        var itemData = [];
        IterateObject(shopMenu.category, function(value, name) {
            var catData = {
                itemCategory: name,
                itemData: value,

            }
            itemData.push(catData);
        })
        res.status(200).json({
            title: 'New category added to the existing item',
            error: "false",
            _id: shopMenu._id,
            shopName: shopMenu.shopName,
            data: itemData

        });

        // res.status(200).json({
        //     title: 'Listing of cafe menu',
        //     error: "false",

        //     cafes: shopMenu

        // });
    });

}

exports.coffeeShopAddCategory = (req, res) => {

    var token = req.body.userToken;
    var decoded = jwt.decode(token, "pickup");
    console.log(decoded);
    console.log("decoded");
    var newCategory = upperCaseFirstLetter(req.body.category);

    console.log(newCategory);
    if (!newCategory) {
        return res.status(200).json({
            title: 'No category found',
            error: "true"

        });
    }
    StoreDetail.findOne({
        "shopName": decoded.data.id
    }).exec(function(err, coffeeShop) {

        if (err) {
            return res.status(500).json({
                title: 'An error occurred',
                error: "true",
                detail: err
            });
        }

        if (coffeeShop) {
            // coffeeShop['category'][newCategory]=[];
            // var data= new Object();
            // data[newCategory]=[];

            var keysObject = Object.keys(coffeeShop.category);
            var categoryAlreadyExist = keysObject.includes(newCategory);
            if (categoryAlreadyExist) {
                return res.status(200).json({
                    title: 'This category already exist',
                    error: "true"

                });
            }
            // var totalSize=keysObject.length;
            // if(totalSize <= 0)
            // {
            //   return res.status(200).json({
            //       title: 'No category found',
            //       error: "true"

            //   });
            // }
            coffeeShop['category'][newCategory] = [];
            coffeeShop.markModified('category');
            coffeeShop.save((err, saved) => {

                if (err) {
                    return res.status(500).json({
                        title: 'An error occurred while adding data to existing menu',
                        error: "true",
                        detail: err
                    });
                }

                var keysObject = Object.keys(saved.category);
                var totalSize = keysObject.length;
                if (totalSize <= 0) {
                    return res.status(200).json({
                        title: 'No category found',
                        error: "true"

                    });
                }
                var itemData = [];
                IterateObject(saved.category, function(value, name) {

                    var catData = {
                        itemCategory: name,
                        itemData: value,

                    }
                    itemData.push(catData);
                })
                res.status(200).json({
                    title: 'New category added to the existing item',
                    error: "false",
                    _id: saved._id,
                    shopName: saved.shopName,
                    data: itemData

                });

                // res.status(200).json({
                //     message: 'New category added to the existing item',
                //     error: "false",

                //     data: saved
                // });

            });
        } else {

            var datatoPush = new Object();
            datatoPush['shopName'] = decoded.data.id;
            datatoPush['category'] = new Object();
            datatoPush['category'][newCategory] = [];
            console.log(datatoPush);
            var addCategory = new StoreDetail(datatoPush);

            addCategory.save((err, saved) => {

                if (err) {
                    return res.status(500).json({
                        title: 'An error occurred while adding new category',
                        error: "true",
                        detail: err
                    });
                }

                var keysObject = Object.keys(saved.category);
                var totalSize = keysObject.length;
                if (totalSize <= 0) {
                    return res.status(200).json({
                        title: 'No category found',
                        error: "true"

                    });
                }
                var itemData = [];
                IterateObject(saved.category, function(value, name) {

                    var catData = {
                        itemCategory: name,
                        itemData: value,


                    }
                    itemData.push(catData);
                })
                res.status(200).json({
                    title: 'New category added ',
                    error: "false",
                    _id: saved._id,
                    shopName: saved.shopName,
                    data: itemData

                });
                // res.status(200).json({
                //     message: 'New category added ',
                //     error: "false",

                //     data: saved
                // });

            });


        }



    });



}

exports.coffeeShopaddMenu = (req, res) => {

    var token = req.body.userToken;
    var decoded = jwt.decode(token, "pickup");
    console.log(decoded);
    console.log("decoded");


    var itemCat = upperCaseFirstLetter(req.body.itemCat);
    console.log(itemCat);

    StoreDetail.findOne({
        "shopName": decoded.data.id
    }).exec(function(err, shopMenu) {
        if (err) {
            return res.status(500).json({
                title: 'An error occurred',
                error: "true",
                detail: err
            });
        }
        if (!shopMenu) {
            return res.status(200).json({
                title: 'No shop found',
                error: "true"


            });
        }

        var keysObject = Object.keys(shopMenu.category);
        var categoryAlreadyExist = keysObject.includes(itemCat);
        console.log(categoryAlreadyExist);
        console.log('categoryAlreadyExist');
        if (!categoryAlreadyExist) {
            return res.status(200).json({
                title: 'No such category found',
                error: "true"

            });
        }
        var addedItem = upperCaseFirstLetter(req.body.itemName).trim();
        if (keysObject.length > 0) {

            var imExist = false;

            IterateObject(shopMenu.category, function(value, name) {
                //console.log(dataval);
                //console.log(name);
                //console.log(value.length);

                for (i = 0; i < value.length; i++) {

                    //console.log(i);
                    var dataOfEachObj = value[i];
                    var checkedData = dataOfEachObj.itemName.trim();

                    console.log('addedItem');
                    console.log(checkedData == addedItem);
                    if (checkedData == addedItem) {
                        imExist = true;
                        console.log("existing");
                        break;
                    }


                }
            });

            if (imExist) {
                return res.status(200).json({
                    title: 'Item already exist',
                    error: "true"

                });
            }

        }
        //  var minValue;
        //  var mainPrice=req.body.itemPrice;
        // if(req.body.itemSmallPrice||req.body.itemMediumPrice||req.body.itemLargePrice)
        // {
        //   if(req.body.itemSmallPrice&&req.body.itemMediumPrice)
        //     {
        //       minValue=Math.min(req.body.itemSmallPrice,req.body.itemMediumPrice);
        //     }
        //     else if(req.body.itemMediumPrice&&req.body.itemLargePrice)
        //     { 
        //       minValue=Math.min(req.body.itemMediumPrice,req.body.itemLargePrice);
        //     }
        //     else if(req.body.itemSmallPrice&&req.body.itemLargePrice)
        //     {
        //       minValue=Math.min(req.body.itemSmallPrice,req.body.itemLargePrice);
        //     }
        //     else
        //     {
        //       minValue='';
        //     }

        //     if(mainPrice&&(req.body.itemSmallPrice||req.body.itemMediumPrice||req.body.itemLargePrice))
        //     {
        //       mainPrice=minValue;
        //     }


        //  }
        // console.log(req.body.itemSmallPrice);
        // console.log(req.body.itemMediumPrice);
        // console.log(req.body.itemLargePrice);
        // console.log(mainPrice);
        //   console.log('mainPrice');
        var newItem = {
            _id: new ObjectId,
            itemName: upperCaseFirstLetter(req.body.itemName),
            itemPrice: req.body.itemPrice,
            hasSizes: req.body.hasSizes,
            itemSmallPrice: req.body.itemSmallPrice,
            itemMediumPrice: req.body.itemMediumPrice,
            itemLargePrice: req.body.itemLargePrice,
            eligibleForRewards: req.body.eligibleForRewards
        }

        shopMenu.category[itemCat].push(newItem);
        shopMenu.markModified('category');
        shopMenu.save((err, saved) => {

            if (err) {
                return res.status(500).json({
                    title: 'An error occurred while adding new menu item',
                    error: "true",
                    detail: err
                });
            }
            var keysObject = Object.keys(saved.category);
            var totalSize = keysObject.length;
            if (totalSize <= 0) {
                return res.status(200).json({
                    title: 'No category found',
                    error: "true"

                });
            }
            var itemData = [];
            IterateObject(saved.category, function(value, name) {

                var catData = {
                    itemCategory: name,
                    itemData: value,


                }
                itemData.push(catData);
            });
            res.status(200).json({
                title: 'New category added ',
                error: "false",
                _id: saved._id,
                shopName: saved.shopName,
                data: itemData

            });
            // res.status(200).json({
            //     message: 'New item added ',
            //     error: "false",

            //     data: saved
            // });

        });
    });

}

exports.coffeeShopeditMenu = (req, res) => {

    var token = req.body.userToken;
    var decoded = jwt.decode(token, "pickup");
    console.log(decoded);
    console.log("decoded");


    var itemCat = req.body.itemCat;
    var editItemId = req.body.itemId;
    var editObject = {
        _id: ObjectId(editItemId),
        itemName: upperCaseFirstLetter(req.body.itemName),
        itemPrice: req.body.itemPrice,
        hasSizes: req.body.hasSizes,
        itemSmallPrice: req.body.itemSmallPrice,
        itemMediumPrice: req.body.itemMediumPrice,
        itemLargePrice: req.body.itemLargePrice,
        eligibleForRewards: req.body.eligibleForRewards
    };



    var itemCatId = 'category.' + itemCat + '._id';
    var itemCat = 'category.' + itemCat + '.$'
    var obj1 = {
        "shopName": decoded.data.id,
        [itemCatId]: ObjectId(editItemId)
    }

    StoreDetail.findOneAndUpdate(obj1, {
        $set: {
            [itemCat]: editObject
        }
    }, (err, shopMenu) => {
        // console.log(shopMenu);
        //   console.log(req.body);
        console.log("shopMenu");
        if (err) {
            return res.status(500).json({
                title: 'An error occurred',
                error: "true",
                detail: err
            });
        }
        if (!shopMenu) {
            return res.status(200).json({
                title: 'No menu found',
                error: "true"

            });
        }

        return res.status(200).json({
            title: 'record updated',
            error: "false"


        });

    });

}

exports.coffeeShopdeleteMenu = (req, res) => {

    var token = req.body.userToken;
    var decoded = jwt.decode(token, "pickup");
    console.log(decoded);
    console.log("decoded");
    var itemCat = req.body.itemCat;
    var deleteItemId = req.body.itemId;
    var itemCatId = 'category.' + itemCat + '._id';
    var itemCat = 'category.' + itemCat;
    var obj1 = {
        "shopName": decoded.data.id,
        [itemCatId]: ObjectId(deleteItemId)
    }

    StoreDetail.findOneAndUpdate(obj1, {
        $pull: {
            [itemCat]: {
                _id: ObjectId(deleteItemId)
            }
        }
    }, (err, shopMenu) => {
        // console.log(shopMenu);
        //   console.log(req.body);
        console.log("shopMenu");
        if (err) {
            return res.status(500).json({
                title: 'An error occurred',
                error: "true",
                detail: err
            });
        }
        if (!shopMenu) {
            return res.status(200).json({
                title: 'No menu found',
                error: "true"
            });
        }

        return res.status(200).json({
            title: 'record deleted',
            error: "false",
        });

    });

}

exports.coffeeShopgetRewardData = (req, res) => {

    var token = req.body.userToken;
    var decoded = jwt.decode(token, "pickup");
    var itemName = req.body.itemName;
    StoreDetail.findOne({
        "shopName": decoded.data.id
    }).exec(function(err, store) {


        if (err) {
            return res.status(500).json({
                title: 'An error occurred',
                error: "true",
                detail: err
            });
        }
        if (!store) {
            return res.status(200).json({
                title: 'No store found',
                error: "true",
            });
        }
        var keysObject = Object.keys(store.category);
        var totalSize = keysObject.length;
        if (totalSize <= 0) {
            return res.status(200).json({
                title: 'No category found',
                error: "true"

            });
        }
        var itemData = [];
        IterateObject(store.category, function(value, name) {

            var catData = {
                itemCategory: name,
                itemData: value
            }
            itemData.push(catData);
        })
        res.status(200).json({
            title: 'Items with category',
            error: "false",

            data: itemData

        });


    });
}
var checkIfPresent = function(value, list) {

    for (i = 0; i < list.length; i++) {
          //console.log(value);
        var cor = list[i].shopDetail;
        if(value.shopDetail)
        {
            var value_check=value.shopDetail._id
           // console.log(cor);
           //  console.log(value_check);
            if (ObjectId(cor).equals(ObjectId(value_check))) {

                   var enddateData = new Date(value.enddate);
                                    enddateData.setHours(0, 0, 0, 0);
                                    var startdateData = new Date(value.startdate);
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

                            return true;
                          }
                
            } 
        }
       
    }

    return false;
}

var checkIfnotExpire = function(value) {
        if(value)
        {
             console.log(value);
               console.log(" value if");
               if(value.shopDetail)
               {
                     console.log(value.shopDetail);
                     console.log(" value if else");
                     var value_check=value.shopDetail._id; 
                       var enddateData = new Date(value.enddate);
                        enddateData.setHours(0, 0, 0, 0);
                        var startdateData = new Date(value.startdate);
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

                            return true;
                          }
               }
          
        }
       
        
    
            
     
    return false;
}

exports.getRewards = (req, res) => {

   var token = req.body.userToken;
   var decoded = jwt.decode(token, "pickup");
   console.log(decoded);
   console.log('decoded');
   var itemName = req.body.itemName;
   var rewardData = [];
   reward
      .find({})
      .populate('shopDetail', 'status imageurl cafe_name status position bankDetails')
      .exec(function(err, rewards) {
         // console.log(rewards);
         console.log(rewards.length);
         console.log('rewards');

         if (err) {
            return res.status(500).json({
               title: 'An error occurred',
               error: "true",
               detail: err
            });
         }

         if (rewards.length <= 0) {
            return res.status(200).json({
               title: 'No rewards found',
               error: "true"

            });
         }
         
         var nearbyCafe=[];
         for(i in rewards)
         {
               console.log(rewards[i]);
               console.log('rewards[i]');
                var Lat = rewards[i].shopDetail.position.latitude;
                 var Long = rewards[i].shopDetail.position.longitude;
                 // console.log(Lat);
                 //console.log(Long);
             
        
                 var TotalDistance = distance(Lat, Long,"134.05839","73.00754");
                 //console.log(TotalDistance);
                 if (TotalDistance && rewards[i].shopDetail.bankDetails.length > 0) {
                    nearbyCafe.push(rewards[i]);
                 }
         }

          console.log(nearbyCafe);
          console.log('nearbyCafe');
             
          

         usersReward
            .find({
               "userDetail": decoded.user._id
            })
            .exec(function(err, userrewards) {

               // for(i=0;i<rewards.length;i++) text += person[x];
               for (i in nearbyCafe) {
                  console.log("i count" + i);
                  console.log("rewards.length" + rewards.length);

                  var tempReward = rewards[i];
                  console.log(tempReward);
                  console.log('tempReward');

                  var DataPresent = checkIfPresent(tempReward, userrewards);
                  var notExpire = checkIfnotExpire(tempReward);
                  console.log(DataPresent);
                  console.log('DataPresent');
                  var tempRewardData = {};
                  if (DataPresent) {
                     for (j = 0; j < userrewards.length; j++) {
                        console.log("userrewards.length" + userrewards.length);
                        console.log("j count" + j);
                        var tempUserReward = userrewards[j];
                        console.log(tempReward.shopDetail._id);
                        console.log(tempUserReward.shopDetail);
                        if (ObjectId(tempReward.shopDetail._id).equals(ObjectId(tempUserReward.shopDetail)) && ObjectId(tempReward._id).equals(ObjectId(tempUserReward.rewardId))) {
                           // if (ObjectId(tempReward.shopDetail._id).equals(ObjectId(tempUserReward.shopDetail))) { 
                           tempRewardData.startdate = tempReward.startdate;
                           tempRewardData.enddate = tempReward.enddate;
                           tempRewardData.quantity = tempReward.quantity;
                           tempRewardData.rewardName = tempReward.rewardName;
                           tempRewardData.cafe_name = tempReward.shopDetail.cafe_name;
                           tempRewardData.cafeStatus = tempReward.shopDetail.status;
                           tempRewardData.imageurl = tempReward.shopDetail.imageurl;
                           tempRewardData.cafe_id = tempReward.shopDetail._id;
                           //tempRewardData.rewardName=tempReward.rewardName;
                           tempRewardData.claimedReward = tempUserReward.claimedReward;
                           tempRewardData.rewardCompleted = tempUserReward.rewardCompleted;
                           rewardData.push(tempRewardData);
                        } else {
                           console.log("do nothing");
                        }
                        // else if (ObjectId(tempReward.shopDetail._id).equals(ObjectId(tempUserReward.shopDetail))) { 
                        //      tempRewardData.startdate = tempReward.startdate;
                        //      tempRewardData.enddate = tempReward.enddate;
                        //      tempRewardData.quantity = tempReward.quantity;
                        //      tempRewardData.rewardName = tempReward.rewardName;
                        //      tempRewardData.cafe_name = tempReward.shopDetail.cafe_name;
                        //      tempRewardData.cafeStatus = tempReward.shopDetail.status;
                        //      tempRewardData.imageurl = tempReward.shopDetail.imageurl;
                        //      tempRewardData.cafe_id = tempReward.shopDetail._id;
                        //      //tempRewardData.rewardName=tempReward.rewardName;
                        //      tempRewardData.claimedReward = false;
                        //      tempRewardData.rewardCompleted = 0;
                        //      rewardData.push(tempRewardData);
                        //  } else {
                        //      console.log("do nothing");
                        //  }
                     }
                  } else {

                     console.log(notExpire);
                     console.log('notExpire');
                     if (notExpire) {
                        tempRewardData.startdate = tempReward.startdate;
                        tempRewardData.enddate = tempReward.enddate;
                        tempRewardData.quantity = tempReward.quantity;
                        tempRewardData.rewardName = tempReward.rewardName;
                        tempRewardData.claimedReward = false;
                        tempRewardData.rewardCompleted = 0;
                        tempRewardData.cafe_name = tempReward.shopDetail.cafe_name;
                        tempRewardData.cafeStatus = tempReward.shopDetail.status;
                        tempRewardData.imageurl = tempReward.shopDetail.imageurl;
                        tempRewardData.cafe_id = tempReward.shopDetail._id;
                        rewardData.push(tempRewardData);
                     } else {
                        console.log(" expired");
                     }

                  }

               }

               res.status(200).json({
                  title: 'Items with category',
                  error: "false",
                  data: rewardData

               });

            });

      });
}

// exports.getRewards =(req,res)=>{

//   var token=req.body.userToken;
//   var decoded = jwt.decode(token, "pickup");
//   var itemName=req.body.itemName;
//   reward
//   .find({})
//   .populate('shopDetail','status imageurl cafe_name status')
//   .exec(function (err,rewards){


//             if (err)
//             {
//                 return res.status(500).json({
//                     title: 'An error occurred',
//                     error: "true",
//                     detail:err
//                 });
//             }

//            if(rewards.length <= 0)
//            {
//              return res.status(200).json({
//                  title: 'No rewards found',
//                  error: "true"

//              });
//            }
//            fi

//              res.status(200).json({
//                  title: 'Items with category',
//                  error: "false",
//                  data:rewards
//              });


//   });
// }

exports.coffeeShopsetrewardLogic = (req, res) => {

    var token = req.body.userToken;
    var decoded = jwt.decode(token, "pickup");
    var rewardName = req.body.rewardName;
    var dec = moment.tz(req.body.startdate, req.body.timezone);
    var dec1 = moment.tz(req.body.enddate, req.body.timezone);
    console.log(dec);
    var start = dec.utc().format('YYYY-MM-DD HH:mm:ss');
    var end = dec1.utc().format('YYYY-MM-DD HH:mm:ss');
    var compareDate = start.toString();
    var compareendDate = end.toString();
    if (new Date(compareDate) > new Date(compareendDate)) {

        return res.status(500).json({
            title: 'Reward start date is greater than end date',
            error: "true",

        });

    }

    reward.find({
            "shopDetail": decoded.data.id,
        })
        .exec(function(err, rewardata) {
            console.log(rewardata);
            if (err) {
                return res.status(500).json({
                    title: 'An error occurred',
                    error: "true",
                    detail: err
                });
            }
            for (i = 0; i < rewardata.length; i++) {
                 
                 var c=new Date(compareDate);
                 c.setHours(0, 0, 0, 0);
                 var s=new Date(rewardata[i].startdate);
                 s.setHours(0, 0, 0, 0);
                  var e=new Date(rewardata[i].enddate);
                 e.setHours(0, 0, 0, 0);
                 var compareDateC=c.getTime();
                 var startDateC=s.getTime();
                 var endDateC=e.getTime();
                console.log(compareDateC);
                console.log(startDateC);
                console.log(endDateC);
                console.log('new Date(reward.enddate)');
                if ((compareDateC >= startDateC) && (compareDateC <= endDateC)) {

                    return res.status(200).json({
                        title: 'Reward already exists for this date',
                        error: "true",

                    });

                }
            }


            var rew = new reward({
                startdate: start,
                enddate: end,
                quantity: req.body.quantity,
                shopDetail: decoded.data.id,
                rewardName: rewardName,

            })

            rew.save((err, rewardSave) => {

                if (err) {
                    return res.status(500).json({
                        title: 'An error occurred',
                        error: "true",
                        detail: err
                    });
                }

                res.status(200).json({
                    title: 'Reward Data set',
                    error: "false"
                });

            })


        })




}

exports.coffeeShopdeleteReward = (req, res) => {

    var token = req.body.userToken;
    var decoded = jwt.decode(token, "pickup");
    var rewardId = req.body.rewardId;
   usersReward
   .find({rewardId:rewardId})
   .exec(function(err, rewardata) {

      if (err) {
                return res.status(500).json({
                    title: 'An error occurred',
                    error: "true",
                    detail: err
                });
            }
      if(rewardata)
      {
         return res.status(200).json({
                    title: 'This reward is already in use.',
                    error: "true",
                    
                });
      }

      reward.findByIdAndRemove(rewardId)
        .exec(function(err, rewardata) {
            console.log(rewardata);
            if (err) {
                return res.status(500).json({
                    title: 'An error occurred',
                    error: "true",
                    detail: err
                });
            }

            res.status(200).json({
                    title: 'delete succesfully',
                    error: "false",
                    detail: rewardata
                });
        })

   })
    

}

exports.coffeeShopshowRewardListing = (req, res) => {

    var token = req.body.userToken;
    var decoded = jwt.decode(token, "pickup");

    reward.
    find({
            "shopDetail": decoded.data.id
        })
        .exec(function(err, rewards) {


            if (err) {
                return res.status(500).json({
                    title: 'An error occurred',
                    error: "true",
                    detail: err
                });
            }
            if (rewards.length <= 0) {
                return res.status(200).json({
                    title: 'No rewards found',
                    error: "false",


                });
            }

            return res.status(200).json({
                title: 'Rewards found',
                error: "false",

                data: rewards

            });
        })
}

exports.coffeeShopShowCompletedOrderListing = (req, res) => {

    var token = req.body.userToken;
    var decoded = jwt.decode(token, "pickup");
    var initialData = 20;
    var requestData = parseInt(req.body.requestData);
    var skip_D = parseInt(req.body.skipData);
    var limitData = initialData * requestData;
    var skipingData = 0;
    if (requestData > 1) {
        var skipingData = skip_D * initialData;
    }

    order
        .find({
            "shopDetail": decoded.data.id,
            "orderStatus": 'completed'
        })
        .limit(limitData)
        .skip(skipingData)
        .sort({
            'updatedAt': -1
        })
        .populate('userDetail', 'firstname lastname contact email')
        .exec(function(err, orders) {
            var completedCount;

            if (err) {
                return res.status(500).json({
                    title: 'An error occurred',
                    error: "true",
                    detail: err
                });
            }
            if (orders.length <= 0) {
                return res.status(200).json({
                    title: 'No orders found',
                    error: "true",


                });
            }

            order.count({
                "shopDetail": decoded.data.id,
                "orderStatus": 'completed'
            }, function(err, c) {
                if (err) {
                    completedCount = "Count err";
                }
                completedCount = c;
                return res.status(200).json({
                    title: 'orders found ',
                    error: "false",
                    count: completedCount,
                    completed: orders

                });

            });
            // var active=[];
            // var ready=[];
            // var completed=[];
            //
            // for(i=0;i<orders.length;i++)
            // {
            //    var dataOfOrder=orders[i];
            //    var orderStatus=orders[i].orderStatus;
            //     if(orderStatus == 'ready')
            //      {
            //          ready.push(dataOfOrder);
            //      }
            //      else if(orderStatus == 'completed')
            //      {
            //         completed.push(dataOfOrder);
            //      }
            //      else
            //      {
            //          active.push(dataOfOrder);
            //      }
            //
            //
            //
            // }


            // return res.status(200).json({
            //     title: 'List of orders',
            //     error: "false",
            //     data:orders

            // });
        })
}

exports.coffeeShopShowOrderListing = (req, res) => {

    var token = req.body.userToken;
    var decoded = jwt.decode(token, "pickup");
    // var initialData=20;
    // var requestData=parseInt(req.body.requestData);
    // var skip_D=parseInt(req.body.skipData);
    // var limitData=initialData*requestData;
    // var skipingData=0;
    // if(requestData > 1)
    // {
    //    var skipingData = skip_D*initialData;
    // }

    order
        .find({
            "shopDetail": decoded.data.id,
            $or: [{
                orderStatus: 'active'
            }, {
                orderStatus: 'ready'
            }]
        })
        .sort({
            'updatedAt': -1
        })
        .populate('userDetail', 'firstname lastname contact email')
        .exec(function(err, orders) {


            if (err) {
                return res.status(500).json({
                    title: 'An error occurred',
                    error: "true",
                    detail: err
                });
            }
            if (orders.length <= 0) {
                return res.status(200).json({
                    title: 'No orders found',
                    error: "true",


                });
            }
            var active = [];
            var ready = [];
            var completed = [];

            for (i = 0; i < orders.length; i++) {
                var dataOfOrder = orders[i];
                var orderStatus = orders[i].orderStatus;
                if (orderStatus == 'ready') {
                    ready.push(dataOfOrder);
                } else if (orderStatus == 'completed') {
                    completed.push(dataOfOrder);
                } else {
                    active.push(dataOfOrder);
                }



            }

            return res.status(200).json({
                title: 'orders found ',
                error: "false",
                active: active,
                ready: ready,


            });

            // return res.status(200).json({
            //     title: 'List of orders',
            //     error: "false",
            //     data:orders

            // });
        })
}

exports.coffeeShopMoveOrderToReadyState = (req, res) => {

    var token = req.body.userToken;
    var decoded = jwt.decode(token, "pickup");
    var CurrentUserDetail;

    order
        .findOne({
            "shopDetail": decoded.data.id,
            "orderId": req.body.orderId
        })
        .populate('shopDetail', 'status imageurl cafe_name status')
        .exec(function(err, order) {
             

            if (err) {
                return res.status(500).json({
                    title: 'An error occurred',
                    error: "true",
                    detail: err
                });
            }
            if (!order) {
                return res.status(200).json({
                    title: 'No orders found',
                    error: "false"


                });
            }

            var checkStatus = order.orderStatus;
            if (checkStatus == 'ready') {
                return res.status(200).json({
                    title: 'Order already in ready state',
                });
            }
            helper.findUser(order.userDetail, function(cb) {
                CurrentUserDetail = cb;
                console.log(CurrentUserDetail);
                console.log('CurrentUserDetail');
                order.orderStatus = 'ready';
                order.save((err, savedOrder) => {

                    if (err) {
                        return res.status(500).json({
                            title: 'An error occurred',
                            error: "true",
                            detail: err
                        });
                    }
                    if (CurrentUserDetail == 'err') {

                        console.log("as no store found cannot send the notification to the user");
                        res.status(200).json({
                            message: 'Order moved to ready state',
                            error: "false"
                        });


                    } else if (CurrentUserDetail == 'no user Found') {

                        console.log("as no store found cannot send the notification to the user");
                        res.status(200).json({
                            message: 'Order moved to ready state',
                            error: "false"
                        });

                    } else {
                        var msg = "Your order at " + order.shopDetail.cafe_name + " is ready." ;
                        // helper.sendNotification(CurrentUserDetail.deviceToken,"orderReady",msg,function(cb)
                        // {

                        var notifi = new notification({
                            shopDetail: decoded.data.id,
                            userDetail: CurrentUserDetail._id,
                             cafe_name:shopDetail.cafe_name,
                            message: msg,
                            orderId:order._id
                        });
                        notifi.save((err, savedNoti) => {

                            if (err) {
                                return res.status(200).json({
                                    message: 'Order moved to ready state',
                                    error: "false"
                                });

                            }

                            helper.sendNotification(CurrentUserDetail.deviceToken, "orderReady", msg, function(cb) {
                                res.status(200).json({
                                    message: 'Order moved to ready state',
                                    error: "false"
                                });

                            },order._id);


                        })




                        // });



                    }




                })

            });

        })
}

exports.coffeeShopVerifyOtp = (req, res) => {

    var token = req.body.userToken;
    var decoded = jwt.decode(token, "pickup");
    var otp = req.body.otp;
     console.log(decoded);
    order
        .findOne({
            "shopDetail": decoded.data.id,
            "orderId": req.body.orderId
        })
        .exec(function(err, order) {


            if (err) {
                return res.status(500).json({
                    title: 'An error occurred',
                    error: "true",
                    detail: err
                });
            }
            if (!order) {
                return res.status(200).json({
                    message: 'No orders found',
                    error: "true"


                });
            }

            var CurrentUserDetail;
            var CurrentStoreDetail;

            helper.findShopowner(decoded.data.id, function(cb) {


                CurrentStoreDetail = cb;
                console.log(CurrentStoreDetail);
                console.log('CurrentStoreDetail');
                helper.findUser(order.userDetail, function(cb) {
                    CurrentUserDetail = cb;
                    console.log(CurrentUserDetail);
                    console.log('CurrentUserDetail');
                    var savedOtp = order.otp;
                    var checkStatus = order.orderStatus;

                    if (checkStatus == 'active') {
                        return res.status(200).json({
                            message: 'Order still in active state',
                            error: "true"
                        });
                    }

                    if (!(savedOtp == otp)) {
                        return res.status(200).json({
                            message: 'Otp is wrong',
                            error: "true"
                        });
                    }


                    order.orderStatus = 'completed';
                    order.save((err, savedOrder) => {

                        if (err) {
                            return res.status(500).json({
                                title: 'An error occurred',
                                error: "true",
                                detail: err
                            });
                        }

                        var msg = "Your order at "+CurrentStoreDetail.cafe_name + " placed succesfully.";
                           var mseg = "Your order has been placed succesfully.";
                        //var msg="Your order  "+savedOrder.orderId +" is ready and your otp is" +savedOrder.otp;
                        // helper.sendNotification(CurrentUserDetail.deviceToken,"orderReady",msg,function(cb)
                        // {

                        var notifica = new notification({
                            shopDetail: decoded.data.id,
                            userDetail: CurrentUserDetail._id,
                             cafe_name:CurrentStoreDetail.cafe_name,
                            message: msg,
                             orderId:order._id
                        });
                        notifica.save((err, savedNoti) => {

                            if (err) {
                                return res.status(200).json({
                                    message: 'Order moved to ready state',
                                    error: "false"
                                });

                            }

                            // helper.sendNotification(CurrentStoreDetail.deviceToken, "orderSuccess", mseg, (cb) => {
                                helper.sendNotification(CurrentUserDetail.deviceToken, "orderSuccess", msg, (cb) => {

                                    res.status(200).json({
                                        message: 'Otp verified order moved to completed',
                                        error: "false"
                                    });

                                },order._id);
                            // })


                        })
                    })

                });

            });




        })
}