var mongoose = require('mongoose');
var Schema = mongoose.Schema;
var Stores = require('./cafeListing');
var Users = require('./user');

var schema = new Schema({

      userDetail: {
       type: Schema.ObjectId,
       ref: 'Users'
        },
      otp:{
          type: String,
          required: true
        },
      shopDetail: {
        type: Schema.ObjectId,
        ref: 'Stores'
         },
     orderCategory:String,
     costPrice:Number,
     totalPrice: {
           type: String,
          required: true
        },
      note: {
           type: String,
          required: false
        },
      orderId: {
            type: String,
           required: true
         },
      timeForPickcup:{
          type: String,
          required: true
        },
     orderStatus:{
        type: String,
        enum: ['active', 'ready', 'completed'],
        default: 'active'
      },
     parcel:{
          type: Boolean,
          default: true
        },
      transactionId:String,
      transactionMsg:String,
      balance_transaction:String,
      Ordered:[{
        itemId:{
          type: Schema.ObjectId,
          required: false
        },
        itemSize:{
          type: String,
          required: false
        },
        itemQuantity:{
          type: String,
          required: false,
          default:"1"
        },
        itemCat:{
          type: String,
          required: false
        },
        itemName:{
          type: String,
          required: false
        },
        itemPrice:{
          type: String,
          required: false
        },
        eligibleForRewards:{
            type: String,
            required: false
          }
      
      }]


},
  {
    timestamps: true
  });


module.exports = mongoose.model('Orders', schema);
