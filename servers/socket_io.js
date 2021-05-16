const express = require('express')
const app = express()
var server = require('http').createServer(app)
const port = process.env.PORT || 5000
const io = require('socket.io')(server)
var mongoose = require('mongoose')
require('dotenv').config()
var clients = {}

// client id as keys and list of messages as values
// the lists will be filled with pending messages
// for the users of the corresponding id to receive once the user has signed in
var clientMessages = {}

const uri = `mongodb+srv://leozhang1:${process.env.PASSWORD}@cluster0.pti3a.mongodb.net/myFirstDatabase?retryWrites=true`;

localHostURI = 'mongodb://localhost/chat'

//#region mongoose init
mongoose.connect(uri, {useNewUrlParser: true, useUnifiedTopology: true, useCreateIndex: true, useFindAndModify: false,} , (err) => {
  if (err) throw err
  else
  {
    console.log('connected to db!')
  }
})


var chatSchema = new mongoose.Schema({
  messages: Array,
  userId: String,
})

var chat = mongoose.model('Message', chatSchema)
//#endregion


// middleware
app.use(express.json())
io.on("connection", socket =>
{
  console.log("connected")
  console.log(socket.id, 'has joined')

  // receive from frontend client (socket.on() ...)
  // socket.on('/test', (msg) => console.log(msg))
  socket.on('signin', (id) =>
  {
    console.log(`${id} has signed in to dm chat`)
    clients[id] = socket

    // retrieve messages sent to you that were saved in mongodb
    chat.find({userId: id}, (err, docs) => {
      if (err) { console.log(err); }
      else
      {
        console.log('sending old messages:')
        console.log(docs.length);
        console.log(docs);
        clients[id].emit('message', docs.messages)
      }
    })

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
      clients[id].emit('message', clientMessages[id])

      // clear array
      clientMessages[id].splice(0, clientMessages[id].length)
    }
  })

  // message from sender
  socket.on('message', (msg) =>
  {
    // console.log(`type of msg is ${typeof(msg)}`)
    let receiverId = msg.targetId
    // clients[targetId] = socket

    // null check
    if (!clientMessages[receiverId])
    {
      clientMessages[receiverId] = []
    }

    // maintain list of msg objects for the receiver to
    // receive once he/she is signed in (i.e. enters the dm chat)
    clientMessages[receiverId].push(msg)

    // null check before sending to target
    if (clients[receiverId])
    {
      var newMsg = new chat({messages: clientMessages[receiverId], userId: receiverId})
      newMsg.save((err, result) => {
        if (err) console.log(err)
        else
        {
          console.log(result)
          // sends off messages and assumes the front-end saves it in its own way
          clients[receiverId].emit('message', clientMessages[receiverId])
          console.log(`sending message to user ${receiverId}`)

          // clear array
          clientMessages[receiverId].splice(0, clientMessages[receiverId].length)
        }
      })
    }
    else
    {
      console.log('receiver most likely isn\'t signed in')
    }

  })

  socket.on('signedout', (id) =>
  {
    console.log(`${id} has signed out of dm chat`)
    delete clients[id]
    // console.log(clients);
  })

})
server.listen(port, "0.0.0.0", () =>
{
  console.log(`server started on port ${port}`)
})



