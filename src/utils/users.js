const users = []

const addUser = ({id, username, room}) => {
    // DATA SANITIZATION    
    username = username.trim().toLowerCase()
    room = room.trim().toLowerCase()

    // DATA VALIDATION
    if(!users || !room) {
        return {
            error:'Username and room is required!'
        }
    }

    //check for existing users

    const existingUser = users.find((user) => {
        return user.username === username && user.room === room
    })

    // User Validation

    if(existingUser) {
        return {
            error: 'user already exists'
        }
    }

    const user = {id, username, room}
    users.push(user)
    return {user}
}

const removeUser = (id) => {
    const index = users.findIndex((user) => id === user.id)
    if(index !== -1) {
        const user = users.splice(index, 1)[0]
        return user
    }
   
}

const getUser = (id) => {
    const user = users.find((user) => id === user.id)
    return user
}

const getUsersInRoom  = (roomName) => {
    const usersInRoom = users.filter((user) => roomName.trim().toLowerCase() === user.room)

    return usersInRoom
}


module.exports = {
    getUser,
    removeUser,
    addUser,
    getUsersInRoom
}