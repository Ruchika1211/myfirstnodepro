var mongoose = require('mongoose');
var Schema = mongoose.Schema;
var Stores = require('./cafeListing');
var Users = require('./user');
var reward = require('./reward');
var mongooseUniqueValidator = require('mongoose-unique-validator');

var schema = new Schema({
     shopDetail: {
      type: Schema.ObjectId,
      ref: 'Stores'
       },
    userDetail:{
      type: Schema.ObjectId,
      ref: 'Users'
    },
    rewardId:{
      type: Schema.ObjectId,
      ref: 'reward'
    },
    rewardCompleted: {
      type: Number,
        default:0
    },
    claimedReward: {
      type: Boolean,
       default: false
     },
},
{
    timestamps: true,
    usePushEach: true 
  });

schema.plugin(mongooseUniqueValidator);

module.exports = mongoose.model('usersReward', schema);
