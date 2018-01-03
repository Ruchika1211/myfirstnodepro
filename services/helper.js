var FCM = require('fcm-push');


var User =  require('../models/user');
var Stores = require('../models/cafeListing');
var notification = require('../models/notification');
var helper = require('../services/helper.js');
var nodemailer = require('nodemailer');

var smtpTransport = nodemailer.createTransport({
    secureConnection: false,
    service: "gmail",
    host: "smtp.gmail.com",
    port: 587,
    requiresAuth: true,
    auth: {
        user: process.env.mail_username,
        pass: process.env.mail_password
    }
});

var moment = require('moment-timezone');
var serverKey = process.env.serverKey;
var fcm = new FCM(serverKey);

console.log(process.env.mail_username);
console.log(process.env.mail_password);
console.log('serverKey');

  // var amountTotransferShopowner=function(totalPrice){

  //      var sellingPrice=totalPrice;
  //       var totalStripeCharges=helper.stripeCharges();
  //       var percentStripecharge=totalStripeCharges.percentCharge+(totalStripeCharges.additional/100);
  //       var percentUsercharges=helper.adminChargesforUser();
  //       var percentshopcharges=helper.adminChargesforshop();
  //       var costPrice=(100/(100+(percentStripecharge+percentUsercharges+percentshopcharges)))*sellingPrice;
  //       console.log(costPrice);
  //       return costPrice
       

    // };

       var adminChargesforUser=function(){
        var data={};
        data.below_5_pound=0.4;
         data.below_10_pound=0.5;
          return data
         };
         
         var adminChargesforshop=function(){
          return '1'
         };

        var  stripeCharges=function(){
          var totalCharges={};
          totalCharges.percentCharge=2.9
          totalCharges.additional=0.2
          return totalCharges
         };

        // var   adminMailFrom=function(){
        //   return 'ruchika.s@infiny.in'
        //  }

module.exports = {

         // url:function(){
         // 	return 'http://dev2.infiny.in:3000'
         // },

          url:function(){
          return 'http://pick-cup.com'
         },


         europeanCountry:function(value){
          var data=["AT", "BE", "BG", "CY", "CZ", "DE", "DK", "EE", "ES", "FI", "FR", "GB"
          , "GR", "HR", "HU", "IE", "IT", "LT", "LU", "LV", "MT", "NL", "PL", "PT", "RO", "SE", "SI", "SK"];
          var includedData= data.includes(value);
          console.log(value);
          console.log(includedData);
          if(includedData)
          {
            return true;
          }

          return false;
         },

          adminMailFrom:function(){
          return 'ruchika.s@infiny.in'
         },


         adminChargesforUser:function(){
           var data={};
            data.below_5_pound=0.4;
             data.below_10_pound=0.5;
              return data
         },
         
         adminChargesforshop:function(){
         	return '0'
         },

         stripeCharges:function(){
         	var totalCharges={};
         	totalCharges.percentCharge=2.9;
            totalCharges.percentChargeIfEuropean=1.4;
         	totalCharges.additional=0.2;
         	return totalCharges
         },
         
         

		 checkIfduplicates:function(alldata,data){
           console.log("i  m in checkIfduplicates ");
           console.log(alldata);
           console.log(data);
		    for(var i = 0; i < alldata.length; i++)
		    {
		        if(alldata[i] == data)
		            return true;
		    }

		    return false;
		},




		findUser:function(id,callback){

          User
          .findOne({ "_id": id})
          .exec(function (err,userFound){
						        if (err)
						        {
						             callback("err");
						        }
						        if(!userFound)
						        {
						        	callback("no user Found");
						            
						        }
						        callback(userFound);
						         
						        });


		},


    findCurrentDateinutc:function(){

        var dateDat = new Date();
        var timezone=moment.tz.guess();
        // console.log(moment.tz.guess());
        var dec = moment.tz(dateDat,timezone);
        console.log(dec);
        console.log('dec');
        var dateDatat = dec.utc().format('YYYY-MM-DD HH:mm:ss');

        var dateData  =new Date(dateDatat) ;
        return dateData
        // callback(dateData);

    },

		findShopowner:function(id,callback){
          Stores
          .findOne({ "_id": id})
          .select({'bankDetails':0, 'incomesourceDetail':0 ,'totalamounttotransfer':0 ,'bankAccountId':0})
          .exec(function (err,store){
						        if (err)
						        {
						            callback("err");
						        }
						        if(!store)
						        {
						           callback("no user Found");
						        }
						           callback(store);
						        });

		},

    findShopownerwith:function(id,callback){
          Stores
          .findOne({ "_id": id})
          .select({'bankDetails':0, 'incomesourceDetail':0 ,'totalamounttotransfer':0 ,'bankAccountId':0,'deviceToken':0})
          .exec(function (err,store){
                    if (err)
                    {
                        callback("err");
                    }
                    if(!store)
                    {
                       callback("no user Found");
                    }
                       callback(store);
                    });

    },

    amountTotransferShopowner:function(totalPrice){

        var sellingPrice=totalPrice;
          var totalStripeCharges=stripeCharges();
          //var percentStripecharge=totalStripeCharges.percentCharge+(totalStripeCharges.additional/100);
          //console.log(percentStripecharge);
          var stripe_percCharge=(totalStripeCharges.percentCharge/100)*sellingPrice;
          var stripe_penCharge=totalStripeCharges.additional;
          var stripe_total=stripe_percCharge+stripe_penCharge;
          var stripeAmount=stripe_total;
          // var amountRemainafterstripe=sellingPrice-stripeAmount;
          // console.log(amountRemainafterstripe);
          var Usercharges=adminChargesforUser();
         if(sellingPrice < 5)
         {
            var pickcup_charge=Usercharges.below_5_pound;
         }
         else if(sellingPrice < 10)
         {
           var pickcup_charge=Usercharges.below_10_pound;
         }
         else
         {
           var pickcup_charge=Usercharges.below_10_pound;
         }

         var deductAmount=pickcup_charge+stripeAmount;
         var costPrice=sellingPrice-deductAmount;
         // // var percentshopcharges=adminChargesforshop();
         //  var totaladminCharges=((parseInt(percentUsercharges)+parseInt(percentshopcharges))*amountRemainafterstripe)/100
         //  console.log(totaladminCharges);
         //  var totalAmountOwn=sellingPrice-totaladminCharges;
          return costPrice;
       

    },

     amountTotransfertoAdmin:function(totalPrice){

       var sellingPrice=totalPrice;
          var totalStripeCharges=stripeCharges();
          //var percentStripecharge=totalStripeCharges.percentCharge+(totalStripeCharges.additional/100);
          //console.log(percentStripecharge);
          var stripe_percCharge=(totalStripeCharges.percentCharge/100)*sellingPrice;
          var stripe_penCharge=totalStripeCharges.additional;
          var stripe_total=stripe_percCharge+stripe_penCharge;
          var stripeAmount=stripe_total;
          // var amountRemainafterstripe=sellingPrice-stripeAmount;
          // console.log(amountRemainafterstripe);
          var Usercharges=adminChargesforUser();
         if(sellingPrice < 5)
         {
            var pickcup_charge=Usercharges.below_5_pound;
         }
         else if(sellingPrice < 10)
         {
           var pickcup_charge=Usercharges.below_10_pound;
         }
         else
         {
           var pickcup_charge=Usercharges.below_10_pound;
         }

         var deductAmount=parseInt(pickcup_charge)+stripeAmount;
         //var costPriceWithpickchar=sellingPrice -stripeAmount;
         var  admincharge=pickcup_charge;
           return admincharge;
          // var sellingPrice=totalPrice;
          // var totalStripeCharges=stripeCharges();
          // var percentStripecharge=totalStripeCharges.percentCharge+(totalStripeCharges.additional/100);
          // console.log(percentStripecharge);
          // var stripeAmount=(Math.ceil(percentStripecharge)*sellingPrice)/100;
          // var amountRemainafterstripe=sellingPrice-stripeAmount;
          // console.log(amountRemainafterstripe);
          // var percentUsercharges=adminChargesforUser();
          // var percentshopcharges=adminChargesforshop();
          // var totaladminCharges=((parseInt(percentUsercharges)+parseInt(percentshopcharges))*amountRemainafterstripe)/100
          // console.log(totaladminCharges);
       
    },

      // updateOwnerBalance:function(ownerDetail,userdetail,totalPrice){
      //   var costPrice=amountTotransferShopowner(parseInt(totalPrice));
       
      //   Stores
      //     .findOne({ "_id": ownerDetail})
      //     .exec(function (err,store){
      //               if (err)
      //               {
      //                   var previoustrans=store.totalamounttotransfer;
      //                   store.totalamounttotransfer=previoustrans ;
      //                   var userdata={
      //                     userDetails:userdetail,
      //                     totalAmount:totalPrice,
      //                     afterDeducAmount:costPrice,
      //                     datetransfer:Date.now(),
      //                     remarks:"failed due to err:"+err.message
      //                   }
      //               }
      //               if(!store)
      //               {
      //                  var previoustrans=store.totalamounttotransfer;
      //                   store.totalamounttotransfer=previoustrans + costPrice;
      //                   var userdata={
      //                     userDetails:userdetail,
      //                     totalAmount:totalPrice,
      //                     afterDeducAmount:costPrice,
      //                     datetransfer:Date.now(),
      //                    remarks:"failed due to err:No such store found"
      //                   }
      //               }
      //               else
      //               {
      //                   var previoustrans=store.totalamounttotransfer;
      //                   store.totalamounttotransfer=previoustrans + costPrice;
      //                   var userdata={
      //                     userDetails:userdetail,
      //                     totalAmount:totalPrice,
      //                     afterDeducAmount:costPrice,
      //                     datetransfer:Date.now(),
      //                     remarks:"sucess"
      //                   }
      //               }
                  
                 
      //               store.incomesourceDetail.push(userdata);
      //              store.save(function(err) {
      //                              if (err)
      //                               {
      //                                   console.log("err");
      //                               }

      //                                console.log("updated succesfully");
      //                           });
                       
      //               });


      // },

		sendNotification:function(deviceId,flag,msg,callback,extras){
       console.log(deviceId);
              console.log('deviceId');
			var message = {
                          registration_ids:deviceId,
                          priority : "high",
                          forceshow : true, // required fill with device token or topics
                          collapse_key: 'Pickcup', 
                          data: {
                               flag:flag,
                               data:extras
                         
                          },
                          notification: {
                              title: 'Pickcup',
                              body: msg,
                              sound : "default"
                              
                          }
                      };



                  //promise style
                      fcm.send(message)
                      .then(function(response){
                        
                          console.log("Successfully sent with response1 for user: ", response);
                           callback("success");
                      })
                      .catch(function(err){
                          console.log("Something has gone wrong1! for user");
                          console.error(err);
                          callback("err");
                      });

		},

  sendemail:function(mailOptions,cb){
      console.log(mailOptions);
     smtpTransport.sendMail(mailOptions, function(err) {
                if (err) {
                    cb("error");
                    console.log(err);
                }
                else
                {
                  cb("mailSend");
                }

                 
            });

  },

  countOfnotification:(lastseenofuser,decoded,cb)=>{
          notification.count({"createdAt": {
            $gte: lastseenofuser
         }, "shopDetail": decoded,"type":"new"},(err,countTotal)=>{
            var UserCount=0;
                if(!err)
                {
                    UserCount=countTotal;
                }
                console.log("usercount");
                 console.log(UserCount);

                cb(UserCount) ;
                // else
                // {
                //     UserCount=countTotal;
                // }


              });

  },

  adminurl:function(){
       
       return "ruchika.s@infiny.in"

  }

  

}