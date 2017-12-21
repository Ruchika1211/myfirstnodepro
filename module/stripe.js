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
   });
var bcrypt = require('bcrypt-nodejs');
var Users = require('../models/user');
var Payment = require('../models/payment');
var Stores = require('../models/cafeListing');

var jwt = require('jsonwebtoken');
var helper = require('../services/helper.js');
var async= require('async');
const fs = require('fs');


// exports.payCreateUserCards = (req, res) => {
//    var token = req.body.userToken;
//    token.trim();
//    //console.log(token);
//    //console.log('req.body>>>>>>>>>>>>.');
//    var decoded = jwt.decode(token, "pickup");
//    //console.log(decoded);
//    //console.log('decoded');

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
//                //console.log(customer.sources.data);
//                //console.log("customer");
//                return stripe.customers.createSource(customer.id, {
//                   source: req.body.stripeToken
//                });
//             }).then(function(source) {
//                //console.log(source);
//                //console.log('source');
//                var cardDetailsData = {};
//                cardDetailsData.cardId = source.id;
//                cardDetailsData.card_number = source.last4;
//                cardDetailsData.expiryMonth = source.exp_month;
//                cardDetailsData.expiryYear = source.exp_year;
//                cardDetailsData.brand = source.brand;
//                cardDetailsData.card_name = source.name;

//                //console.log(user.cardDetails.length);
//                //console.log('user.cardDetails.length');
//                if(user.cardDetails.length >=1)
//                {
//                   for(i in user.cardDetails)
//                   {
//                      var userCardData= user.cardDetails[i];
//                      //console.log(source.fingerprint);
//                      //console.log('source.fingerprint');
//                      //console.log(userCardData.fingerprint);
//                      //console.log('userCardData.fingerprint');
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
//                //console.log(err);
//                //console.log('err');
//                return res.status(500).json({
//                   title: 'An error occurred',
//                   error: "true",
//                   detail: err
//                });
//             });
//       } else {
//          //console.log("else>>>>>>");
//          stripe.customers.create({
//                "email":user.email,
//                "metadata": {
//                   "name": user.firstname + user.lastname
//                },

//             }).then(function(customer) {
//                //console.log(customer);

//                return stripe.customers.createSource(customer.id, {
//                   source: req.body.stripeToken
//                });
//             }).then(function(source) {
//                //console.log(source);
//                //console.log('source');
//                var cardDetailsData = {};
//                cardDetailsData.cardId = source.id;
//                cardDetailsData.card_number = source.last4;
//                cardDetailsData.expiryMonth = source.exp_month;
//                cardDetailsData.expiryYear = source.exp_year;
//                cardDetailsData.brand = source.brand;
//                cardDetailsData.card_name = source.name;
//                cardDetailsData.isPrimary = true;
//                //console.log(source.fingerprint);
//                      //console.log('source.fingerprint');
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
//                //console.log(err);
//                //console.log('err');
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
   //console.log(token);
   //console.log('req.body>>>>>>>>>>>>.');
   var decoded = jwt.decode(token, "pickup");
   //console.log(decoded);
   //console.log('decoded');

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


     if (parseInt(user.isBlocked) == 1) {
            return res.status(200).json({
                title: 'You are blocked.Please contact admin',
                error: "true",
                detail: "invalid Login"
            });
        }

      if (user.stripeId) {
         stripe.customers.update(user.stripeId, {
               description: "Customer id is " + user.stripeId
            })
            .then(function(customer) {
               // //console.log(customer.sources.data);
               // //console.log("customer");
               return stripe.customers.createSource(customer.id, {
                  source: req.body.stripeToken
               });
            }).then(function(source) {
               //console.log(source);
               //console.log('source');
               //console.log(user.cardDetails.length);
                // var cardDetailsData = {};
               //console.log('user.cardDetails.length');
               if(user.cardDetails.length >=1)
                {
                   var NofingerprintMatch=false;
                  for(i in user.cardDetails)
                  {
                     var userCardData= user.cardDetails[i];
                     //console.log(source.fingerprint);
                     //console.log('source.fingerprint');
                     //console.log(userCardData.fingerprint);
                     //console.log('userCardData.fingerprint');
                     if(userCardData.fingerprint == source.fingerprint)
                     {
                        // //console.log(userCardData.fingerprint);
                     //console.log('userCardData.fingerprint fingerprint match');
                          NofingerprintMatch=true;
                          break;
                          // return stripe.customers.deleteCard(
                          //  user.stripeId,
                          //  source.id)
                     }

                  }

                  if(!NofingerprintMatch)
                  {
                       //console.log('userCardData.fingerprint fingerprint not match');
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
                     cardDetailsData.isEuropean=helper.europeanCountry(source.country);

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

                         //console.log("i m in confirmation");
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
                              //console.log(err);
                              //console.log('err');
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
                     //console.log('userCardData length less than one');
                    
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
                     cardDetailsData.isEuropean=helper.europeanCountry(source.country);

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
                              //console.log(err);
                              //console.log('err');
                              return res.status(500).json({
                                 title: 'An error occurred',
                                 error: "true",
                                 detail: err
                              });
                            });

            
      } else {
         //console.log("else>>>>>>");
         stripe.customers.create({
               "email":user.email,
               "metadata": {
                  "name": user.firstname + user.lastname
               },

            }).then(function(customer) {
               //console.log(customer);

               return stripe.customers.createSource(customer.id, {
                  source: req.body.stripeToken
               });
            }).then(function(source) {
               //console.log(source);
               //console.log('source');
               var cardDetailsData = {};
               cardDetailsData.cardId = source.id;
               cardDetailsData.card_number = source.last4;
               cardDetailsData.expiryMonth = source.exp_month;
               cardDetailsData.expiryYear = source.exp_year;
               cardDetailsData.brand = source.brand;
               cardDetailsData.card_name = source.name;
               cardDetailsData.isPrimary = true;
               cardDetailsData.isEuropean=helper.europeanCountry(source.country);
               //console.log(source.fingerprint);
                     //console.log('source.fingerprint');
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
               //console.log(err);
               //console.log('err');
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
   //console.log(req.body);
   //console.log('req.body>>>>>>>>>>>>.');
   var decoded = jwt.decode(token, "pickup");
   //console.log(decoded);
   //console.log('decoded');

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


      if (parseInt(user.isBlocked) == 1) {
            return res.status(200).json({
                title: 'You are blocked.Please contact admin',
                error: "true",
                detail: "invalid Login"
            });
        }

      //console.log(user);
      //console.log('user');

      res.status(200).json({
         title: 'primarly card details changed successfully',
         error: "false",
         user: user

      });

   })
}

var checkIfduplicates = function(alldata, data) {
   //console.log("i  m in checkIfduplicates ");
   // //console.log(alldata);
   // //console.log(data);
   var datatemp = {};
   datatemp.present = false;
   for (i in alldata) {
      // //console.log("i");
      // //console.log(alldata[i].cardId);
      // //console.log(data);
      if (alldata[i].cardId == data) {
         //console.log("found card");
         datatemp.present = true;
         datatemp.obj = alldata[i];
         return datatemp;
      }

   }

   return datatemp;
}

exports.deletecard = (req, res) => {
   var token = req.body.userToken;
   //console.log(req.body);
   //console.log('req.body>>>>>>>>>>>>.');
   var decoded = jwt.decode(token, "pickup");
   //console.log(decoded);
   //console.log('decoded');

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


      if (parseInt(user.isBlocked) == 1) {
            return res.status(200).json({
                title: 'You are blocked.Please contact admin',
                error: "true",
                detail: "invalid Login"
            });
      }

      var cardPresent = checkIfduplicates(user.cardDetails, req.body.cardId);
      //console.log('cardPresent');
      //console.log(cardPresent);
      var IsPrimary = cardPresent.obj.isPrimary;
      //console.log('IsPrimary');
      //console.log(IsPrimary);
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

                  //console.log(confirmation);
                  //console.log('confirmation');

                  var arrayofToken = user.cardDetails;
                  var index = arrayofToken.indexOf(cardPresent.obj);
                  //console.log(index);
                  //console.log('index');
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
                                 //console.log('user');
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
                           //console.log('user');
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

      // //console.log(user);
      // //console.log('user');

      //       res.status(200).json({
      //           title: 'primarly card details changed successfully',
      //           error: "false",
      //           user:user

      //       });

   })
}

exports.payMakePrimary = (req, res) => {
   var token = req.body.userToken;
   //console.log(req.body);
   //console.log('req.body>>>>>>>>>>>>.');
   var decoded = jwt.decode(token, "pickup");
   //console.log(decoded);
   //console.log('decoded');

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


      if (parseInt(user.isBlocked) == 1) {
            return res.status(200).json({
                title: 'You are blocked.Please contact admin',
                error: "true",
                detail: "invalid Login"
            });
        }

      if (user.stripeId) {
         stripe.customers.update(user.stripeId, {
               description: "Customer id is " + user.stripeId,
               default_source: req.body.makePrimaryId
            })
            .then(function(customer) {
               //console.log(customer.default_source);
               //console.log(req.body.makePrimaryId);
               //console.log("customer");
               if (customer.default_source == req.body.makePrimaryId) {
                  for (i in user.cardDetails) {

                     var cardData = user.cardDetails[i];
                     //console.log(cardData.cardId);
                     //console.log(customer.default_source);
                     //console.log(cardData.cardId == customer.default_source);
                     if (cardData.cardId == customer.default_source) {
                        user.cardDetails[i].isPrimary = true;
                     } else {
                        user.cardDetails[i].isPrimary = false;
                     }

                  }

                  user.save(function(err, userdata) {
                     //console.log('user');
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
                //console.log("error");
         //console.log(err);
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


   var decoded = jwt.decode(token, "pickup");
  

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
         // //console.log(user);
         // //console.log('user');
         stripe.customers.retrieve(
               user.stripeId
            ).then(function(customer) {
               // //console.log(customer);
                 
                    //fs.appendFileSync(store.id + '.txt', filePay);
               //console.log('customer');
               var defaultSource = customer.default_source;
               //console.log(user.cardDetails.length);
               //console.log('user.cardDetails.length');
               var loopData=user.cardDetails;
                var notAPrimaryCard=false;
               for(i in loopData) {
                  var cardData = loopData[i];
                  // //console.log(cardData.cardId);
                  // //console.log(defaultSource);
                  // //console.log('defaultSource');
                 
                  if (cardData.cardId == defaultSource) {
                       //console.log('defaultSource  if');

                     if (cardData.isPrimary) {
                        notAPrimaryCard=true;
                                //console.log('defaultSource  if if');
                        var totalAmount = parseFloat(amountpaid) * 100;

                        return stripe.charges.create({
                           amount: parseInt(totalAmount),
                           currency: 'gbp',
                           customer: user.stripeId

                        });
                        break;
                     } else {
                          //console.log('defaultSource  if else');
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
                var filePay = `
                       ${'///////////////////////'}
                       userPayingcharge:${user.email}
                       totalAmount:::::${totalAmount}
                       err:${err}
                        ${'///////////////////////'}`;
                    fs.appendFileSync(user.stripeId + '.txt', filePay);
               //console.log("err");
               //console.log(err);
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




// exports.checkIfavailablebalance = (req, res) => {
//    Stores.find({}, (err, stores) => {
//       if (err) {
//          //console.log("err while retrieving" + err);
//       }
//       if (!stores) {
//          //console.log("no stores retrieve err while retrieving");
//       }

//       //var done = false;
//       for (var i in stores) {
//          //console.log("count of i start and it is" + i);
//          var storeData = stores[i];
//          var transactions = storeData.incomesourceDetail;
//          var totalAmounttoTransfer = 0;
//          var isAllStoreDone = true;
//          var dataOfTrans = [];
//          //console.log('transactions');
//          //console.log(transactions.length);
//          transactions.forEach(function(tranData, j) {
//             // for(j in  transactions)
//             // {  
//             //console.log("count of j start and it is" + j);

//             //var tranData=transactions[j];
//             //console.log(tranData.balancetransId);
//             var donetran = false;
//             stripe.balance.retrieveTransaction(
//                tranData.balancetransId,
//                function(err, balanceTransaction) {
//                   //console.log('balanceTransaction');
//                   // //console.log(balanceTransaction);
//                   if (err) {
//                      //console.log("err while retrieving" + err);

//                   } else if (!balanceTransaction) {
//                      //console.log("no transc retrieve err while retrieving");
//                   }
//                   else
//                   {
//                     //console.log("do nothing");
//                   }

//                   if (balanceTransaction.status == "available") {
//                      ////console.log(totalAmounttoTransfer);
//                      //console.log(tranData.afterDeducAmount);
//                      //console.log('tranData.afterDeducAmount');
//                      totalAmounttoTransfer = totalAmounttoTransfer + parseInt(tranData.afterDeducAmount);
//                      //console.log(totalAmounttoTransfer);
//                      //console.log("totalAmounttoTransfer>>>>>}}}}>>>>>>>>>");
//                      //console.log(j);
//                      ////console.log (stores[i].incomesourceDetail[j].balancetransId);

//                      stores[i].incomesourceDetail.splice(j, 1);
//                      stores[i].markModified("incomesourceDetail");
//                      var dataSave = false;

//                      stores[i].save((err, storeSaved) => {
//                         if (err) {
//                            tranData.notes = "failed";
//                            tranData.errDetail = err.message;
//                         } else {
//                            tranData.notes = "Success";
//                         }

//                         //console.log(tranData);
//                         //console.log("after  splicing");
//                         dataOfTrans.push(tranData);
//                         dataSave = true;
//                         donetran = true;

//                      });
                     
                     
//                   } else {
//                      donetran = true;
//                   } // asynchronously called

//                })
//             require('deasync').loopWhile(function() {
//                return !donetran;
//             });
//             //console.log("count of j ends and it is" + j);
//          })

//          //console.log(totalAmounttoTransfer);
//          console.table(dataOfTrans);
//          var actualtransData = [];
//          for (var k in dataOfTrans) {
//             var perTransactioStatus = dataOfTrans[k];
//             if (perTransactioStatus.notes == "Success") {
//                //console.log(perTransactioStatus.balancetransId + "is eligible for transfer");
//                actualtransData.push(perTransactioStatus);
//                //console.log(totalAmounttoTransfer);
//                //console.log("totalAmounttoTransfer>>>>>>>>>>>>>>");
//             } else {
//                totalAmounttoTransfer = totalAmounttoTransfer - parseInt(perTransactioStatus.afterDeducAmount);
//                stores[i].incomesourceDetail.push(perTransactioStatus);
//                //console.log(totalAmounttoTransfer);
//                //console.log("totalAmounttoTransfer>>>>>>>>>>>>>>");
//             }
//          }

//          //console.log(totalAmounttoTransfer + "actual one");
//          //console.log(actualtransData.length);
//          //console.log('actualtransData.length');
//          if (actualtransData.length > 0) {
//             //console.table(actualtransData);
//             // var temptransData=actualtransData[]
//             var amountTotransfer = parseInt(totalAmounttoTransfer) * 100;
//             stripe.transfers.create({
//                amount: amountTotransfer,
//                currency: "gbp",
//                destination: storeData.bankAccountId,
//                transfer_group: storeData.storeId
//             }, function(err, transfer) {
//                var notes;
//                if (err) {
//                   notes = err.message;
//                }

//                if (!transfer) {
//                   notes = "transferFailed";
//                } else {
//                   notes = "transferSuccess";
//                }

//                var pay = new Payment({
//                   destPayment: transfer.destination_payment,
//                   dest: transfer.destination,
//                   destAmount: transfer.amount,
//                   desttrancId: transfer.balance_transaction,
//                   desttransferId: transfer.id,
//                   shopDetail: storeData._id,
//                   detailOfTransfer: actualtransData,
//                   notes: notes,

//                })

//                pay.save(function(err) {
//                   if (err) {
//                      //console.log("no err created");
//                   }

//                   //console.log("transfer success");
//                   done = true;

//                })

//             });
//          }

//          require('deasync').loopWhile(function() {
//             return !done;
//          });
//          //console.log("count of i ends and it is");
//       }

//    });
// }




// exports.checkIfavailablebalance = (req, res) => {
//    Stores.find({}, (err, stores) => {
//       if (err) {
//          //console.log("err while retrieving" + err);
//       }
//       if (!stores) {
//          //console.log("no stores retrieve err while retrieving");
//       }
//       async.forEachOf(stores, (store, i, store_callback) => {

//                 var filePay=`
//                 ${'///////////'}
//                  Store Name: ${store.cafe_name};`
               
//                 fs.appendFileSync(store.id + '.txt', filePay);
                                       
          

          
//               if(store.bankAccountId)
//                  {
//                   if(store.accountStatus == 'verified')
//                   {       
//                             var filePay=`Status:::verified and have accountID`;
//                              fs.appendFileSync(store.id + '.txt', filePay);
                    
//                            var storeData = store;
//                            var transactions = storeData.incomesourceDetail;
//                            var totalAmounttoTransfer = 0;
//                            var isAllStoreDone = true;
//                            var dataOfTrans = [];
//                            var trLen=transactions.length;
                           
//                            async.forEachOf(transactions, (transaction, j, tr_callback) => {
                           
//                                 var filePay=`TotalTransaclength:::${trLen}
//                                 TranscloopNo:::::${j}
//                                 TranscNo:::::${transaction.balancetransId}`;
//                                 fs.appendFileSync(store.id + '.txt', filePay);
                            
//                                 var tranData=transaction;
                    
//                                   var donetran = false;
//                                   stripe.balance.retrieveTransaction(
//                                        tranData.balancetransId,
//                                        function(err, balanceTransaction) {
//                                        //console.log(tranData.balancetransId);
//                                           if (err) {
//                                               //console.log(j);
//                                                    //console.log(">>>>>>>>>j>>>>>>>>>>>");
//                                               var filePay=`TransaStatus:::This trans failed due to.
//                                               reason:::::${err}`;
//                                               fs.appendFileSync(store.id + '.txt', filePay);
                                          
//                                              //console.log("err while retrieving" + err);
//                                                tr_callback();

//                                           } else if (!balanceTransaction) {
//                                              var filePay=`TransaStatus:::This trans failed due to no data`
                                              
//                                               fs.appendFileSync(store.id + '.txt', filePay);
//                                            // tr_callback();
//                                              //console.log("no transc retrieve err while retrieving");
//                                                tr_callback();
//                                           } else {

//                                                 if (balanceTransaction.status == "available") {
//                                                      var filePay=`TransaStatus:::Success and available.`;
                                                    
//                                                     fs.appendFileSync(store.id + '.txt', filePay);
//                                                    //console.log(tranData.afterDeducAmount);
//                                                    //console.log('tranData.afterDeducAmount');
//                                                    totalAmounttoTransfer = totalAmounttoTransfer + parseFloat(tranData.afterDeducAmount);
//                                                    // //console.log(totalAmounttoTransfer);
//                                                    // //console.log("totalAmounttoTransfer>>>>>>>>>>>>>>");
//                                                    //console.log(j);
//                                                    //console.log(">>>>>>>>>j>>>>>>>>>>>");

//                                                    var dataofIncome=store.incomesourceDetail;
//                                                       console.table(dataofIncome);
//                                                    var indexofData=dataofIncome.indexOf(transaction);
//                                                     //console.log(indexofData);
//                                                    var actualArraydata=dataofIncome.splice(indexofData, 1);
//                                                       console.table(dataofIncome);
//                                                    store.incomesourceDetail=actualArraydata;
//                                                    store.markModified("incomesourceDetail");

//                                                    store.save((err, storeSaved) => {
//                                                       if (err) {
//                                                         //console.log('i m failed'+j);
//                                                          tranData.notes = "failed";
//                                                          tranData.errDetail = err.message;
//                                                          dataOfTrans.push(tranData);
//                                                          tr_callback();
//                                                       }
//                                                       else if(!storeSaved){
//                                                         //console.log('i m in not success'+ j);
//                                                          tranData.notes = "failed";
//                                                          dataOfTrans.push(tranData);
//                                                          tr_callback();
//                                                       }
//                                                       else {
//                                                         //console.log(storeSaved.cafe_name);
//                                                         //console.log(storeSaved.incomesourceDetail.length);
//                                                         //console.log('storeSaved.cafe_name');
//                                                         //console.log('i m in success'+ j);
//                                                          tranData.notes = "Success";
//                                                          dataOfTrans.push(tranData);
                                                      
//                                                          tr_callback();
//                                                       }

//                                                       // //console.log(tranData);
//                                                       // //console.log("after  splicing");
                                                      
//                                                    });

//                                                 } else {
//                                                    var filePay=`TransaStatus:::Success and not  available.`;
                                                    
//                                                     fs.appendFileSync(store.id + '.txt', filePay);
//                                                   tr_callback();
//                                                 }
//                                           }

                                         

//                                       }
//                                   );
                               
//                             //console.log("count of j end and it is" + j);

//                            }, err => {
//                                  var filePay=`
//                                  All transaction end Proceeding towards transfer`;
                                                    
//                                fs.appendFileSync(store.id + '.txt', filePay);
//                                ////console.log("i m in loop tansactif");
//                                 if (err) console.error(err.message);
//                                 // //console.log(totalAmounttoTransfer);
//                                 // console.table(dataOfTrans);
//                                 // tr_callback();
//                                  var actualtransData = [];
//                                 for (var k in dataOfTrans) {
//                                    var perTransactioStatus = dataOfTrans[k];
//                                    if (perTransactioStatus.notes == "Success") {
//                                       //console.log(perTransactioStatus.balancetransId + "is eligible for transfer");
//                                       actualtransData.push(perTransactioStatus);
                                      
//                                    } else {
//                                       totalAmounttoTransfer = totalAmounttoTransfer - parseInt(perTransactioStatus.afterDeducAmount);
//                                       stores[i].incomesourceDetail.push(perTransactioStatus);
                                   
//                                    }
//                                 }
//                                 //console.log(totalAmounttoTransfer + "actual one");
//                                 //console.log(actualtransData.length);
//                                 //console.log('actualtransData.length');
//                                 if (actualtransData.length > 0) {
//                                   var amountTotransfer = parseInt(totalAmounttoTransfer) * 100;
//                                    stripe.transfers.create({
//                                       amount: amountTotransfer,
//                                       currency: "gbp",
//                                       destination: storeData.bankAccountId,
//                                       transfer_group: storeData.storeId
//                                    }, function(err, transfer) {
//                                       var notes;
//                                       if (err) {

//                                            //console.log(`i m in error of transfer for shop ${store.cafe_name}`);
//                                            //console.log(err);
                                        

//                                             var filePaye=`
                                        
//                                            Tranfer for  cafe Owner ${store.cafe_name}
//                                            Amount == ${amountTotransfer}
//                                            StoreId=${store._id}
//                                            err:${err}
                                         
//                                             this was created at ${todaysDate}

                                           
//                                             `
//                                            fs.appendFileSync(store.id + '.txt', filePaye);
                                       
                                        
//                                         store.incomesourceDetail=store.incomesourceDetail.concat(transactions);
//                                           store.markModified("incomesourceDetail");

//                                             store.save((err, storeSavedfailedone) => {
//                                                 var mailOptions = {
//                                                                 to: helper.adminurl(),
//                                                                 from: 'ruchika.s@infiny.in',
//                                                                 subject: 'Pickcup -Regarding payouts',
//                                                                 text: 'Payouts transfer failed for shop '+ storeSavedfailedone.cafe_name +'Due to following reason\n\n' +
//                                                                     err + '.'
//                                                             };
//                                                  helper.sendemail(mailOptions,(data)=>{
//                                                    notes = err;
//                                                  })
                                                
//                                             });
//                                       }
//                                       else if (!transfer) {
//                                              var filePaye=`
                                          
//                                            Tranfer for  cafe Owner ${store.cafe_name}
//                                            Amount == ${amountTotransfer}
//                                            StoreId=${store._id}
                                          
//                                             notransfer=yes
//                                             this was created at ${todaysDate}

                                          
//                                             `
//                                            fs.appendFileSync(store.id + '.txt', filePaye);
                                       
//                                            //console.log(`i m in not of transfer for shop ${store.cafe_name}`);
                                         
//                                           store.incomesourceDetail=store.incomesourceDetail.concat(transactions);
//                                           store.markModified("incomesourceDetail");

//                                             store.save((err, storeSavedfailedone) => {
//                                                   var mailOptions = {
//                                                                 to: helper.adminurl(),
//                                                                 from: 'ruchika.s@infiny.in',
//                                                                 subject: 'Pickcup - Regarding payouts',
//                                                                 text: 'Payouts transfer failed for shop '+ storeSavedfailedone.cafe_name +'Due to following reason\n\n' +
//                                                                     err.message + '.' 
//                                                             };
//                                                  helper.sendemail(mailOptions,(data)=>{
//                                                   notes = "transferFailed";
//                                                  })
                                                
//                                             });
//                                       } else {
//                                         //console.log(`i m in success of transfer for shop ${store.cafe_name}`);
//                                          notes = "transferSuccess";
//                                           var err="no error";
//                                            var todaysDate=helper.findCurrentDateinutc();
//                                            var filePaye=`
//                                          e
//                                            Tranfer for  cafe Owner ${store.cafe_name}
//                                            Amount == ${amountTotransfer}
//                                            StoreId=${store._id}
                                          
//                                             notransfer=${transfer.destination}
//                                             this was created at ${todaysDate}

                                           
//                                             `
//                                            fs.appendFileSync(store.id + '.txt', filePaye);
                                       
//                                         var pay = new Payment({
//                                            destPayment: transfer.destination_payment,
//                                            dest: transfer.destination,
//                                            destAmount: transfer.amount,
//                                            desttrancId: transfer.balance_transaction,
//                                            desttransferId: transfer.id,
//                                            shopDetail: storeData._id,
//                                            detailOfTransfer: actualtransData,
//                                            notes: notes,
//                                            paymentDate:todaysDate

//                                         })

//                                         pay.save(function(err) {
//                                            if (err) {
//                                               //console.log("no err created");
//                                            }

//                                            //console.log("transfer success");
//                                            //done = true;
//                                            store_callback();

//                                         })
//                                       }
                                        

//                                    });
//                                }

                                
//                                 // configs is now a map of JSON data
//                            });
//                   }
//                   else
//                   {   
//                        var filePay=`Status:::not verified and have accountID`;
//                        fs.appendFileSync(store.id + '.txt', filePay);
//                       //console.log("do nothing account else");
//                       store_callback();
//                   }
//                 }
//                 else
//                 {
//                   var filePay=`Status:::no accountID`;
//                   fs.appendFileSync(store.id + '.txt', filePay);
//                   //console.log("do nothing>>>>>>>>>>>>>>.no account");
//                      store_callback();
//                 }

       
//       }, err => {
//          //console.log("i m in loop end");
//           if (err) console.error(err.message);
//          // var filePay=`${'///////////'}`
//          // fs.appendFileSync(store.id + '.txt', filePay);
          
//           // configs is now a map of JSON data
//       });
//    });
// }

exports.checkIfavailablebalance = (req,res) => {
  Stores.find( {}, ( err, stores ) => {
    if ( err ) {
      //console.log( "err while retrieving" + err );
    }
    if ( !stores ) {
      //console.log( "no stores retrieve err while retrieving" );
    }
    async.forEachOf( stores, ( store, i, store_callback ) => {
      var filePay =
        `
        ${'///////////'}
        Store Name: ${store.cafe_name};`
      fs.appendFileSync( store.id + '.txt', filePay );
      if ( store.bankAccountId ) {
        if ( store.accountStatus == 'verified' ) {
          var filePay =
            `
          Status:::verified and have accountID`;
          fs.appendFileSync( store.id + '.txt', filePay );
          var storeData = store;
          var transactions = storeData.incomesourceDetail;
          var transaPaydata = store.incomesourceDetail;
          //console.log( transaPaydata.length );
          //console.log( 'transaPaydata.length' );
          var totalAmounttoTransfer = 0;
          var isAllStoreDone = true;
          var dataOfTrans = [];
          var trLen = transactions.length;
          var dataofIncome = store.incomesourceDetail;
          var actualArraydata;
          var allavailabletran = [];
          async.forEachOf( transactions, ( transaction, j, tr_callback ) => {
            var filePay =
              `
            TotalTransaclength:::${trLen}
            TranscloopNo:::::${j}
            TranscNo:::::${transaction.balancetransId}`;
            fs.appendFileSync( store.id + '.txt', filePay );
            var tranData = transaction;
            var donetran = false;
            if(tranData.remarks == 'Success')
            {
               stripe.balance.retrieveTransaction( tranData.balancetransId
              , function( err, balanceTransaction ) {
                //console.log( tranData.balancetransId );
                if ( err ) {
                  //console.log( j );
                  //console.log( ">>>>>>>>>j>>>>>>>>>>>" );
                  var filePay =
                    `
                  TransaStatus:::${j} trans failed due to.
                  reason:::::${err}`;
                  fs.appendFileSync( store.id + '.txt', filePay );
                  //console.log( "err while retrieving" + err );
                  actualArraydata = dataofIncome;
                  tr_callback();
                } else if ( !balanceTransaction ) {
                  var filePay =
                    `
                  TransaStatus:::${j} trans failed due to no data`
                  fs.appendFileSync( store.id + '.txt', filePay );
                  // tr_callback();
                  //console.log( "no transc retrieve err while retrieving" );
                  actualArraydata = dataofIncome;
                  tr_callback();
                } else {
                  if ( balanceTransaction.status == "available" ) {
                    var filePay =
                      `
                    TransaStatus:::Success and available.`;
                    fs.appendFileSync( store.id + '.txt', filePay );
                    // //console.log(tranData.afterDeducAmount);
                    // //console.log('tranData.afterDeducAmount');
                    totalAmounttoTransfer = totalAmounttoTransfer + parseFloat(
                      tranData.afterDeducAmount );
                    // //console.log(totalAmounttoTransfer);
                    // //console.log("totalAmounttoTransfer>>>>>>>>>>>>>>");
                    //console.log( j );
                    //console.log( ">>>>>>>>>j>>>>>>>>>>>if" );
                    //console.table(dataofIncome);
                    var indexofData = dataofIncome.indexOf( transaction );
                    //console.log( indexofData );
                    if ( indexofData == -1 ) {
                      //console.log( "fo" );
                      actualArraydata = dataofIncome;
                      tr_callback();
                    } else {
                      allavailabletran.push( transaction );
                      actualArraydata = dataofIncome.splice( indexofData, 1 );
                      //console.table('dataofIncome after splice');   
                      //console.table(dataofIncome);
                      actualArraydata = dataofIncome;
                      // console.table(actualArraydata);
                      tr_callback();
                    }
                  } else {
                    //console.log( j );
                    actualArraydata = dataofIncome;
                    //console.log( ">>>>>>>>>j>>>>>>>>>>>else" );
                    var filePay =
                      `
                     TransaStatus:::Success and not  available.`;
                    fs.appendFileSync( store.id + '.txt', filePay );
                    tr_callback();
                  }
                }
              } );
            }
            else
            {
                tr_callback();
            }
           
            //console.log( "count of j end and it is" + j );
          }, err => {
            var filePay =
              `
            All transaction end Proceeding towards transfer`;
            fs.appendFileSync( store.id + '.txt', filePay );
            stripe.balance.retrieve( function( err, balance ) {
              if (err) {
                var filePay=`Error while retrieving balance :::${err}`;
                 fs.appendFileSync( store.id + '.txt', filePay );
              } 
              else if (!balance) {
                var filePay=`Error while retrieving balance :::no error`;
                 fs.appendFileSync( store.id + '.txt', filePay );
              }
              else {
                var stripeAvailableAmount = balance.available[0].amount;
                var net_Amount = parseInt( totalAmounttoTransfer );
                var amountTotransfer = parseInt( totalAmounttoTransfer ) * 100;
                //console.log(stripeAvailableAmount >= net_Amount && allavailabletran.length >
                  0);
                //console.log(amountTotransfer);
                 //console.log(stripeAvailableAmount);
                 //console.log('amountTotransfer::::::::::::::::::::::::::::::::::::');
                  var filePayDAta=`amountTotransfer::::${amountTotransfer}
                  netAmount::::${net_Amount}
                  stripeAvailableAmount::::${stripeAvailableAmount}`;
                    fs.appendFileSync( store.id + '.txt', filePayDAta );
                if (stripeAvailableAmount >= net_Amount && allavailabletran.length >
                  0 ) {
                  stripe.transfers.create({
                    amount: amountTotransfer
                    , currency: "gbp"
                    , destination: storeData.bankAccountId
                    , transfer_group: storeData.storeId
                  }, function( err, transfer ) {
                    var notes;
                    if ( err ) {
                      //console.log(
                        `i m in error of transfer for shop ${store.cafe_name}` );
                      //console.log( err );
                      var filePaye =
                        `
                                                
                         Tranfer for  cafe Owner ${store.cafe_name}
                         Amount == ${amountTotransfer}
                         StoreId=${store._id}
                         err:${err}
                       
                          this was created at ${todaysDate}

                         
                          `
                      fs.appendFileSync( store.id + '.txt', filePaye );
                      // //console.log(transaPaydata);
                      //  //console.log('transactions');
                      //console.log( err.message );
                      //console.log( 'err indsidde' );
                      var mailOptions = {
                        to: helper.adminurl()
                        , from:helper.adminMailFrom()
                        , subject: 'Pickcup -Regarding payouts'
                        , text: 'Payouts transfer failed for shop ' + store.cafe_name +
                          'Due to following reason\n\n' + err.message + '.'
                      };
                      helper.sendemail( mailOptions, ( data ) => {
                        notes = err;
                        store_callback();
                      } )
                    } else if ( !transfer ) {
                      var filePaye =
                        `
                                                  
                         Tranfer for  cafe Owner ${store.cafe_name}
                         Amount == ${amountTotransfer}
                         StoreId=${store._id}
                        
                          notransfer=yes
                          this was created at ${todaysDate}

                        
                          `
                      fs.appendFileSync( store.id + '.txt', filePaye );
                      //console.log(
                        `i m in not of transfer for shop ${store.cafe_name}` );
                      var mailOptions = {
                        to: helper.adminurl()
                        , from: 'ruchika.s@infiny.in'
                        , subject: 'Pickcup - Regarding payouts'
                        , text: 'Payouts transfer failed for shop ' + store.cafe_name +
                          'Due to following reason\n\n' + err.message + '.'
                      };
                      helper.sendemail( mailOptions, ( data ) => {
                        notes = "transferFailed";
                        store_callback();
                      } )
                    } else {
                      //console.log(
                        `i m in success of transfer for shop ${store.cafe_name}`
                      );
                      notes = "transferSuccess";
                      var err = "no error";
                      var todaysDate = helper.findCurrentDateinutc();
                      var filePaye =
                        `
                                                 
                           Tranfer for  cafe Owner ${store.cafe_name}
                           Amount == ${amountTotransfer}
                           StoreId=${store._id}
                          
                            notransfer=${transfer.destination}
                            this was created at ${todaysDate}

                                                   
                                                    `
                      fs.appendFileSync( store.id + '.txt', filePaye );
                      var pay = new Payment( {
                        destPayment: transfer.destination_payment
                        , dest: transfer.destination
                        , destAmount: transfer.amount
                        , desttrancId: transfer.balance_transaction
                        , desttransferId: transfer.id
                        , shopDetail: storeData._id
                        , detailOfTransfer: allavailabletran
                        , notes: notes
                        , paymentDate: todaysDate
                      } )
                      pay.save( function( err ) {
                        if ( err ) {
                          //console.log( "no err created" );
                        }
                        //console.log( allavailabletran.length );
                        //console.log( actualArraydata.length );
                        //console.log(
                          'actualArraydata.length>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>'
                        );
                        store.incomesourceDetail = actualArraydata;
                        store.save( ( err, storeSaved ) => {
                          if ( err ) {
                            //console.log( 'i m failed' + j );
                            store_callback();
                          } else {
                            var filePay =
                              `
                                                  Store updated for this user 
                                                  ${'//////////////////////'}`;
                            fs.appendFileSync( store.id + '.txt', filePay );
                            store_callback();
                          }
                        } )
                        ////console.log("transfer success");
                        //done = true;
                        //store_callback();
                      } )
                    }
                  } );
                }
                 else {

                  if(stripeAvailableAmount <= net_Amount)
                  {
                                    var mailOptions = {
                                      to: store.storeId,
                                      from: helper.adminMailFrom(),
                                      subject: 'Pickcup Payout Failed',
                                      text: '\n\n'+
                                            'This is to inform you that payout transfer to'+store.cafe_name+
                                            'failed due to insufficient balance in your account.' 
                                          
                                  };
                            helper.sendemail(mailOptions,(data)=>{
                                var msg="transfer failed.";
                                        store_callback();
                               // helper.sendNotification(coffeeShopData.deviceToken,'bankStatus', msg, (cb) => {
                               //    //console.log("message send");
                               //    res.send(200);
                               //  },coffeeShopData.accountStatus);
                            })
                  }
                  else
                  {

                     store_callback();
                  }

                 }
              }
            });

          });
            // configs is now a map of JSON data
        
        } else {
          var filePay = `Status:::not verified and have accountID`;
          fs.appendFileSync( store.id + '.txt', filePay );
          //console.log( "do nothing account else" );
          store_callback();
        }
      } else {
        var filePay = `Status:::no accountID`;
        fs.appendFileSync( store.id + '.txt', filePay );
        //console.log( "do nothing>>>>>>>>>>>>>>.no account" );
        store_callback();
      }
    }, err => {
      //console.log( "i m in loop end" );
      if ( err ) console.error( err.message );
      res.status(200).json({
          data: "sucess"
        });
      // var filePay=`${'///////////'}`
      // fs.appendFileSync(store.id + '.txt', filePay);
      // configs is now a map of JSON data
    });
  } );
}