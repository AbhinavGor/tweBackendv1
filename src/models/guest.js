const mongoose = require('mongoose');
const validator = require("validator")
const bcrypt = require("bcryptjs")
const jwt = require("jsonwebtoken")
require('dotenv').config();

const guestSchema = mongoose.Schema({
  name: {
    type: String,
    required: true
  },
  email: {
    type: String,
    required: true,
    unique: true,
    lowercase: true,
    trim: true,
    validate(value){
        if (!validator.isEmail(value)){
            throw new Error("Invalid Email")
        }
    }
  },
  password: {
    type: String,
    required: true,
    trim:true,
    minlength: 7,
  },

  club: {
      type: String,
      required: true,
      trim:true,
      lowercase:true,
  },

  isLocked: {
    type: Boolean,
    default: false
  },

  tokens: [{
    token: {
        type: String,
        required: true
    }
}],

  avatar: {
      type: Buffer
  },

  userType: {
    type: Number,
    default: -1
  },

  onboarding: {
      type: Boolean,
      default: false
  },

  securityQuestion: {
      type: String
  },

  securityAnswer: {
    type: String
  },

  contributions:{
    myTotalContribution: {
        type: Number,
        default:0
    },

    myTotalNewsContibution: {
        type: Number,
        default:0
    },
    myTotalSatireContribution: {
        type: Number,
        default:0
    },
    myTotalFactsContribution: {
        type: Number,
        default:0
    },
    myTotalEditorialContribution: {
        type: Number,
        default:0
    },
    myTotalMovieContribution: {
        type: Number,
        default:0
    }
  }
},{
    timestamps: true
});


guestSchema.statics.findByCredentials = async (email, password) => {
    const findGuest = await Guest.findOne({ email })
    if(!findGuest) {
        throw new Error ("Unable to Login!")
    }
    const isMatch = await bcrypt.compare(password, findGuest.password)

    if(!isMatch) {
        throw new Error("Unable to Login!")
    }
    return findGuest

}

//hash plain text password before save
guestSchema.pre("save", async function(next) {
    const user = this
    if (user.isModified("password")) {
        user.password = await bcrypt.hash(user.password, 8)
    }

    next()

})

// return public profile whenever user info is returned ( hide password and token history)

guestSchema.methods.toJSON = function () {
    const user = this
    const userObject = user.toObject()

    delete userObject.password
    delete userObject.tokens
    delete userObject.avatar

    return userObject
}

guestSchema.methods.generateToken = async function () {
    const findGuest = this
    const token = jwt.sign({ _id:findGuest._id.toString(), isAdmin:findGuest.isAdmin.toString() }, process.env.JWT_SECRET)

    findGuest.tokens = findGuest.tokens.concat({ token })
    // console.log("TOKEN ADDED:",findGuest)
    await findGuest.save()
    return token

}

//Password reset token generation
guestSchema.methods.generatePasswordReset =  function(){
    this.resetPasswordToken = jwt.sign({ _id:this._id.toString() }, process.env.JWT_SECRET)
    this.resetPasswordExpires = Date.now() + 3600000;
  };



const Guest = mongoose.model('Guest', guestSchema);

module.exports = Guest;
