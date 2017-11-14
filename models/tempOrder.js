var mongoose = require('mongoose');
var Schema = mongoose.Schema;
var Stores = require('./cafeListing');
var Users = require('./user');

var schema = new Schema({

      userDetail: {
       type: Schema.ObjectId,
       ref: 'Users'
        },

      shopDetail: {
        type: Schema.ObjectId,
        ref: 'Stores'
         },

    Ordered:[{
        itemId:{
          type: Schema.ObjectId,
          required: true
        },
        itemSize:{
          type: String,
          required: false
        },
        itemQuantity:{
          type: String,
          required: false
        },
         itemCat:{
          type: String,
          required: false
        },
      itemName:{
          type: String,
          required: true
        },
      itemPrice:{
            type: String,
            required: true
          },
      eligibleForRewards:{
            type: String,
            required: true
          }
      }]


});


module.exports = mongoose.model('tempOrder', schema);
