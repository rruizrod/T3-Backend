const bcrypt = require('bcrypt')
const usersRouter = require('express').Router()
const User = require('../models/user')

/**
 * @swagger
 * components:
 *    schema:
 *      User:
 *        type: object
 *        required:
 *          - username
 *          - email
 *          - dob
 *        properties:
 *          matches:
 *            type: array
 *            items:
 *              type: object
 *              description: User object.
 *            description: Array of Users which the current user has matched.
 *          interests:
 *            type: array
 *            items:
 *              type: string
 *              description: Interest.
 *            description: Array of Users interests.
 *          name:
 *            type: string
 *            description: Users name.
 *          username:
 *            type: string
 *            description: Users username.
 *          email:
 *            type: string
 *            description: Users email.
 *          id:
 *            type: string
 *            description: Auto-generated DB ID of User.
 *          age:
 *            type: integer
 *            description: The generated age for the user.
 *          school:
 *            type: string
 *          major:
 *            type: string
 *          job:
 *            type: string
 *          country:
 *            type: string
 *          city:
 *            type: string
 */

/**
 * @swagger
 * tags:
 *    name: Users
 *    description: User management API
 */

//--- ENDPOINT: Get Users List ---
/**
 * @swagger
 * /api/users:
 *    get:
 *      summary: Returns list of all users in DB
 *      tags: [Users]
 *      responses:
 *        200:
 *          description: List of Users
 *          content:
 *            application/json:
 *              schema:
 *                type: array
 *                items:
 *                  $ref: '#/components/schema/User'
 */
usersRouter.get('/', async (request, response) => {
    const users = await User.find({})

    response.json(users)
})

//--- ENDPOINT: Check username availability
/**
 * @swagger
 * /api/users/{username}:
 *    get:
 *      summary: Returns username availability.
 *      tags: [Users]
 *      parameters:
 *        - in: path
 *          name: username
 *          required: true
 *          description: Username to check.
 *          schema:
 *            type: string
 *      responses:
 *        200:
 *          description: Username is available.
 *        500:
 *          description: Username not available.
 *              
 */
usersRouter.get('/:username', async (request, response) => {
    const user =  await User.findOne({username: request.params.username});
    if(!user) response.status(200).end();

    response.status(500).send({ message: "Username already exists." })
})

//--- ENDPOINT: Create User ---
/**
 * @swagger
 * /api/users:
 *    post:
 *      summary: Sign up user and adds user to the DB.
 *      tags: [Users]
 *      requestBody:
 *        required: true
 *        content:
 *          application/json:
 *            schema:
 *              properties:
 *                name:
 *                  type: string
 *                  description: Users name.
 *                  required: true
 *                username:
 *                  type: string
 *                  description: Users username.
 *                  required: true
 *                email:
 *                  type: string
 *                  required: true
 *                  description: Users email.
 *                dob:
 *                  type: string
 *                  required: true
 *                  description: Users birthday in form MMDDYYYY.
 *                password:
 *                  type: string
 *                  required: true
 *                  description: Users password.
 *                bio:
 *                  type: string
 *                  description: Users profile bio.
 *                interests:
 *                  type: array
 *                  items:
 *                    type: string
 *                    description: Interest.
 *                  description: Array of Users interests.
 *                school:
 *                  type: string
 *                major:
 *                  type: string
 *                job:
 *                  type: string
 *                country:
 *                  type: string
 *                city:
 *                  type: string
 *      responses:
 *        200:
 *          description: User created successfully. Returns User Object.
 *          content:
 *            application/json:
 *              schema:
 *                $ref: '#components/schema/User'
 */
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
        bio: body.bio || "",
        interests: body.interests || [],
        school: body.school || "",
        major: body.major || "",
        job: body.job || "",
        country: body.country || "",
        city: body.city || "",
    })
    
    const savedUser = await user.save()

    response.json(savedUser)
})

//--- ENDPOINT: Get User by ID ---
/**
 * @swagger
 * /api/users/{id}:
 *    get:
 *      summary: Get a users information by ID.
 *      tags: [Users]
 *      parameters:
 *        - in: path
 *          name: id
 *          required: true
 *          description: Users ID from database.
 *          schema:
 *            type: string
 *      responses:
 *        200:
 *          description: Found User. Returns User object.
 *          content:
 *            application/json:
 *              schema:
 *                $ref: '#/components/schema/User'
 */
usersRouter.get('/:id', async (request, response) => {
  const id = request.params.id

  const user = await User.findById(id)

  response.json(user)
})

//--- ENDPOINT: Update User Profile by ID ---
/**
 * @swagger
 * /api/users/{id}:
 *    put:
 *      summary: Update a Users information by ID.
 *      tags: [Users]
 *      parameters:
 *        - in: path
 *          name: id
 *          required: true
 *          description: Users ID from database.
 *          schema:
 *            type: string
 *      requestBody:
 *        required: true
 *        content:
 *          application/json:
 *            schema:
 *              $ref: '#/components/schema/User'
 *      responses:
 *        200:
 *          description: User updated. Returns updated User.
 *          content:
 *            application/json:
 *              schema:
 *                $ref: '#/components/schema/User'
 */
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

//--- ENDPOINT: Delete User by ID ---
/**
 * @swagger
 * /api/users/{id}:
 *    delete:
 *      summary: Delete a users information by ID.
 *      tags: [Users]
 *      parameters:
 *        - in: path
 *          name: id
 *          required: true
 *          description: Users ID from database.
 *          schema:
 *            type: string
 *      responses:
 *        204:
 *          description: Found User. Deleted from DB.
 */
usersRouter.delete('/:id', async (request, response) => {
    await User.findByIdAndRemove(request.params.id)

    response.status(204).end()
})

module.exports = usersRouter
