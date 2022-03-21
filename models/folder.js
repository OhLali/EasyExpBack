var mongoose = require('mongoose');

var roomSchema = mongoose.Schema({
    roomExpertise : String
})

var PictureSchema = mongoose.Schema({
    pictureUrl : String
   });
var memoVovalSchema = mongoose.Schema({
    vocalUrl : String
   });
   
var NoteSchema = mongoose.Schema({
    roomNote : String,
    title : String,
    text : String,
    memoVoval: [memoVovalSchema],
   });



var FolderSchema = mongoose.Schema({
    reference : String,
    nameInsured : String,
    phoneInsured : String,
    claimDate : Date,
    claimType : String,
    openingDate : Date,
    closingDate : Date,
    expertiseDate: Date,
    adressInsured : String,
    status : String,
    pictures: [PictureSchema],
    room : [roomSchema],
    note : [NoteSchema],
    insuranceID : { type: mongoose.Schema.Types.ObjectId, ref: 'insurances' },
    invoiceID : { type: mongoose.Schema.Types.ObjectId, ref: 'invoices' }
})


module.exports = mongoose.model('folders', FolderSchema)