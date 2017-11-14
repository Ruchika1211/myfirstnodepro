var stripe = require('stripe')('sk_test_GaZgJAs0cki20ViJlstYlJOC');
var bcrypt = require('bcrypt-nodejs');
var Users = require('../models/user');
var Payment = require('../models/payment');
var Stores = require('../models/cafeListing');

var jwt = require('jsonwebtoken');
var helper = require('../services/helper.js');
var async= require('async');

// exports.payCreateUserCards = (req, res) => {
//    var token = req.body.userToken;
//    token.trim();
//    console.log(token);
//    console.log('req.body>>>>>>>>>>>>.');
//    var decoded = jwt.decode(token, "pickup");
//    console.log(decoded);
//    console.log('decoded');

//    // jwt.verify(token,"pickup", function (err, decoded){

//    Users.findOne({
//       "_id": decoded.user._id
//    }, (err, user) => {

//       if (err) {
//          return res.status(500).json({
//             title: 'An error occurred',
//             error: "true",
//             detail: err
//          });
//       }
//       if (!user) {
//          return res.status(200).json({
//             title: 'user not found',
//             error: "true",

//          });
//       }

//       if (user.stripeId) {
//          stripe.customers.update(user.stripeId, {
//                description: "Customer id is " + user.stripeId
//             })
//             .then(function(customer) {
//                console.log(customer.sources.data);
//                console.log("customer");
//                return stripe.customers.createSource(customer.id, {
//                   source: req.body.stripeToken
//                });
//             }).then(function(source) {
//                console.log(source);
//                console.log('source');
//                var cardDetailsData = {};
//                cardDetailsData.cardId = source.id;
//                cardDetailsData.card_number = source.last4;
//                cardDetailsData.expiryMonth = source.exp_month;
//                cardDetailsData.expiryYear = source.exp_year;
//                cardDetailsData.brand = source.brand;
//                cardDetailsData.card_name = source.name;

//                console.log(user.cardDetails.length);
//                console.log('user.cardDetails.length');
//                if(user.cardDetails.length >=1)
//                {
//                   for(i in user.cardDetails)
//                   {
//                      var userCardData= user.cardDetails[i];
//                      console.log(source.fingerprint);
//                      console.log('source.fingerprint');
//                      console.log(userCardData.fingerprint);
//                      console.log('userCardData.fingerprint');
//                      if(userCardData.fingerprint == source.fingerprint)
//                      {
//                           return stripe.customers.deleteCard(
//                            user.stripeId,
//                            source.id,
//                            function(err, confirmation) {

//                               if (err) {
//                                  return res.status(500).json({
//                                     title: 'An error occurred',
//                                     error: "true",
//                                     detail: err
//                                  });
//                               }

//                               if (!confirmation) {
//                                  return res.status(200).json({
//                                     title: 'stripe error card not deleted',
//                                     error: "false"
//                                  });
//                               }


//                                return res.status(200).json({
//                                     title: 'Duplicate Card',
//                                     error: "true"
//                               });

//                            })

//                             break;
//                      }
//                   }
//                   cardDetailsData.isPrimary = false;
//                }
//                else
//                {
//                   cardDetailsData.isPrimary = true;
               
//                }
//               cardDetailsData.fingerprint=source.fingerprint;
//                user.stripeId = source.customer;

//                user.cardDetails.push(cardDetailsData);
//                user.save(function(err) {
//                   if (err) {
//                      return res.status(500).json({
//                         title: 'An error occurred',
//                         error: "true",
//                         detail: err
//                      });
//                   }

//                   res.status(200).json({
//                      title: 'Card added successfully',
//                      error: "false",

//                   });

//                });

//             })
//             .catch(function(err) {
//                console.log(err);
//                console.log('err');
//                return res.status(500).json({
//                   title: 'An error occurred',
//                   error: "true",
//                   detail: err
//                });
//             });
//       } else {
//          console.log("else>>>>>>");
//          stripe.customers.create({
//                "email":user.email,
//                "metadata": {
//                   "name": user.firstname + user.lastname
//                },

//             }).then(function(customer) {
//                console.log(customer);

//                return stripe.customers.createSource(customer.id, {
//                   source: req.body.stripeToken
//                });
//             }).then(function(source) {
//                console.log(source);
//                console.log('source');
//                var cardDetailsData = {};
//                cardDetailsData.cardId = source.id;
//                cardDetailsData.card_number = source.last4;
//                cardDetailsData.expiryMonth = source.exp_month;
//                cardDetailsData.expiryYear = source.exp_year;
//                cardDetailsData.brand = source.brand;
//                cardDetailsData.card_name = source.name;
//                cardDetailsData.isPrimary = true;
//                console.log(source.fingerprint);
//                      console.log('source.fingerprint');
//                cardDetailsData.fingerprint=source.fingerprint;
//                user.stripeId = source.customer;
//                user.cardDetails.push(cardDetailsData);
//                user.save(function(err, userData) {
//                   if (err) {
//                      return res.status(500).json({
//                         title: 'An error occurred',
//                         error: "true",
//                         detail: err
//                      });
//                   }

//                   res.status(200).json({
//                      title: 'Card added successfully',
//                      error: "false",
//                      user: userData

//                   });

//                });

//             })
//             .catch(function(err) {
//                console.log(err);
//                console.log('err');
//                return res.status(500).json({
//                   title: 'An error occurred',
//                   error: "true",
//                   detail: err
//                });
//             });
//       }

//    });

// }

exports.payCreateUserCards = (req, res) => {
   var token = req.body.userToken;
   token.trim();
   console.log(token);
   console.log('req.body>>>>>>>>>>>>.');
   var decoded = jwt.decode(token, "pickup");
   console.log(decoded);
   console.log('decoded');

   // jwt.verify(token,"pickup", function (err, decoded){

   Users.findOne({
      "_id": decoded.user._id
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
            error: "true",

         });
      }

      if (user.stripeId) {
         stripe.customers.update(user.stripeId, {
               description: "Customer id is " + user.stripeId
            })
            .then(function(customer) {
               // console.log(customer.sources.data);
               // console.log("customer");
               return stripe.customers.createSource(customer.id, {
                  source: req.body.stripeToken
               });
            }).then(function(source) {
               console.log(source);
               console.log('source');
               console.log(user.cardDetails.length);
                // var cardDetailsData = {};
               console.log('user.cardDetails.length');
               if(user.cardDetails.length >=1)
                {
                   var NofingerprintMatch=false;
                  for(i in user.cardDetails)
                  {
                     var userCardData= user.cardDetails[i];
                     console.log(source.fingerprint);
                     console.log('source.fingerprint');
                     console.log(userCardData.fingerprint);
                     console.log('userCardData.fingerprint');
                     if(userCardData.fingerprint == source.fingerprint)
                     {
                        // console.log(userCardData.fingerprint);
                     console.log('userCardData.fingerprint fingerprint match');
                          NofingerprintMatch=true;
                          break;
                          // return stripe.customers.deleteCard(
                          //  user.stripeId,
                          //  source.id)
                     }

                  }

                  if(!NofingerprintMatch)
                  {
                       console.log('userCardData.fingerprint fingerprint not match');
                     // cardDetailsData.fingerprint=source.fingerprint;
                     user.stripeId = source.customer;
                      var cardDetailsData = {};
                       cardDetailsData.fingerprint=source.fingerprint;
                     cardDetailsData.cardId = source.id;
                     cardDetailsData.card_number = source.last4;
                     cardDetailsData.expiryMonth = source.exp_month;
                     cardDetailsData.expiryYear = source.exp_year;
                     cardDetailsData.brand = source.brand;
                     cardDetailsData.card_name = source.name;
                     cardDetailsData.isPrimary = false;

                     user.cardDetails.push(cardDetailsData);
                     user.save(function(err) {
                        if (err) {
                           return res.status(500).json({
                              title: 'An error occurred',
                              error: "true",
                              detail: err
                           });
                        }

                        return res.status(200).json({
                           title: 'Card added successfully',
                           error: "false",

                        });

                     });
                  }
                  else
                  {
                     stripe.customers.deleteCard(
                           user.stripeId,
                           source.id).then(function(confirmation) {

                         console.log("i m in confirmation");
                          // if (err) {
                          //        return res.status(500).json({
                          //           title: 'An error occurred',
                          //           error: "true",
                          //           detail: err
                          //        });
                          //     }

                              if (!confirmation) {
                                 return res.status(200).json({
                                    title: 'stripe error card not deleted',
                                    error: "false"
                                 });
                              }


                             res.status(200).json({
                                    title: 'Duplicate Card',
                                    error: "true"
                              });

                           }).catch(function(err) {
                              console.log(err);
                              console.log('err');
                              return res.status(500).json({
                                 title: 'An error occurred',
                                 error: "true",
                                 detail: err
                              });
                            });
                  }
               }
               else
               {     
                     console.log('userCardData length less than one');
                    
                     user.stripeId = source.customer;
                      var cardDetailsData = {};
                       cardDetailsData.fingerprint=source.fingerprint;
                     cardDetailsData.cardId = source.id;
                     cardDetailsData.card_number = source.last4;
                     cardDetailsData.expiryMonth = source.exp_month;
                     cardDetailsData.expiryYear = source.exp_year;
                     cardDetailsData.brand = source.brand;
                     cardDetailsData.card_name = source.name;
                     cardDetailsData.isPrimary = true;

                     user.cardDetails.push(cardDetailsData);
                     user.save(function(err) {
                        if (err) {
                           return res.status(500).json({
                              title: 'An error occurred',
                              error: "true",
                              detail: err
                           });
                        }

                        res.status(200).json({
                           title: 'Card added successfully',
                           error: "false",

                        });

                     });
               }
            }).catch(function(err) {
                              console.log(err);
                              console.log('err');
                              return res.status(500).json({
                                 title: 'An error occurred',
                                 error: "true",
                                 detail: err
                              });
                            });

            
      } else {
         console.log("else>>>>>>");
         stripe.customers.create({
               "email":user.email,
               "metadata": {
                  "name": user.firstname + user.lastname
               },

            }).then(function(customer) {
               console.log(customer);

               return stripe.customers.createSource(customer.id, {
                  source: req.body.stripeToken
               });
            }).then(function(source) {
               console.log(source);
               console.log('source');
               var cardDetailsData = {};
               cardDetailsData.cardId = source.id;
               cardDetailsData.card_number = source.last4;
               cardDetailsData.expiryMonth = source.exp_month;
               cardDetailsData.expiryYear = source.exp_year;
               cardDetailsData.brand = source.brand;
               cardDetailsData.card_name = source.name;
               cardDetailsData.isPrimary = true;
               console.log(source.fingerprint);
                     console.log('source.fingerprint');
               cardDetailsData.fingerprint=source.fingerprint;
               user.stripeId = source.customer;
               user.cardDetails.push(cardDetailsData);
               user.save(function(err, userData) {
                  if (err) {
                     return res.status(500).json({
                        title: 'An error occurred',
                        error: "true",
                        detail: err
                     });
                  }

                  res.status(200).json({
                     title: 'Card added successfully',
                     error: "false",
                     user: userData

                  });

               });

            })
            .catch(function(err) {
               console.log(err);
               console.log('err');
               return res.status(500).json({
                  title: 'An error occurred',
                  error: "true",
                  detail: err
               });
            });
      }

   });

}


exports.cardListing = (req, res) => {
   var token = req.body.userToken;
   console.log(req.body);
   console.log('req.body>>>>>>>>>>>>.');
   var decoded = jwt.decode(token, "pickup");
   console.log(decoded);
   console.log('decoded');

   // jwt.verify(token,"pickup", function (err, decoded){

   Users.findOne({
      "_id": decoded.user._id
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
            error: "false",

         });
      }

      console.log(user);
      console.log('user');

      res.status(200).json({
         title: 'primarly card details changed successfully',
         error: "false",
         user: user

      });

   })
}

var checkIfduplicates = function(alldata, data) {
   console.log("i  m in checkIfduplicates ");
   // console.log(alldata);
   // console.log(data);
   var datatemp = {};
   datatemp.present = false;
   for (i in alldata) {
      // console.log("i");
      // console.log(alldata[i].cardId);
      // console.log(data);
      if (alldata[i].cardId == data) {
         console.log("found card");
         datatemp.present = true;
         datatemp.obj = alldata[i];
         return datatemp;
      }

   }

   return datatemp;
}

exports.deletecard = (req, res) => {
   var token = req.body.userToken;
   console.log(req.body);
   console.log('req.body>>>>>>>>>>>>.');
   var decoded = jwt.decode(token, "pickup");
   console.log(decoded);
   console.log('decoded');

   // jwt.verify(token,"pickup", function (err, decoded){

   Users.findOne({
      "_id": decoded.user._id
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
            error: "false",

         });
      }

      var cardPresent = checkIfduplicates(user.cardDetails, req.body.cardId);
      console.log('cardPresent');
      console.log(cardPresent);
      var IsPrimary = cardPresent.obj.isPrimary;
      console.log('IsPrimary');
      console.log(IsPrimary);
      if (cardPresent.present) {
         //  for(i in user.cardDetails)
         // {
         if (user.stripeId) {
            stripe.customers.deleteCard(
               user.stripeId,
               req.body.cardId,
               function(err, confirmation) {

                  if (err) {
                     return res.status(500).json({
                        title: 'An error occurred',
                        error: "true",
                        detail: err
                     });
                  }

                  if (!confirmation) {
                     return res.status(500).json({
                        title: 'stripe error card not deleted',
                        error: "false"
                     });
                  }

                  console.log(confirmation);
                  console.log('confirmation');

                  var arrayofToken = user.cardDetails;
                  var index = arrayofToken.indexOf(cardPresent.obj);
                  console.log(index);
                  console.log('index');
                  if (index > -1) {
                     if (IsPrimary) {
                        stripe.customers.retrieve(
                           user.stripeId,
                           function(err, customer) {
                              if (err) {
                                 return res.status(500).json({
                                    title: 'An error occurred while finding stripe',
                                    error: "true",
                                    detail: err
                                 });
                              }
                              if (!customer) {
                                 return res.status(500).json({
                                    title: 'stripe error customer not found',
                                    error: "false"
                                 });
                              }
                              var defaultSource = customer.default_source;
                              for (i in user.cardDetails) {

                                 if (user.cardDetails[i].cardId == defaultSource) {
                                    user.cardDetails[i].isPrimary = true
                                 }

                              }

                              user.cardDetails.splice(index, 1);
                              user.save(function(err, userdata) {
                                 console.log('user');
                                 if (err) {
                                    return res.status(500).json({
                                       title: 'An error occurred',
                                       error: "true",
                                       detail: err
                                    });
                                 }

                                 res.status(200).json({
                                    title: 'card deleted successfully',
                                    error: "false",
                                    user: userdata

                                 });

                              });
                              // asynchronously called
                           }
                        );
                     } else {

                        user.cardDetails.splice(index, 1);
                        user.save(function(err, userdata) {
                           console.log('user');
                           if (err) {
                              return res.status(500).json({
                                 title: 'An error occurred',
                                 error: "true",
                                 detail: err
                              });
                           }

                           res.status(200).json({
                              title: 'card deleted successfully',
                              error: "false",
                              user: userdata

                           });

                        });

                     }

                  } else {
                     return res.status(200).json({
                        title: 'no card found',
                        error: "false",

                     });
                  }
                  // asynchronously called
               }
            );
         } else {
            return res.status(200).json({
               title: 'not a stripe user',
               error: "false",

            });
         }

         // }
      } else {
         return res.status(200).json({
            title: 'no card found',
            error: "false",

         });
      }

      // console.log(user);
      // console.log('user');

      //       res.status(200).json({
      //           title: 'primarly card details changed successfully',
      //           error: "false",
      //           user:user

      //       });

   })
}

exports.payMakePrimary = (req, res) => {
   var token = req.body.userToken;
   console.log(req.body);
   console.log('req.body>>>>>>>>>>>>.');
   var decoded = jwt.decode(token, "pickup");
   console.log(decoded);
   console.log('decoded');

   // jwt.verify(token,"pickup", function (err, decoded){

   Users.findOne({
      "_id": decoded.user._id
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
            error: "true",

         });
      }

      if (user.stripeId) {
         stripe.customers.update(user.stripeId, {
               description: "Customer id is " + user.stripeId,
               default_source: req.body.makePrimaryId
            })
            .then(function(customer) {
               console.log(customer.default_source);
               console.log(req.body.makePrimaryId);
               console.log("customer");
               if (customer.default_source == req.body.makePrimaryId) {
                  for (i in user.cardDetails) {

                     var cardData = user.cardDetails[i];
                     console.log(cardData.cardId);
                     console.log(customer.default_source);
                     console.log(cardData.cardId == customer.default_source);
                     if (cardData.cardId == customer.default_source) {
                        user.cardDetails[i].isPrimary = true;
                     } else {
                        user.cardDetails[i].isPrimary = false;
                     }

                  }

                  user.save(function(err, userdata) {
                     console.log('user');
                     if (err) {
                        return res.status(500).json({
                           title: 'An error occurred',
                           error: "true",
                           detail: err
                        });
                     }

                     res.status(200).json({
                        title: 'primarly card details changed successfully',
                        error: "false",
                        user: userdata

                     });

                  });
               } else {
                  res.status(500).json({
                     title: 'Stripe error',
                     error: "true",
                     detail: "default not set"
                  });
               }

            })
            .catch(function(err) {
                console.log("error");
         console.log(err);
               return res.status(500).json({
                  title: 'An error occurred',
                  error: "true",
                  detail: err
               });
            });
      } else {


         res.status(500).json({
            title: 'Stripe error occurred',
            error: "true",
            detail: "no stripe user created"
         });
      }
   })

}

exports.payCharges = (token, amountpaid, callback) => {

   // var token = req.body.userToken;
   //console.log(req.body);
   // console.log('req.body>>>>>>>>>>>>.');
   var decoded = jwt.decode(token, "pickup");
   //console.log(decoded);
   //console.log('decoded');

   // jwt.verify(token,"pickup", function (err, decoded){

   Users.findOne({
      "_id": decoded.user._id
   }, (err, user) => {
      if (err || !user) {
         callback("user not found or data finding err");

      }

      if (user.stripeId) {
         if (!user.cardDetails) {
            callback('stripe error no sources added');
         }
         // console.log(user);
         // console.log('user');
         stripe.customers.retrieve(
               user.stripeId
            ).then(function(customer) {
               // console.log(customer);
               console.log('customer');
               var defaultSource = customer.default_source;
               console.log(user.cardDetails.length);
               console.log('user.cardDetails.length');
               var loopData=user.cardDetails;
                var notAPrimaryCard=false;
               for(i in loopData) {
                  var cardData = loopData[i];
                  // console.log(cardData.cardId);
                  // console.log(defaultSource);
                  // console.log('defaultSource');
                 
                  if (cardData.cardId == defaultSource) {
                       console.log('defaultSource  if');

                     if (cardData.isPrimary) {
                        notAPrimaryCard=true;
                                console.log('defaultSource  if if');
                        var totalAmount = parseFloat(amountpaid) * 100;
                        // console.log(totalAmount);
                        // console.log('totalAmount');
                        return stripe.charges.create({
                           amount: parseInt(totalAmount),
                           currency: 'gbp',
                           customer: user.stripeId

                        });
                        break;
                     } else {
                          console.log('defaultSource  if else');
                        callback('stripe error not a primary card');
                      
                     }
                  }

                  

               }
               if(!notAPrimaryCard)
               {
                   callback('stripe error not a primary card');
               }

            })
            .then(function(customerdata) {
               // console.log(customerdata);
               // console.log('customerdata');
               if (customerdata.status == 'succeeded') {
                  callback('stripe payment succesfull', customerdata);
                  //   res.status(200).json({
                  //   title: 'stripe payment succesfull',
                  //   error: "false",

                  // });
               } else {
                  callback('stripe error something went wrong', customerdata);
                  // res.status(200).json({
                  //   title: 'stripe error something went wrong',
                  //   error: "false",

                  // });
               }
               // return stripe.charges.create({
               //         amount: 1600,
               //         currency: 'gbp',
               //         customer: user.stripeId

               //       });

            })
            .catch(function(err) {
               console.log("err");
               console.log(err);
               callback(err.message);
               // return res.status(500).json({
               //              title: 'An error occurred',
               //              error: "true",
               //              detail: err
               //          });
            });
      } else {
         callback('not a stripe user');

      }

   })
}




exports.checkIfavailablebalance = (req, res) => {
   Stores.find({}, (err, stores) => {
      if (err) {
         console.log("err while retrieving" + err);
      }
      if (!stores) {
         console.log("no stores retrieve err while retrieving");
      }

      //var done = false;
      for (var i in stores) {
         console.log("count of i start and it is" + i);
         var storeData = stores[i];
         var transactions = storeData.incomesourceDetail;
         var totalAmounttoTransfer = 0;
         var isAllStoreDone = true;
         var dataOfTrans = [];
         console.log('transactions');
         console.log(transactions.length);
         transactions.forEach(function(tranData, j) {
            // for(j in  transactions)
            // {  
            console.log("count of j start and it is" + j);

            //var tranData=transactions[j];
            console.log(tranData.balancetransId);
            var donetran = false;
            stripe.balance.retrieveTransaction(
               tranData.balancetransId,
               function(err, balanceTransaction) {
                  console.log('balanceTransaction');
                  // console.log(balanceTransaction);
                  if (err) {
                     console.log("err while retrieving" + err);

                  } else if (!balanceTransaction) {
                     console.log("no transc retrieve err while retrieving");
                  }
                  else
                  {
                    console.log("do nothing");
                  }

                  if (balanceTransaction.status == "available") {
                     //console.log(totalAmounttoTransfer);
                     console.log(tranData.afterDeducAmount);
                     console.log('tranData.afterDeducAmount');
                     totalAmounttoTransfer = totalAmounttoTransfer + parseInt(tranData.afterDeducAmount);
                     console.log(totalAmounttoTransfer);
                     console.log("totalAmounttoTransfer>>>>>}}}}>>>>>>>>>");
                     console.log(j);
                     //console.log (stores[i].incomesourceDetail[j].balancetransId);

                     stores[i].incomesourceDetail.splice(j, 1);
                     stores[i].markModified("incomesourceDetail");
                     var dataSave = false;

                     stores[i].save((err, storeSaved) => {
                        if (err) {
                           tranData.notes = "failed";
                           tranData.errDetail = err.message;
                        } else {
                           tranData.notes = "Success";
                        }

                        console.log(tranData);
                        console.log("after  splicing");
                        dataOfTrans.push(tranData);
                        dataSave = true;
                        donetran = true;

                     });
                     
                     
                  } else {
                     donetran = true;
                  } // asynchronously called

               })
            require('deasync').loopWhile(function() {
               return !donetran;
            });
            console.log("count of j ends and it is" + j);
         })

         console.log(totalAmounttoTransfer);
         console.table(dataOfTrans);
         var actualtransData = [];
         for (var k in dataOfTrans) {
            var perTransactioStatus = dataOfTrans[k];
            if (perTransactioStatus.notes == "Success") {
               console.log(perTransactioStatus.balancetransId + "is eligible for transfer");
               actualtransData.push(perTransactioStatus);
               console.log(totalAmounttoTransfer);
               console.log("totalAmounttoTransfer>>>>>>>>>>>>>>");
            } else {
               totalAmounttoTransfer = totalAmounttoTransfer - parseInt(perTransactioStatus.afterDeducAmount);
               stores[i].incomesourceDetail.push(perTransactioStatus);
               console.log(totalAmounttoTransfer);
               console.log("totalAmounttoTransfer>>>>>>>>>>>>>>");
            }
         }

         console.log(totalAmounttoTransfer + "actual one");
         console.log(actualtransData.length);
         console.log('actualtransData.length');
         if (actualtransData.length > 0) {
            //console.table(actualtransData);
            // var temptransData=actualtransData[]
            var amountTotransfer = parseInt(totalAmounttoTransfer) * 100;
            stripe.transfers.create({
               amount: amountTotransfer,
               currency: "gbp",
               destination: storeData.bankAccountId,
               transfer_group: storeData.storeId
            }, function(err, transfer) {
               var notes;
               if (err) {
                  notes = err.message;
               }

               if (!transfer) {
                  notes = "transferFailed";
               } else {
                  notes = "transferSuccess";
               }

               var pay = new Payment({
                  destPayment: transfer.destination_payment,
                  dest: transfer.destination,
                  destAmount: transfer.amount,
                  desttrancId: transfer.balance_transaction,
                  desttransferId: transfer.id,
                  shopDetail: storeData._id,
                  detailOfTransfer: actualtransData,
                  notes: notes,

               })

               pay.save(function(err) {
                  if (err) {
                     console.log("no err created");
                  }

                  console.log("transfer success");
                  done = true;

               })

            });
         }

         require('deasync').loopWhile(function() {
            return !done;
         });
         console.log("count of i ends and it is");
      }

   });
}




exports.checkIfavailablebalance = (req, res) => {
   Stores.find({}, (err, stores) => {
      if (err) {
         console.log("err while retrieving" + err);
      }
      if (!stores) {
         console.log("no stores retrieve err while retrieving");
      }

      //var done = false;
      async.waterfall([
         function(callback) {
            for (var i in stores) {
               console.log("count of i start and it is" + i);
               var storeData = stores[i];
               var transactions = storeData.incomesourceDetail;
               var totalAmounttoTransfer = 0;
               var isAllStoreDone = true;
               var dataOfTrans = [];
               console.log('transactions');
               console.log(transactions.length);

               for (var j in transactions) {
                  console.log("count of j start and it is" + j);

                  var tranData=transactions[j];
                  console.log(tranData.balancetransId);
                  var donetran = false;
                stripe.balance.retrieveTransaction(
                     tranData.balancetransId,
                     function(err, balanceTransaction) {
                        console.log('balanceTransaction');
                        // console.log(balanceTransaction);
                        if (err) {
                           console.log("err while retrieving" + err);

                        } else if (!balanceTransaction) {
                           console.log("no transc retrieve err while retrieving");
                        } else {
                           console.log("do nothing");
                        }

                        if (balanceTransaction.status == "available") {
                           //console.log(totalAmounttoTransfer);
                           console.log(tranData.afterDeducAmount);
                           console.log('tranData.afterDeducAmount');
                           totalAmounttoTransfer = totalAmounttoTransfer + parseInt(tranData.afterDeducAmount);
                           console.log(totalAmounttoTransfer);
                           console.log("totalAmounttoTransfer>>>>>>>>>>>>>>");
                           console.log(j);
                           //console.log (stores[i].incomesourceDetail[j].balancetransId);

                           stores[i].incomesourceDetail.splice(j, 1);
                           stores[i].markModified("incomesourceDetail");
                           var dataSave = false;

                           stores[i].save((err, storeSaved) => {
                              if (err) {
                                 tranData.notes = "failed";
                                 tranData.errDetail = err.message;
                              } else {
                                 tranData.notes = "Success";
                              }

                              console.log(tranData);
                              console.log("after  splicing");
                              dataOfTrans.push(tranData);
                              dataSave = true;
                              donetran = true;

                           });

                        } else {
                           donetran = true;
                        } // asynchronously called

                     })

                       require('deasync').loopWhile(function() {
                         return !donetran;
                      });

                    console.log("count of j ends and it is" + j);
                  }
               console.log("count of i ends and it is" + i);
            }
            callback(null, dataOfTrans, totalAmounttoTransfer);
         },
         function(dataOfTrans, totalAmounttoTransfer, callback) {
            console.log(totalAmounttoTransfer);
            console.table(dataOfTrans);
            var actualtransData = [];
            for (var k in dataOfTrans) {
               var perTransactioStatus = dataOfTrans[k];
               if (perTransactioStatus.notes == "Success") {
                  console.log(perTransactioStatus.balancetransId + "is eligible for transfer");
                  actualtransData.push(perTransactioStatus);
                  console.log(totalAmounttoTransfer);
                  console.log("totalAmounttoTransfer>>>>>>>>>>>>>>");
               } else {
                  totalAmounttoTransfer = totalAmounttoTransfer - parseInt(perTransactioStatus.afterDeducAmount);
                  stores[i].incomesourceDetail.push(perTransactioStatus);
                  console.log(totalAmounttoTransfer);
                  console.log("totalAmounttoTransfer>>>>>>>>>>>>>>");
               }
            }

            console.log(totalAmounttoTransfer + "actual one");
            console.log(actualtransData.length);
            console.log('actualtransData.length');
            callback(null, actualtransData, totalAmounttoTransfer);
         },
         function(actualtransData, totalAmounttoTransfer, callback) {
            if (actualtransData.length > 0) {
               //console.table(actualtransData);
               // var temptransData=actualtransData[]
               var amountTotransfer = parseInt(totalAmounttoTransfer) * 100;
               stripe.transfers.create({
                  amount: amountTotransfer,
                  currency: "gbp",
                  destination: storeData.bankAccountId,
                  transfer_group: storeData.storeId
               }, function(err, transfer) {
                  var notes;
                  if (err) {
                     notes = err.message;
                  }

                  if (!transfer) {
                     notes = "transferFailed";
                  } else {
                     notes = "transferSuccess";
                  }

                  var pay = new Payment({
                     destPayment: transfer.destination_payment,
                     dest: transfer.destination,
                     destAmount: transfer.amount,
                     desttrancId: transfer.balance_transaction,
                     desttransferId: transfer.id,
                     shopDetail: storeData._id,
                     detailOfTransfer: actualtransData,
                     notes: notes,

                  })

                  pay.save(function(err) {
                     if (err) {
                        console.log("no err created");
                     }

                     console.log("transfer success");
                     done = true;

                  })

               });
            }
            callback(null, 'final result');
         }
      ], function(err, result) {
         console.log('Main Callback --> ' + result);
      });
   });
}

