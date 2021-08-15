const app = require('./app')
const http = require('http')
const config = require('./utils/config')
const logger = require('./utils/logger')
const server = http.createServer(app)
const io = require('socket.io')(server)
var mongoose = require('mongoose')

require('dotenv').config()
// imported backlog model
const Backlog = require('./models/backlog')
var signedInClients = {}

//#region mongoose init

// mongoose.connect(uri, { useNewUrlParser: true, useUnifiedTopology: true, useCreateIndex: true, useFindAndModify: false, }, (err) =>
// {
//   if (err) throw err
//   else
//   {
//     console.log('connected to db!')
//   }
// })
//#endregion

const getPending = async (id) =>
{
  const currBacklog = await Backlog.findOne({ uid: id })

  return currBacklog
}

// only clears the messages that have been filtered out
const clearMessages = async (id, leftOvers) =>
{
  const currBacklog = await Backlog.findOne({ uid: id })
  if (currBacklog == null) return
  currBacklog.messages = leftOvers
  currBacklog.save()
}

const createUserBackLog = async (id, message) =>
{
  const backlog = await Backlog.findOne({ uid: id })

  if (backlog == null || backlog.length == 0)
  {
    const newBacklog = new Backlog({ uid: id, messages: [] })
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
TODO DONE
add a sender ID (Specify on connection)
i.e. handle case when receiver isn't signed in and is signed in
Send just messages from sourceID and clear just those messages
messages.filter((m) => m.senderID === senderID)
*/
 
// middleware
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

    const getBackLog = getPending(activeUserId)
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
    if (!signedInClients[receiverId])
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
      signedInClients[receiverId].emit('message', [msg])
    }
  })

  socket.on('signedout', (id) =>
  {
    console.log(`${id} has signed out of dm chat`)
    delete signedInClients[id]
  })
})


//#region PORT listeners
// app.listen(config.PORT)


server.listen(config.PORT, () =>
{
  logger.info(`Server running on port ${config.PORT}`)
})
//#endregion





