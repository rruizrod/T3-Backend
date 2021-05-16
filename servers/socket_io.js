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
// var clientMessages = {}

const uri = `mongodb+srv://leozhang1:${process.env.PASSWORD}@cluster0.pti3a.mongodb.net/myFirstDatabase?retryWrites=true`;

//#region mongoose init
mongoose.connect(uri, { useNewUrlParser: true, useUnifiedTopology: true, useCreateIndex: true, useFindAndModify: false, }, (err) =>
{
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
    chat.find({ userId: id }, (err, docs) =>
    {
      if (err) { console.log(err); }
      else
      {
        console.log('sending old messages:')
        console.log(`there are ${docs.length} messages for you`)

        // retrieve message objects from docs
        var lst = docs.map((o) => o.messages)
        console.log(lst)
        // todo find a way to have one saved query per user

        for (var lstOfMsgObjs of lst)
        {
          // send to frontend
          clients[id].emit('message', lstOfMsgObjs)
        }
      }
    })

    // DONE todo find a way to delete messages in the mongodb cluster after they have been sent DONE (change to deleteOne once we only have one object in db per user-user interaction)
    chat.deleteMany({ userId: id }, (err) =>
    {
      if (err) throw err

      console.log(`pending messages to user: ${id} are now sent to its rightful user and deleted from the backend nosql database`)
    })
  })

  // message from sender
  socket.on('message', (msg) =>
  {
    // format of every msg arg: {'message': message, 'sourceId': sourceId, 'targetId': targetId}

    let receiverId = msg.targetId

    // probably could have just passed in msg.message instead of entire msg
    var newMsg = new chat({ messages: msg, userId: receiverId })

    // saves a new object everytime a new message is sent (maybe we shouldn't do this if we only want one object for every user-user interaction?)
    newMsg.save((err, result) =>
    {
      if (err) console.log(err)
      else
      {
        console.log(result)
        console.log(`saving message to db for receiver: ${receiverId}`)
      }
    })

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



