
const Utils = require('./Utils')

module.exports = class SocketModule {

    constructor(io, roomsMananager, messagesManager){
        this.io = io
        this.roomsMananager = roomsMananager
        this.messagesManager = messagesManager

        this.uid = 0

        this.io.on('connection', (socket) => {

            let session = socket.request.session
            console.log('Socket connection with ', session)

            socket.on('room_enter', (data) => {

                console.log(session, ' entered room ' + data.roomId)
                this.roomsMananager.onUserEnter(data.roomId, (providedData) =>{
                    socket.broadcast.emit('room_sm_enter')
                })

                this.roomsMananager.getUsersIn(data.roomId, (providedData) => {
                    socket.emit('greeting', {
                        users_in: providedData
                    })
                })

                socket.on('create_message', (data) => {
                    data.authorId = session.userSession.id
                    let created_at = new Date()

                    console.log(session, ' want to create message with ', data)

                    this.messagesManager.create(data.roomId, data.authorId, data.content, Utils.getSqlDate(created_at), () => {


                        let newMessage = {
                            author: session.userSession.username,
                            content: data.content,
                            created_at,
                            youreauthor: null
                        }

                        socket.emit('room_message_created')
                        socket.broadcast.emit('room_new_message', Object.assign(newMessage, {youreauthor: false}))
                        socket.emit('room_new_message', Object.assign(newMessage, {youreauthor: true}))
                    })
                })

                // User exit

                socket.on('disconnect', () => {
                    console.log(session, ' has disconneted')
    
                    this.roomsMananager.onUserLeave (data.roomId, (providedData) =>{
                        socket.broadcast.emit('room_sm_leave')
                    })
                    
                })
                
            })

            

        })

    }
}