const express = require('express')
const app = express()
var server = require('http').createServer(app)
const port = process.env.PORT || 5000
const io = require('socket.io')(server)
var mongoose = require('mongoose')
require('dotenv').config()
var clients = {}


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

// imported backlog model
const Backlog = require('../models/backlog')

var chatSchema = new mongoose.Schema({
  messages: Array,
  userId: String,
})

var chat = mongoose.model('Message', chatSchema)
//#endregion

const getPending = async (id) => {
  const currBacklog = await Backlog.findOne({uid: id})

  return currBacklog ? currBacklog.messages : null
}

const clearMessages = async (id) => {
  const currBacklog = await Backlog.findOne({uid: id})
  if (currBacklog == null) return
  currBacklog.messages = []
  currBacklog.save()
}

const createUserBackLog = async (id, message) => {
  const backlog = await Backlog.findOne({uid: id})

  if(backlog == null || backlog.length == 0)
  {
    const newBacklog = new Backlog({uid: id, messages: []})
    newBacklog.messages.push(message)
    newBacklog.save()
    console.log('added new receiverID into db')
    return
  }

  // console.log(backlog);
  backlog.messages.push(message)
  backlog.save()
  console.log('saved message')
}

/*
TODO
add a sender ID (Specify on connection)
i.e. handle case when receiver isn't signed in and is signed in
Send just messages from sourceID and clear just those messages
messages.filter((m) => m.senderId === senderId)
*/

// middleware
app.use(express.json())
io.on("connection", socket =>
{
  console.log("connected")
  console.log(socket.id, 'has joined')

  // receive from frontend client (socket.on() ...)
  // socket.on('/test', (msg) => console.log(msg))
  socket.on('signin', async (id) =>
  {
    console.log(`${id} has signed in to dm chat`)
    clients[id] = socket

    const messages = await getPending(id)
    console.log(`messages: ${messages}`)
    console.log(`data type of messages: ${typeof(messages)}`)
    clients[id].emit('message', messages)
    // for(var msg of messages){
    //   //clients[id].emit('message', [msg.message])
    //   console.log(msg)
    // }

    clearMessages(id)
  })

  // message from sender
  socket.on('message', (msg) =>
  {
    // format of every msg arg: {'message': message, 'sourceId': sourceId, 'targetId': targetId}

    let receiverId = msg.targetId

    if(!clients[receiverId])
    {
      createUserBackLog(receiverId, msg)
    }
    else
    {
      clients[id].emit('message', [msg])
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



