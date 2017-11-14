var mongoose = require('mongoose');
var Schema = mongoose.Schema;
var mongooseUniqueValidator = require('mongoose-unique-validator');

var schema = new Schema({
    firstname: {
      type: String,
     required: true
       },
    lastname: {
      type: String,
      required: true
    },
    password: {
      type: String,
       required: false
     },
    email: {
      type: String,
      required: true,
       unique: true
     },
    contact: {
       type: String,
       required: false,
       },
   
     password: {
          type: String,
          required: false,
          },
     imageUrl: {
          type: String,
          required: false,
          },
     deviceToken:{
        type: Array,
        "default": [],
         required: false,
    },
    
     isLoggedIn: {
      type: Boolean,
      required: true,
      default:true
      },
    totAvaiAmount:Number,
    totPendingAmount:Number,
    amountcanwithdraw:Number,
      incomesourceDetail:[],
   resetPasswordToken: String,
     lastseen: Date,
    resetPasswordExpires: Date
});

schema.plugin(mongooseUniqueValidator);

module.exports = mongoose.model('admin', schema);
