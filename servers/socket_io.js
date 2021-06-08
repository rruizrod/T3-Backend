const express = require('express')
const app = express()
var server = require('http').createServer(app)
const port = process.env.PORT || 5000
const io = require('socket.io')(server)
var mongoose = require('mongoose')
require('dotenv').config()
var signedInClients = {}

const cors = require('cors')
const middleware = require('../utils/middleware')
const logger = require('../utils/logger')

app.use(cors())
app.use(express.json())
app.use(middleware.requestLogger)

//#region mongoose init
const uri = process.env.MONGODB_URI; 

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


app.get('/', (req, res) => {
	res.send( "<h1>It's Working</h1>");
});

app.use(middleware.unknownEndpoint)
app.use(middleware.errorHandler)

// var chatSchema = new mongoose.Schema({
//   messages: Array,
//   userId: String,
// })

// var chat = mongoose.model('Message', chatSchema)
//#endregion

const getPending = async (id) => {
  const currBacklog = await Backlog.findOne({uid: id})

  return currBacklog
}

// todo only clear the messages that have been filtered out DONE
const clearMessages = async (id, leftOvers) => {
  const currBacklog = await Backlog.findOne({uid: id})
  if (currBacklog == null) return
  currBacklog.messages = leftOvers
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

  // console.log(backlog)
  // IMPORTANT: it is imperative that the key fields you want the db to recognize and store to match those of the back log schema
  backlog.messages.push(message)
  backlog.save()
  console.log('saved new message')
}

/*
TODO
add a sender ID (Specify on connection)
i.e. handle case when receiver isn't signed in and is signed in
Send just messages from sourceID and clear just those messages
messages.filter((m) => m.senderID === senderID)
*/

// middleware
app.use(express.json())
io.on("connection", socket =>
{
  console.log("connected")
  console.log(socket.id, 'has joined')

  // receive from frontend client (socket.on() ...)

  // todo add otherUser id as a param as well DONE
  socket.on('signin', async (activeUserId, otherUserId) =>
  {
    console.log(`${activeUserId} has signed in to dm chat with ${otherUserId}`)
    signedInClients[activeUserId] = socket

    const getBackLog = await getPending(activeUserId)
    console.log(`backlog data: ${getBackLog}`);
    var messages = getBackLog ? getBackLog.messages : {}
    messages = Object.values(messages);
    // console.log(`data type of messages: ${typeof(messages)}`)
    console.log(`messages: ${messages}`);

    // todo filter messages variable based on otherUser id
    const lstToSendToFrontEnd = messages.filter((m) => m.senderID === otherUserId)
    console.log(`messages to send to front end: ${lstToSendToFrontEnd}`)

    socket.emit('message', lstToSendToFrontEnd)

    const leftOvers = messages.filter((m) => !lstToSendToFrontEnd.includes(m))
    console.log(`what's not being sent to frontend: ${leftOvers}`)

    clearMessages(activeUserId, leftOvers)
  })

  // message from sender
  socket.on('message', (msg) =>
  {
    // format of every msg arg: {'message': message, 'senderID': senderID, 'targetId': targetId}

    let receiverId = msg.targetId

    //#region msg debugger
    // Object.keys(msg).forEach(key => {
    //   console.log(key, msg[key]);
    // })
    //#endregion

    // if they're in the clients obj, then they're
    // signed in. Otherwise, they're not
    if(!signedInClients[receiverId])
    {
      //#region IMPORTANT NOTE

      /**
       * msg object key names must match those of the backlog shown below inorder to be recognized and stored in the database
       * messages: [
          {
            id: Number,
            message: String,
            senderID: String,
            timeStamp: String
          }
        ]
       */

      //#endregion
      createUserBackLog(receiverId, msg)
    }
    else
    {
      signedInClients[receiverId].emit('message', [msg]);
    }
  })

  socket.on('signedout', (id) =>
  {
    console.log(`${id} has signed out of dm chat`)
    delete signedInClients[id]
    // console.log(clients);
  })
})

server.listen(port, () =>
{
  console.log(`server started on port ${port}`)
})



