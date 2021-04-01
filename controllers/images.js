const imageRouter = reuire('express').Router;
const Image = require('../models/image');
const upload = require('../utils/upload')

imageRouter.get('/:id', (request, response) => {
  const id = request.params.id

  
})