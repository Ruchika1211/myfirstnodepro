var mongoose = require('mongoose');
var Schema = mongoose.Schema;

var schema = new Schema ({
    userId : {
        type : String
    },
    storeId : {
        type: String
    },
    star_rating: {
        type: Number,
        required: true
    },
    complement: {
        type: String
    },
    notes: { 
        type: String
    }
});

module.exports = mongoose.model('Ratings', schema);