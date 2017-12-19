var mongoose = require('mongoose');
var Schema = mongoose.Schema;

// [ready,closed,busy]
var schema = new Schema({
    cafe_name: {
      type: String,
     required: true
       },
     storeId: {
       type: String,
      required: true,
       unique: true
        },
      storePass: {
        type: String,
       required: true
         },
      status:{
        type: String,
         enum: ['ready', 'closed', 'busy']
       },
      imageurl: {
      type: String,
      required: false,
      default:"noImage"
     },
      isLoggedIn: {
      type: Boolean,
      required: true,
      default:true
      },
      deviceToken:{
        type: Array,
        "default": [],
         required: false,
     },
     totalamounttotransfer:{
      type: Number,
       default:0
      },
     incomesourceDetail:[],
    position: {
                latitude:{
                  type: String,
                  required: false,
                },
                longitude:{
                  type: String,
                  required: false,
                },
                addressline: String,
                postal_code: String,
                city: String,
                state: String,
              },
    bankAccountId:String,
    bankDetails: [
    {
      bankId:String,
      bankNumber:String,
      typeOfaccount:String,
      accountholderName:String,
      isPrimary:Boolean,
      routingNumber:String,
      fingerprint:String,

    }],
    accountStatus:String,
   accountdocument:String,
   accountdetails:String,
   accountdetails_code:String,
   accountdueby:String,
   accountdisabledReason:String,
  resetPasswordToken: String,
  resetPasswordExpires: Date,
  isblocked:{
       type: Number,
       required: true,
         default:0
       },

      isDelete:Number

},
{
  timestamps: true
});


schema.pre('save', function (next) {

  var splitStr = this.cafe_name.toLowerCase().split(' ');
  //console.log(splitStr);
  var mydata;
 for (var i = 0; i < splitStr.length; i++) {
   
        splitStr[i] =  splitStr[i].split('');
         splitStr[i][0] =  splitStr[i][0].toUpperCase(); 
        splitStr[i] =  splitStr[i].join('');
         
       
   //    var mydata = splitStr.join(' '); 
   // console.log(mydata);
          mydata = splitStr.join(' '); 
       //console.log(mydata);
     }   
 
  
 
 this.cafe_name=mydata;

 //console.log(this.cafe_name);

//console.log('this.cafe_name');
  // capitalize
//this.cafe_name.replace(/\w\S*/g, function(txt){return txt.charAt(0).toUpperCase() + txt.substr(1).toLowerCase();})
  next();
});

module.exports = mongoose.model('Stores', schema);
