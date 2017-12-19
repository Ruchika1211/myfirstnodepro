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

    adminSetStatus:  {
       type: Number,
       required: false,
         default:0
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
       default:""
       },

    dob: {
       type: String,
       required: false,
         default:""
       },
     password: {
          type: String,
          required: false,
          },

     imageUrl: {
          type: String,
          required: false,
          default:"noImage"
          },
   
     deviceToken:{
        type: Array,
        "default": [],
         required: false,
    },

    address: {
          city:{
            type: String,
            required: false,
              default:""
          },
          postalCode:{
            type: String,
            required: false,
              default:""
          },
          address:{
            type:String,
            required: false,
              default:""
          }
        },

     isLoggedIn: {
      type: Boolean,
      required: true,
      default:true
      },

    stripeId:{
        type: String,
        required: false,
    },

    cardDetails:[{
      cardId:{
        type: String,
        required: false,
      },
       card_name:{
        type: String,
        required: false,
      },
      card_number:{
        type: String,
        required: false,
      },
      expiryMonth:{
        type:String,
        required: false,
      },
      isEuropean:{
        type: Boolean,
        required: false,
      },
      expiryYear:{
        type:String,
        required: false,
      },
       brand:{
        type:String,
        required: false,
      },
      fingerprint:{
       type:String,
        required: false,
      },
     
      isPrimary:{
        type:Boolean,
        default:false,
        required: false,
      }
    }],
    resetPasswordToken: String,
     lastseen: Date,
    resetPasswordExpires: Date,
    isBlocked: {
       type: Number,
       required: true,
         default:0
       }
},
  {
    timestamps: true
  });

schema.plugin(mongooseUniqueValidator);

module.exports = mongoose.model('Users', schema);
