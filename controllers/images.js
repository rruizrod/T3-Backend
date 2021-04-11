const imageRouter = require('express').Router();
const fs = require('fs')
const path = require('path')
const Image = require('../models/image');
const User = require('../models/user');
const upload = require('../utils/upload')

imageRouter.get('/:id', async (request, response) => {
  const uid = request.params.id

  const image = await Image.findOne({userId: uid})

  if(!image) response.status(404).end()

  response.set('Content-Type', image.img.contentType).send(image.img.data)
})

imageRouter.post('/:id', upload.single('avatar'), async (request, response) => {
  const uid = request.params.id
  const user = await User.findById(uid)

  const image = new Image({
    image: {
      data: fs.readFileSync(path.join('/uploads/' + request.file.filename)),
      contentType: 'image/png'
    },
    userId: uid
  })
  const savedImage = await Image.save(image)

  user.image = savedImage._id
  await User.save(User)

  response.set('Content-Type', savedImage.img.contentType).send(savedImage.img.data)
})

module.exports = imageRouter