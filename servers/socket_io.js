const express = require('express')
const app = express()
var server = require('http').createServer(app)
const port = process.env.PORT || 5000
const io = require('socket.io')(server)
var clients = {}
var lstOfMsgs = []

// client id as keys and list of messages as values
// the lists will be filled with pending messages
// for the users of the corresponding id to receive once the user has signed in
var clientMessages = {}

// middleware
app.use(express.json())
io.on("connection", socket =>
{
  console.log("connected")
  console.log(socket.id, 'has joined')

  // receive from frontend client (socket.on() ...)
  // socket.on('/test', (msg) => console.log(msg))
  socket.on('signin', (id) => {
    console.log(`${id} has signed in to dm chat`)
    clients[id] = socket
    // console.log(clients);

    // if there were messages previous that need to be carried
    // over, do so now
    if (clientMessages[id])
    {
      clientMessages[id] = [...clientMessages[id]]
    }
    else
    {
      clientMessages[id] = []
    }

    // load contents of array into user's chat list on the front end
    if (clientMessages[id].length > 0)
    {
      console.log(`loading messages to user ${id}`)
      clients[id].emit('message',clientMessages[id])

      // clear array
      clientMessages[id].splice(0, clientMessages[id].length)
    }
  })

  // message from sender
  socket.on('message', (msg) => {
    // console.log(`type of msg is ${typeof(msg)}`)
    let targetId = msg.targetId
    // clients[targetId] = socket

    // null check
    if (!clientMessages[targetId])
    {
      clientMessages[targetId] = []
    }

    // maintain list of msg objects for the receiver to
    // receive once he/she is signed in (i.e. enters the dm chat)
    clientMessages[targetId].push(msg)

    // null check before sending to target
    if (clients[targetId])
    {
      // sends off messages and assumes the front-end saves it in its own way
      clients[targetId].emit('message', clientMessages[targetId])
      console.log(`sending message to user ${targetId}`)

      // clear array
      clientMessages[targetId].splice(0, clientMessages[targetId].length)
    }
    else
    {
      console.log('receiver most likely isn\'t signed in')
    }

  })

  socket.on('signedout', (id) => {
    console.log(`${id} has signed out of dm chat`)
    delete clients[id]
    // console.log(clients);
  })

})
server.listen(port, "0.0.0.0", () => {
  console.log(`server started on port ${port}`)
})



