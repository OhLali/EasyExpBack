var mongoose = require('mongoose');

var InsuranceSchema = mongoose.Schema({
    name : String

})

module.exports = mongoose.model('insurances', InsuranceSchema)