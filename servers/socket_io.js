const express = require('express')
const app = express()
var server = require('http').createServer(app)
const port = process.env.PORT || 5000
const io = require('socket.io')(server)
var clients = {}
var lstOfMsgs = []

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

    // load contents of array into user's chat list on the front end
    if (lstOfMsgs.length > 0)
    {
      console.log(`loading messages to user ${id}`)
      clients[id].emit('message',lstOfMsgs)
      lstOfMsgs.splice(0, lstOfMsgs.length)
    }
  })

  // message from sender
  socket.on('message', (msg) => {
    console.log(`type of msg is ${typeof(msg)}`)
    let targetId = msg.targetId
    // clients[targetId] = socket

    // maintain a global list of msg objects for the receiver to
    // receive once he/she is signed in (i.e. enters the dm chat)
    lstOfMsgs.push(msg)

    // null check before sending to target
    if (clients[targetId])
    {
      clients[targetId].emit('message',lstOfMsgs)
      console.log(`sending message to user ${targetId}`)

      // clear array
      lstOfMsgs.splice(0, lstOfMsgs.length)
    }

    else { console.log('client is null'); }

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



