const express = require('express')
var http = require('http')
const app = express()
const port = process.env.PORT || 5000
var server = http.createServer(app)
const io = require('socket.io')(server)
var clients = {}

// middleware
app.use(express.json())
io.on("connection", socket =>
{

  console.log("connected")
  console.log(socket.id, 'has joined')

  // receive from frontend client (socket.on() ...)
  socket.on('/test', (msg) => console.log(msg))
  socket.on('signin', (id) => {
    console.log(id)
    clients[id] = socket
  })
  socket.on('message', (msg) =>{
    console.log(msg)
    let targetId = msg.targetId

    // null check
    if (clients[targetId]) {clients[targetId].emit('message',msg)}

  })
})
server.listen(port, "0.0.0.0", () => {
  console.log("server started")
})



