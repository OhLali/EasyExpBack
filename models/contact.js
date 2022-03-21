var mongoose = require('mongoose');

var contactSchema = mongoose.Schema({
    contactAddress : String,
    contactName : String,
    contactPhone : String,
    contactEmail :  String,
    insuranceID : { type: mongoose.Schema.Types.ObjectId, ref: 'insurances' }
})


module.exports = mongoose.model('contacts', contactSchema)