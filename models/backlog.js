const mongoose = require('mongoose')
const uniqueValidator = require('mongoose-unique-validator')


const backlogSchema = new mongoose.Schema({
  uid: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    unique: true
  },
  messages: [
    {
      id: Number,
      message: String,
      senderID: String,
      timeStamp: String
    }
  ]
})

backlogSchema.set('toJSON', {
  transform: (document, returnedObject) => {
    returnedObject.id = returnedObject._id.toString()
    delete uid
  }
})

backlogSchema.plugin(uniqueValidator)

const Backlog = mongoose.model('Backlog', backlogSchema)

module.exports = Backlog
