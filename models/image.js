const mongoose = require('mongoose')

const imageSchema = new mongoose.Schema({
  img: {
    data: Buffer,
    contentType: String
  },
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  }
})

const Image = mongoose.model('Image', imageSchema)

module.exports = Image