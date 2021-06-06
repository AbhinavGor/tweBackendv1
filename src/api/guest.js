const express = require("express")
const router = express.Router()
const jwt = require("jsonwebtoken")
const { ObjectID } = require('mongodb')

const Guest = require("../models/guest")
const {auth, adminAuth } = require("../middleware/auth")


router.get('/', adminAuth, auth, async (req, res) => {
  const allGuests = await Guest.find({});

  if(allGuests){
    res.status(200).send(allGuests);
  }else{
    res.status(404).send({"message": "Oops! No guests found."});
  }
});

router.post('/newGuest', adminAuth, auth, async (req, res) => {
  const { name, email, club } = req.body;

  const foundGuest = await Guest.findOne({ email: email });

  if(!foundGuest){
    var result           = [];
    var characters       = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
    var charactersLength = characters.length;
    for ( var i = 0; i < 10; i++ ) {
      result.push(characters.charAt(Math.floor(Math.random() * charactersLength)));
   }
   const password = result.join('');

    const newGuest = {
      name, email, password, club, password
    }

    await newGuest.save();

    res.status(200).send(newGuest);
  }else{
    res.status(420).send({"message": `Guest accoutn with email ${email} already exists!`, "foundGuest": foundGuest});
  }
});

router.post('/changePassword/id=g:id', auth, async (req, res) => {
  const id = req.params.id;

  var foundUser = await Guest.findOne({ _id: id});

  if(req.body.password){
    foundUser.password = req.body.password;
    await foundUser.save();

    res.status(200).send(foundUser);
  }else{
    res.status(200).send({"message": "Please give a valid password!"});
  }
});

router.post('/resetPassword/id=g:id', adminAuth, auth, async (req, res) => {

    const id = req.params.id;

    var foundUser = await Guest.findOne({ _id: id});

    var result           = [];
    var characters       = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
    var charactersLength = characters.length;
    for ( var i = 0; i < 10; i++ ) {
      result.push(characters.charAt(Math.floor(Math.random() * charactersLength)));
    }
    var password = result.join('');

    foundUser.password = password;
    await foundUser.save();

    res.status(200).send(foundUser);
});

module.exports = router;
