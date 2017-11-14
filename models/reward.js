var mongoose = require('mongoose');
var Schema = mongoose.Schema;
var Stores = require('./menuListing');

var schema = new Schema({

     startdate: {
       type: String,
        required: true
       },
      enddate: {
         type: String,
          required: true
         },
      quantity: {
        type: String,
         required: true
        },
      rewardName: {
        type: String,
         required: true
        },
      shopDetail: {
          type: Schema.ObjectId,
          ref: 'Stores'
           }


});


module.exports = mongoose.model('reward', schema);
