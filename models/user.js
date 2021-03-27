const mongoose = require('mongoose')
const uniqueValidator = require('mongoose-unique-validator')

const getAge = (dob) => {
  var birthday = +new Date(dob);
  return ~~((Date.now() - birthday) / (31557600000));
}

const userSchema = new mongoose.Schema({
    name: String,
    username: {
        type: String,
        minLength: 3,
        unique: true,
        requried: true
    },
    email: {
      type: String,
      unique: true,
      required: true
    },
    passwordHash: String,
    dob:{
      type: Date,
      required: true,
    },
    bio: {
      type: String,
      maxLength: 140,
    },
    matches: [
        {
            type: mongoose.Schema.Types.ObjectID,
            ref: 'User'
        }
    ],
    interests: [ String ],
    school: String,
    major: String,
    job: String,
    country: String,
    city: String,
})

userSchema.set('toJSON', {
    transform: (document, returnedObject) => {
        returnedObject.id = returnedObject._id.toString()
        returnedObject.age = getAge(returnedObject.dob)
        delete returnedObject.dob
        delete returnedObject._id
        delete returnedObject.__v
        delete returnedObject.passwordHash
    }
})

userSchema.plugin(uniqueValidator)

const User = mongoose.model('User', userSchema)

module.exports = User