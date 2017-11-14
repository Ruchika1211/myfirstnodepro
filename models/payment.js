var mongoose = require('mongoose');
var Schema = mongoose.Schema;
var Stores = require('./menuListing');
var Users = require('./user');

var schema = new Schema({

     paymentDate:Date,
     destPayment: {
       type: String,
        required: true
       },
      dest: {
         type: String,
          required: true
         },
      destAmount: {
        type: String,
         required: true
        },
      desttrancId: {
        type: String,
         required: true
        },
      desttransferId: {
        type: String,
         required: true
        },
      shopDetail: {
          type: Schema.ObjectId,
          ref: 'Stores'
           },
    detailOfTransfer: [{
      userDetails:{
            type: Schema.ObjectId,
            ref: 'Users'
           },
       totalAmount: String,
       afterDeducAmount: String,
        adminPrice:String,
       transId: String,
       balancetransId: String,
       datetransfer: String,
       remarks: String

    }],
      notes: {
        type: String,
         required: true
        },


},
  {
    timestamps: true
  });




module.exports = mongoose.model('payment', schema);
