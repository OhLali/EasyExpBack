var mongoose = require('mongoose');

var UserSchema = mongoose.Schema({
    token : String,
    email : String,
    password : String,
    firstname : String,
    lastname :  String,
    address : String,
    phone :  String,
    siret : String,
    contactsID : { type: mongoose.Schema.Types.ObjectId, ref: 'contacts' },
    foldersID : [{ type: mongoose.Schema.Types.ObjectId, ref: 'folders' }]

})

module.exports = mongoose.model('users', UserSchema)