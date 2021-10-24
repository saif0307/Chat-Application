const express = require('express')
const path = require('path')
const http = require('http')
const socketio = require('socket.io')
const Filter = require('bad-words')
const {addUser, removeUser, getUser, getUsersInRoom} = require('./utils/users')
const {generateNewMessage, generateLocationMessage} = require('./utils/messages')


const app = express()
const server = http.createServer(app)
const io = socketio(server)
const publicDirectoryPath = path.join(__dirname, '../public')
const static = express.static(publicDirectoryPath)
app.use(static)
// app.get('/', (req, res) => {
//     res
// })

io.on('connection', (socket) => {
    console.log('Connected')

    socket.on('join', (options, callback) => {
        const {error, user} = addUser({id: socket.id, ...options})
        if(error) {
           return callback(error)
        }
        socket.join(user.room)
        socket.emit('message', generateNewMessage('Admin', `Welcome ${user.username}`))
        socket.broadcast.to(user.room).emit('message', generateNewMessage('Admin' ,`${user.username} has Joined!`))
        io.to(user.room).emit('roomData',  {
            room:user.room,
            users: getUsersInRoom(user.room)
        })
    })

    socket.on('message', (message, callback) => {
        const user = getUser(socket.id)
        if(user) {
            const filter = new Filter()
        if(filter.isProfane(message) || message.trim() === '') {
            return callback('Your message maybe emty or contains restricted words')
        }
        io.to(user.room).emit('message', generateNewMessage(user.username, message))
        return callback('DELEIVERED')
        }
    })

    socket.on('location', (location, callback) => {
        const user = getUser(socket.id)
        if(user) {
            io.to(user.room).emit('messagelocation', generateLocationMessage(user.username, `https://google.com/maps?q=${location.latitude},${location.longitude}`))
            callback('Location sent!')
        }
    })

    socket.on('disconnect', () => {
        const user = removeUser(socket.id)
        if(user) {
            io.to(user.room).emit('message', generateNewMessage('Admin', `${user.username} has left!`))
            io.to(user.room).emit('roomData',  {
                room:user.room,
                users: getUsersInRoom(user.room)
            })
        }  
    })
})


const port = process.env.PORT || 3000
server.listen(port, () => {
    console.log(`Server is up on port ${port}`)
} )