const bcrypt = require('bcrypt')
const usersRouter = require('express').Router()
const User = require('../models/user')

//--- ENDPOINT: Get Users List ---
usersRouter.get('/', async (request, response) => {
    const users = await User.find({}).populate('matches')
    response.json(users)
})

//--- ENDPOINT: Create User ---
usersRouter.post('/', async (request, response) => {
    const body = request.body

    console.log(body)
    const saltRounds = 10
    const passwordHash = await bcrypt.hash(body.password, saltRounds)

    const user = new User({
        name: body.name,
        username: body.username,
        email: body.email,
        passwordHash,
        dob: new Date(body.dob),
        matches: [],
        interests: []
    })
    
    const savedUser = await user.save()

    response.json(savedUser)
})

//--- ENDPOINT: Update User Profile by ID ---
usersRouter.put('/:id', async (request, response) => {
  const body = request.body
  const user = await User.findById(request.params.id)

  user.email = body.email || user.email
  user.matches = body.matches || user.matches
  user.interests = body.interests || user.interests
  user.school = body.school || user.school
  user.major = body.major || user.major
  user.job = body.job || user.job

  const updatedUser = await user.save()

  response.json(updatedUser)
})

//--- ENDPOINT: Get User by ID ---
usersRouter.get('/:id', async (request, response) => {
  const id = request.params.id

  const user = await User.findById(id).populate('matches')

  response.json(user)
})

//--- ENDPOINT: Delete User by ID ---
usersRouter.delete('/:id', async (request, response) => {
    await User.findByIdAndRemove(request.params.id)

    response.status(204).end()
})

module.exports = usersRouter
