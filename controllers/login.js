const jwt = require('jsonwebtoken')
const bcrypt = require('bcrypt')
const loginRouter = require('express').Router()
const User = require('../models/user')

/**
 * @swagger
 * tags:
 *    name: Login
 *    description: Login API
 */

/**
 * @swagger
 * /api/login:
 *    post:
 *      summary: Logs user in.
 *      tags: [Login]
 *      requestBody:
 *        required: true
 *        content:
 *          application/json:
 *            schema:
 *              properties:
 *               username:
 *                  type: string
 *                  description: Users username.
 *               password:
 *                  type: string
 *                  description: Users password.
 *      responses:
 *        200:
 *          description: User logged in.
 *          content:
 *            application/json:
 *              schema:
 *                properties:

 
 *                  token:
 *                    type: string
 *                    description: JWT token for later use.
 *                  username:
 *                    type: string
 *                    description: Users username.
 *                  name:
 *                    type: string
 *                    description: Users name.
 *                  user:
 *                    type: object
 *                    description: User Object.
 */
loginRouter.post('/', async (request, response) => {
  const body = request.body

  const user = await User.findOne({ username: body.username })
  const passwordCorrect = user === null
    ? false
    : await bcrypt.compare(body.password, user.passwordHash)

  if (!(user && passwordCorrect)) {
    return response.status(401).json({
      error: 'invalid username or password'
    })
  }

  const userForToken = {
    username: user.username,
    id: user._id,
  }

  const token = jwt.sign(userForToken, process.env.SECRET)

  return response
    .status(200)
    .send({ token, username: user.username, name: user.name, user: user })
})

module.exports = loginRouter