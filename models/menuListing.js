var mongoose = require('mongoose');
var Schema = mongoose.Schema;
var Stores = require('./cafeListing');

var schema = new Schema({
    shopName: {
      type: Schema.ObjectId,
      ref: 'Stores'
       },
     category:
      { type: Schema.Types.Mixed,
        default: {}
       }
    // category:{
    //   // drinks:[
    //   //            {
    //   //               itemName :{
    //   //                 type: String,
    //   //                 required: true
    //   //               },
    //   //               itemPrice :{
    //   //                 type: String,
    //   //                 required: true
    //   //               },
    //   //               moreData : [
    //   //                             {
    //   //                                 itemSize : {
    //   //                                   type: String,
    //   //                                   required: true
    //   //                                 },
    //   //                                 itemPrice : {
    //   //                                   type: String,
    //   //                                   required: true
    //   //                                 },
    //   //                             }
    //   //                         ]
    //   //            }
    //   //          ]
    // }

});


module.exports = mongoose.model('StoreDetail', schema);
