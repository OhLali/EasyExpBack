var express = require("express");
var router = express.Router();
var mongoose = require("mongoose");
var bcrypt = require("bcrypt");
var uid2 = require("uid2");
var nodemailer = require("nodemailer");
var uniqid = require('uniqid');
var fs = require('fs')

var InsuranceModel = require("../models/insurance");
var FolderModel = require("../models/folder");
var invoiceModel = require("../models/invoice");
var userModel = require("../models/user");
var contactModel = require("../models/contact");

const dotenv = require("dotenv");
dotenv.config();

var cloudinary = require('cloudinary').v2;
cloudinary.config({ 
  cloud_name: 'drajlbdf4', 
  api_key: process.env.ApiKey, 
  api_secret: process.env.ApiSecretKey,
});


/* GET home page. */
router.get('/', function(req, res, next) {
   
  res.render('index', { title: 'Express' });
});

/* Liste des Contacts. */
router.get("/getMyContacts", async function (req, res, next) {
  contacts = await contactModel.find().populate("insuranceID");
    // console.log(contacts)
  res.json({ contacts });
});

/* Supprimer un Contact. */
router.delete('/deletemycontact/:id', async function(req,res,next){
  var result = false
    var returDb = await contactModel.deleteOne({_id:req.body.id})
    // console.log(returDb)
    if(returDb.deletedCount == 1){
      result = true
    }
  res.json({result})
});

/* Editer un Contact. */
router.post('/getmycontact/:id', async function(req,res,next){

  // console.log(req.body.id)
    var returDb = await contactModel.findById(req.body.id).populate("insuranceID")
    console.log(returDb)
  
  res.json({ returDb })
});

router.get('/getInsuranceList',async function(req, res, next) {
  insurances = await InsuranceModel.find();
   res.json({insurances});
});

/* GET All Folders. */
router.get("/getMyFolders", async function (req, res, next) {
  folders = await FolderModel.find().populate("insuranceID");
  // trie des dossiers par date d'ouverture(du +récent au +ancien )
  folders.sort(function (a, b) {
    var c = new Date(a.openingDate);
    var d = new Date(b.openingDate);
    return d - c;
  });
  // console.log(folders)
  res.json({ folders });
});


/* GET One folder */
router.post('/getInfoFolder', async function(req, res, next){
   console.log('route pour récupérer les infos du dossier'+ req.body.id)

  var getFolder = await FolderModel.findById(req.body.id).populate(
    "insuranceID"
  );

  // var getFolder = await FolderModel.findById("621e4b212c925dbd9c174cb8").populate('insuranceID')

  console.log(getFolder+ " getFolder");
  var insurance = getFolder.insuranceID.name;

  res.json({ getFolder: getFolder, insurance: insurance });
});

router.post("/signIn", async function (req, res, next) {
  var response = false;
  var user = await userModel.findOne({ email: req.body.identifiantFromFront });
  var password = req.body.passwordFromFront;
  var error = "Email ou mot de passe incorrect";

  if (password === null || user === null) {
    response = false;
    res.json({ response, error });
  } else if (bcrypt.compareSync(password, user.password)) {
    response = true;
    res.json({ response, user });
  } else if (bcrypt.compareSync(password, user.password) === false) {
    response = false;
    res.json({ response, error });
  }
});

router.post("/signUp", async function (req, res, next) {
  var error = "";
  var response = false;
  var alreadyExist = await userModel.findOne({
    email: req.body.emailFromFront,
  });

  if (alreadyExist !== null) {
    error = "Cet e-mail est déjà utilisé";
  } else if (
    req.body.passwordFromFront === null ||
    req.body.emailFromFront === null
  ) {
    error = "Merci de renseigner tous les champs";
  } else if (req.body.checkPasswordFromFront !== req.body.passwordFromFront) {
    error = "Vos mots de passe ne sont pas identiques";
  } else {
    const cost = 10;
    const hash = bcrypt.hashSync(req.body.passwordFromFront, cost);
    var newUser = new userModel({
      token: uid2(32),
      email: req.body.emailFromFront,
      password: hash,
      firstname: req.body.firstnameFromFront,
      lastname: req.body.lastnameFromFront,
    });

    var userSaved = await newUser.save();
    response = true;
  }

  res.json({ userSaved, response, error });
});

router.post('/upload', async function(req, res, next){

  var response = true
  var pictureName = './tmp/'+uniqid()+'.jpg';

  var resultCopy = await req.files.avatar.mv(pictureName);
  if(!resultCopy) {
    var resultCloudinary = await cloudinary.uploader.upload(pictureName);
    response= true
    var folder = await FolderModel.findOne({_id: req.body.idFolder})
    folder.pictures.push({
      pictureUrl: resultCloudinary.url
    })
    var folderSaved = await folder.save()

  }

  fs.unlinkSync(pictureName);

  res.json({response, resultCloudinary})
})

router.get('/downloadPicture/:idFolder', async function(req, res, next){

  var response = false
  var folder = await FolderModel.findOne({_id: req.params.idFolder})
  if(folder !== null) {
    response = true
  }

  res.json({response, folder})
})

router.get('/downloadNote/:idFolder', async function(req, res, next){

  var response = false
  var folder = await FolderModel.findOne({_id: req.params.idFolder})

  if(folder !== null) {
    response = true
    console.log(folder.note)
  }

  res.json({response, note : folder.note})
})

router.post('/uploadNote', async function(req, res, next){

  var response = false
  var folder = await FolderModel.findOne({_id: req.body.idFolder})
  console.log(folder)
  if(folder !== null){
    response = true
    folder.note.push({
      roomNote : req.body.categoryTitle,
      title : req.body.noteTitle,
      text : req.body.note,
    })
  var folderSaved = await folder.save()
  }

  res.json({response, folderSaved: folderSaved.note})
})

router.post('/downloadNote', async function(req, res, next){

  var response = false
  var folder = await FolderModel.findOne({_id: req.body.idFolder})
  if(folder !== null){
    response = true
    folder.note.push({
      roomNote : req.body.categoryTitle,
      title : req.body.noteTitle,
      text : req.body.note,
    })
  var folderSaved = await folder.save()
  }

  res.json({response, folderSaved: folderSaved.note})
})

router.delete('/deleteNote', async function(req, res, next){
  
  var response = false
  var folder = await FolderModel.findOne({_id: req.body.idFolder})
  if(folder !== null){
    response = true
    
    var index = folder.note.findIndex((element) => String(element._id) === req.body.idNote)
    console.log(folder.note[index])
    console.log(index)
    folder.note.splice(index, 1)
    
  }

  res.json({response})
})

router.put('/editNote', async function(req, res, next){
  console.log(req.body.idNote)
  var response = false
  var folder = await FolderModel.findOne({_id: req.body.idFolder})
  if(folder !== null){
    response = true
    var index = folder.note.findIndex((element) => String(element._id) === req.body.idNote)
    console.log(index)
    folder.note[index].roomNote = req.body.categoryTitle
    folder.note[index].title = req.body.noteTitle
    folder.note[index].text = req.body.note
    var folderSaved = await folder.save()
  }

  res.json({response, folderSaved: folderSaved.note})
})

// Route pour modification des détails des informations d'un dossier

router.put("/save-folder", async function (req, res, next) {
  console.log(req.body.insurance);

  var updateInsurance = await InsuranceModel.findOne({
    name: req.body.insurance,
  });


  if (req.body.closingDate){
    req.body.closingDate = null

  var updateFolder = await FolderModel.updateOne(
    { _id: req.body.id },
    {
      phoneInsured: req.body.phoneInsured,
      claimType: req.body.claimType,
      nameInsured: req.body.nameInsured,
      addressInsured: req.body.addressInsured,
      insuranceID: updateInsurance,
      claimDate: req.body.claimDate,
      closingDate : req.body.closingDate,
      expertiseDate: req.body.expertiseDate,
    }
  );
} else {
  var updateFolder = await FolderModel.updateOne(
    { _id: req.body.id },
    {
      phoneInsured: req.body.phoneInsured,
      claimType: req.body.claimType,
      nameInsured: req.body.nameInsured,
      addressInsured: req.body.addressInsured,
      insuranceID: updateInsurance,
      claimDate: req.body.claimDate,
      closingDate : req.body.closingDate,
      expertiseDate: req.body.expertiseDate,
    }
  );

}


  res.json({ result: true });
});


router.post("/update-mdp", async function (req, res, next){

  var passwordCurrent = req.body.currentMDP;
  var passwordNew = req.body.newMDP
  var response = false;
  var modify = false
  var error = 'Le mot de passe actuel est erroné'

  var user = await userModel.findOne({token : req.body.token})

  console.log('user ', user)
  if (bcrypt.compareSync(passwordCurrent, user.password)) {
    
  console.log('newpassword before hash', passwordNew)
    const cost = 10;
    const hash = bcrypt.hashSync(passwordNew, cost);

    var updateMPD = await userModel.updateOne({token : req.body.token}, {password : hash})
    response = true;
    console.log('newpassword aftre hash', hash)


    res.json({ response });

  } else if (bcrypt.compareSync(passwordCurrent, user.password) === false) {
    response = false;
    res.json({ response, error });
  }

})

router.post("/resetpassword", async function (req, res, next) {
  var user = await userModel.findOne({ email: req.body.emailFromFront });

  var error = "";
  var response = false;
  var userUpdated;
  var newPassword;


  if (user !== null) {
    newPassword = uid2(32);
    const cost = 10;
    const hash = bcrypt.hashSync(newPassword, cost);

    let transporter = nodemailer.createTransport({
      service: "gmail",
      auth: {
        user: process.env.Gmailidentifiant,
        pass: process.env.Gmailpassword,
      },
    });

    await userModel.updateOne({ token: user.token }, { password: hash });

    var userUpdated = await userModel.findOne({ token: user.token });

    var info = await transporter.sendMail({
      from: '"Easy Expertise 👻"<adresse>',
      to: userUpdated.email,
      subject: "Reset Password ✔",
      text: `Hello, ton nouveau mot de passe est ${newPassword}`,
    });

    console.log("Message sent: %s", info.messageId);

    response = true;
  } else {
    error = "Email non valide";
  }

  res.json({ response, error });
});


// POST Création d'un dossier
router.post("/newFolder", async function (req, res, next) {
  console.log("route ajouter un nouveau dossier ");
  let roomToExp = req.body.room.split(",");
  var newFolder = new FolderModel({
    reference: req.body.reference,
    nameInsured: req.body.nameInsured,
    claimDate: new Date(req.body.claimDate),
    claimType: req.body.claimType,
    openingDate: new Date(),
    status: "En cours",
    room: roomToExp.map((item, i) => ({ roomExpertise: item })),
    insuranceID: req.body.insuranceID,
  });

  var folderSaved = await newFolder.save();
  console.log("folderSaved",folderSaved)

  var currentUser = await userModel.findOne({ token: req.body.token });

  // pour ajouter l'ID du 1er dossier et les suivants dans le user
  var folderToUser = await userModel.updateOne(
    { token: req.body.token },
    { $push: { foldersID: folderSaved._id } }
  );

  res.json({ result: true, folderSaved, folderID: folderSaved._id});
});

router.put('/update-userinfo', async function(req, res, next){
  console.log('route pour modifier les infos du user')

  var updateUser =  await userModel.updateOne(
    { token: req.body.token},
    {email: req.body.email , firstname: req.body.firstname ,  lastname: req.body.lastname ,phone : req.body.phone, siret : req.body.siret, address : req.body.address},
 );

res.json({result : true })
})


/*
//ROUTE POUR AJOUTER UNE NOUVELLE ASSURANCE
router.post("/add-insurance", async function(req,res,next){
  console.log('pouet')
  var newInsurance = new InsuranceModel ({
    name : req.body.name
    });
    
    var insuranceSaved = await newInsurance.save();


  res.json({result:true, insuranceSaved})
  // res.render("/home")
})
*/

// ROUTE POUR AJOUTER UN NOUVEAU DOSSIER

// router.post("/add-folder", async function(req,res,next){
//   console.log('pouet')
//   var newFolder = new FolderModel ({
//     reference : '993_FCazertyN_973214',
//     nameInsured : ' Mickey Mouse',
//     phoneInsured : "02 12 00 99 68",
//     claimDate : "2022-01-12T17:06:27.000Z",
//     claimType: "Incendie",
//     openingDate : "2022-01-14T17:06:27.000Z",
//     expertiseDate : "2022-03-12T17:06:27.000Z",
//     adressInsured : "4 avenue des petites patates 56400 Auray",
//     status : 'En cours',
//     note : [{
//       room : "sdb",
//       title : "Constatations générales ",
//       text: "Lorem ipsum dolor sit amet, consectetur adipiscing elit. Proin gravida eget orci nec tincidunt. Maecenas semper accumsan libero eget tempus. Aliquam euismod in massa vel interdum. Interdum et malesuada fames ac ante ipsum primis in faucibus. Sed sed condimentum sem. Mauris auctor erat id turpis pretium, eget vestibulum turpis cursus. Cras non mauris id risus viverra bibendum at dignissim tortor. Duis quis tortor malesuada, posuere risus vel, maximus libero. Aenean molestie ut augue ac tempus. Sed dictum, sapien sit amet efficitur laoreet, lacus libero accumsan elit, quis ultrices quam elit eu turpis. Nunc blandit mauris est, sed semper tortor interdum eu. Ut cursus nunc ac suscipit auctor. Donec ac felis mauris. Nullam egestas ex nec justo fermentum rhoncus.",
//       picture : [{PictureUrl : 'https://res.cloudinary.com/demo/image/upload/w_70,h_53,c_scale/turtles.jpg'}],
//       memoVoval: [{vocalUrl : 'https://res.cloudinary.com/demo/image/upload/w_70,h_53,c_scale/turtles.jpg'}],
//     },{
//         roomNote : "sdb",
//         title : "douche",
//         text:"Quisque ultricies velit vehicula, maximus felis ut, imperdiet velit. Cras non sagittis turpis. Aenean mattis mollis orci, eget fermentum massa elementum vitae. Ut vel neque mauris. Maecenas laoreet placerat lacinia. Vivamus pretium laoreet ex nec congue. Cras pellentesque tellus eget orci imperdiet, in egestas neque sagittis. Suspendisse eget aliquet metus.",
//         picture : [{PictureUrl : 'https://res.cloudinary.com/demo/image/upload/w_70,h_53,c_scale/turtles.jpg'}],
//         memoVoval: [{vocalUrl : 'https://res.cloudinary.com/demo/image/upload/w_70,h_53,c_scale/turtles.jpg'}]
//       }],
//     room : [{roomExpertise : "sdb"}, {roomExpertise : "Toilettes"}],
//     insuranceID : "621ca2d5be2040a69a7bde2a",

//     });


//     var folderSaved = await newFolder.save();

// console.log(folderSaved)
//   res.render("/home")
// })


module.exports = router;
