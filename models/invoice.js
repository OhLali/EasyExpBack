var mongoose = require('mongoose');

var foldersReferenceSchema = mongoose.Schema({
    foldersReference : String
})


var InvoiceSchema = mongoose.Schema({
    invoiceName : String,
    invoiceDate : Date,
    foldersReference : [foldersReferenceSchema],
    invoiceClient : String,
    invoiceTotal : Number

})

module.exports = mongoose.model('invoices', InvoiceSchema)