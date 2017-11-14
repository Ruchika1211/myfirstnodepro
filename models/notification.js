var mongoose = require('mongoose');
var Schema = mongoose.Schema;
var Stores = require('./cafeListing');
var Users= require('./user');

var schema = new Schema({
    shopDetail: {
      type: Schema.ObjectId,
      ref: 'Stores'
       },
    userDetail:{
      type: Schema.ObjectId,
      ref: 'Users'
    },
    message: {
      type: String,
       required: true
     },
     cafe_name:String,
     orderId:String
  },
  {
    timestamps: true
  });


module.exports = mongoose.model('notification', schema);
