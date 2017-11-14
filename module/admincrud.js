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
var helper = require('../services/helper.js');

exports.addshopowner = (req, res) => {

	var email=req.body.email;
	var password=email.substring(0, email.indexOf("@"));
	console.log(password);

	var store= new Stores({
		storeId:email,
		storePass:bcrypt.hashSync(password, bcrypt.genSaltSync(10)),
		isblocked:0,
		isDelete:0,
		status:'closed',
		cafe_name:req.body.cafe_name,
		imageurl:"noImage"
	})


        store.save((err, ownerdata) => {

            if (err) {
                return res.status(500).json({
                    title: 'An error occurred',
                    error: "true",
                    detail: err
                });
            }

                var mailOptions = {
                to: email,
                from: 'ruchika.s@infiny.in',
                subject: 'Pickcup-New Shop',
                text: 'Your account is created successfully by admin and your username and password is as follows.\n\n' +
                    'username: ' +email+ '\n\n'+
                    'password: ' +password+ '\n\n'+
                    'Please download the Pickcup app which is available in android as well as ios to edit your details further \n\n'+
                    'If you did not request this, please contact on 888888888.\n'
            };

            helper.sendemail(mailOptions,(data)=>{
                 if (data ="error") {
                    return res.status(500).json({
                        title: 'An error occurred',
                        error: "true",
                        detail: err
                    });
                }

                res.status(200).json({
                title: 'Saved owner',
                error: "false",
                data:ownerdata
                
                 });
            })

          


       
            

        })



}


exports.editshopowner = (req, res) => {

   var addressdata=req.body.address;
   Stores.findOne({_id:req.body.Id},(err,coffeeShop)=>{
      if(err){
         return res.status(500).json({
                        title: 'An error occurred',
                        error: "true",
                        detail: err
                    });
      }

      if(!coffeeShop){
        return res.status(404).json({
                        title: 'User not found',
                        error: "true"
                    });
      }

         if(addressdata)
           {
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
                 coffeeShop.position.addressline = addressLine;
                coffeeShop.position.postal_code = postal_code;
                coffeeShop.position.city = city;
                coffeeShop.position.state = state;
                coffeeShop.position.latitude = req.body.latitude;
                coffeeShop.position.longitude = req.body.longitude;
           }

      coffeeShop.storeId=req.body.email;
      coffeeShop.cafe_name=req.body.cafe_name;
      coffeeShop.save(function(err,coffeeShopData) {

         if(err){
         return res.status(500).json({
                        title: 'An error occurred',
                        error: "true",
                        detail: err
                    });
         }

         res.status(200).json({
                        title: 'Data saved',
                        error: "false",
                        data:coffeeShopData
                    });



      });
   })
  
    

    
   
}

