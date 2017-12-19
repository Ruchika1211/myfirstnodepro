















                                 }, err => {

                        console.log(allavailabletran.length);
                        console.log(actualArraydata.length);
                        console.log('actualArraydata.length>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>');
                        store.incomesourceDetail = actualArraydata;
                  
                        store.save((err,storeSaved) => {
                            if (err) {
                                console.log('i m failed' + j);
                                 store_callback();

                            } else {
                                var filePay = `
                            All transaction end Proceeding towards transfer`;

                                fs.appendFileSync(store.id + '.txt', filePay);
                                //console.log("i m in loop tansactif");

                              console.log(transaPaydata);
                              console.log('transaPaydata>>>>>>>>>>>>>>>>>>>>>>>..>>>');    
                                if (allavailabletran.length > 0) {
                                    var amountTotransfer = parseInt(totalAmounttoTransfer) * 100;
                                    stripe.transfers.create({
                                        amount: amountTotransfer,
                                        currency: "gbp",
                                        destination: storeData.bankAccountId,
                                        transfer_group: storeData.storeId
                                    }, function(err, transfer) {
                                        var notes;
                                        if (err) {

                                            console.log(`i m in error of transfer for shop ${store.cafe_name}`);
                                            console.log(err);


                                            var filePaye = `
                                                          
                                                             Tranfer for  cafe Owner ${store.cafe_name}
                                                             Amount == ${amountTotransfer}
                                                             StoreId=${store._id}
                                                             err:${err}
                                                           
                                                              this was created at ${todaysDate}

                                                             
                                                              `
                                            fs.appendFileSync(store.id + '.txt', filePaye);
                                            console.log(transaPaydata);
                                             console.log('transactions');
                                     
                                            storeSaved.incomesourceDetail = transaPaydata;
             

                                            storeSaved.save((err, storeSavedfailedone) => {
                                              console.log(err);
                                               console.log('err indsidde');
                                                var mailOptions = {
                                                    to: helper.adminurl(),
                                                    from: 'ruchika.s@infiny.in',
                                                    subject: 'Pickcup -Regarding payouts',
                                                    text: 'Payouts transfer failed for shop ' + storeSavedfailedone.cafe_name + 'Due to following reason\n\n' +
                                                        err + '.'
                                                };
                                                helper.sendemail(mailOptions, (data) => {
                                                    notes = err;
                                                     store_callback();
                                                })

                                            });
                                        } else if (!transfer) {
                                            var filePaye = `
                                                            
                                                             Tranfer for  cafe Owner ${store.cafe_name}
                                                             Amount == ${amountTotransfer}
                                                             StoreId=${store._id}
                                                            
                                                              notransfer=yes
                                                              this was created at ${todaysDate}

                                                            
                                                              `
                                            fs.appendFileSync(store.id + '.txt', filePaye);

                                            console.log(`i m in not of transfer for shop ${store.cafe_name}`);

                                            store.incomesourceDetail = transactions;
                                           // store.markModified("incomesourceDetail");

                                            store.save((err, storeSavedfailedone) => {
                                                var mailOptions = {
                                                    to: helper.adminurl(),
                                                    from: 'ruchika.s@infiny.in',
                                                    subject: 'Pickcup - Regarding payouts',
                                                    text: 'Payouts transfer failed for shop ' + storeSavedfailedone.cafe_name + 'Due to following reason\n\n' +
                                                        err.message + '.'
                                                };
                                                helper.sendemail(mailOptions, (data) => {
                                                    notes = "transferFailed";
                                                     store_callback();
                                                })

                                            });
                                        } else {
                                            console.log(`i m in success of transfer for shop ${store.cafe_name}`);
                                            notes = "transferSuccess";
                                            var err = "no error";
                                            var todaysDate = helper.findCurrentDateinutc();
                                            var filePaye = `
                                                           e
                                                             Tranfer for  cafe Owner ${store.cafe_name}
                                                             Amount == ${amountTotransfer}
                                                             StoreId=${store._id}
                                                            
                                                              notransfer=${transfer.destination}
                                                              this was created at ${todaysDate}

                                                             
                                                              `
                                            fs.appendFileSync(store.id + '.txt', filePaye);

                                            var pay = new Payment({
                                                destPayment: transfer.destination_payment,
                                                dest: transfer.destination,
                                                destAmount: transfer.amount,
                                                desttrancId: transfer.balance_transaction,
                                                desttransferId: transfer.id,
                                                shopDetail: storeData._id,
                                                detailOfTransfer: allavailabletran,
                                                notes: notes,
                                                paymentDate: todaysDate

                                            })

                                            pay.save(function(err) {
                                                if (err) {
                                                    console.log("no err created");
                                                }

                                                console.log("transfer success");
                                                //done = true;
                                                store_callback();

                                            })
                                        }


                                    });
                                }

                            }



                        });


                        // configs is now a map of JSON data
                    });

exports.cartListing = (req, res) => {

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
         // console.log(CurrentStoreDetail);
       console.log('CurrentStoreDetail');

        });
     }
   
   // console.log(stripeCharge);
   // console.log('stripeCharge');
   // console.log(adminTax);
   // console.log('adminTax');
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
       
         // console.log(shopDetail);
         // console.log('shopDetail');
         // console.log(user);
         if (shopDetail) {
            console.log(stripeCharge);
            console.log('stripeCharge');
            console.log(adminTax);
            console.log('adminTax');
            reward
               .find({
                  "shopDetail": shopDetail
               })
               .exec(function(err, reward) {
                  // console.log("reward>>>>>>>>>>>>>>>>>");
                  // console.log(reward);
                  if (err || reward.length <= 0) {
                     canClaimedReward = "false";
                     if (!user) {
                       console.log("i m in not user");
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
                   
                     for(i in reward)
                     {
                          var enddateData = new Date(reward[i].enddate);
                           enddateData.setHours(0, 0, 0, 0);
                           var startdateData = new Date(reward[i].startdate);
                           startdateData.setHours(0, 0, 0, 0);

                            var dateDat = new Date();
                           var timezone=moment.tz.guess();
                          // console.log(moment.tz.guess());
                           var dec = moment.tz(dateDat,timezone);
                           console.log(dec);
                           console.log('dec');
                           var dateDatat = dec.utc().format('YYYY-MM-DD HH:mm:ss');

                           var dateData  = new Date(dateDatat) ;
                           console.log(dateData);
                           console.log('dateData');

                           console.log(enddateData);
                           console.log(startdateData);
                           console.log(dateData);
                           if ((enddateData >= dateData) && (startdateData <= dateData)) {

                                rewardQuantity=reward[i].quantity;
                              usersReward
                                 .findOne({
                                    "shopDetail": shopDetail,
                                    "userDetail": decoded.user._id,
                                    "rewardId": reward[i]._id
                                 })
                                 .exec(function(err, userreward) {

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
                                    console.log("i m in userreward");
                                    console.log(userClaimedrewd);
                                    console.log(canClaimedReward);



                                 })
                           }
                           
                     }

                     if(userClaimedrewd)
                     {
                         console.log("i m in userreward loop");
                          console.log(canClaimedReward);

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
                        console.log("loop else>>>>>>>>>>>>");

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
         } else {
            console.log(stripeCharge);
            console.log('stripeCharge');
            console.log(adminTax);
            console.log('adminTax');
            console.log("i m in ek");
            console.log(user);
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
                  console.log("reward>>>>>>>>>>>>>>>>>");
                  console.log(reward);
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
                          // console.log(moment.tz.guess());
                           var dec = moment.tz(dateDat,timezone);
                           console.log(dec);
                           console.log('dec');
                           var dateDatat = dec.utc().format('YYYY-MM-DD HH:mm:ss');

                           var dateData  =new Date(dateDatat) ;
                           console.log(dateData);
                           console.log('dateData');

                           console.log(enddateData);
                           console.log(startdateData);
                           console.log(dateData);

                           console.log(enddateData);
                           console.log(startdateData);
                           console.log(dateData);
                           if ((enddateData >= dateData) && (startdateData <= dateData)) {
                                rewardQuantity=reward[i].quantity;
                                  console.log('userreward before');
                            
                                 console.log('userreward');
                              usersReward
                                 .findOne({
                                    "shopDetail": user.shopDetail,
                                    "userDetail": decoded.user._id,
                                    "rewardId": reward[i]._id
                                 })
                                 .exec(function(err, userreward) {
                                 console.log(userreward);
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


                     // var enddateData = new Date(reward.enddate);
                     // enddateData.setHours(0, 0, 0, 0);
                     // var startdateData = new Date(reward.startdate);
                     // startdateData.setHours(0, 0, 0, 0);

                     // var dateData = new Date();
                     // dateData.setHours(0, 0, 0, 0);

                     // console.log(enddateData);
                     // console.log(startdateData);
                     // console.log(dateData);
                     // if ((enddateData >= dateData) && (startdateData <= dateData)) {

                     //    usersReward
                     //       .findOne({
                     //          "shopDetail": user.shopDetail._id,
                     //          "userDetail": decoded.user._id,
                     //          "rewardId": reward._id
                     //       })
                     //       .exec(function(err, userreward) {

                     //          if (err || !userreward) {
                     //             canClaimedReward = "false";
                     //          }
                     //          if (userreward) {
                     //             if (userreward.claimedReward) {
                     //                canClaimedReward = "true";
                     //             } else {
                     //                canClaimedReward = "false";
                     //             }
                     //          } else {
                     //             canClaimedReward = "false";
                     //          }

                     //          if (!user) {

                     //             return res.status(200).json({
                     //                title: 'No order in cart found for this user',
                     //                error: "true",
                     //                canClaimedReward: canClaimedReward,
                     //                adminTax: adminTax,
                     //                stripeCharge: stripeCharge

                     //             });
                     //          }

                     //          res.status(200).json({
                     //             title: 'Cart item found',
                     //             error: "false",
                     //             canClaimedReward: canClaimedReward,
                     //             data: user,
                     //             adminTax: adminTax,
                     //             stripeCharge: stripeCharge
                     //          });

                     //       })
                     // } else {
                     //    canClaimedReward = "false";
                     //    if (!user) {

                     //       return res.status(200).json({
                     //          title: 'No order in cart found for this user',
                     //          error: "true",
                     //          canClaimedReward: canClaimedReward,
                     //          adminTax: adminTax,
                     //          stripeCharge: stripeCharge

                     //       });
                     //    }

                     //    res.status(200).json({
                     //       title: 'Cart item found',
                     //       error: "false",
                     //       canClaimedReward: canClaimedReward,
                     //       data: user,
                     //       adminTax: adminTax,
                     //       stripeCharge: stripeCharge
                     //    });
                     // }

                  }

               })

            // res.status(200).json({
            //                          title: 'No order in cart found for this user',
            //                          error: "false",
            //                          canClaimedReward:false,
            //                          data: user

            //                      });

         }

      })
}
