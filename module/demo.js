















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