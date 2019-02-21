
module.exports = class MessagesManager {

    constructor(factory){
        this.connection = factory.connection
        this.mysql = factory.mysql

    }

    getAllFrom(roomId, callback){

        let sql = 'SELECT m.content, m.created_at, m.author, u.username FROM messenger_messages m INNER JOIN messenger_users u ON m.author = u.id WHERE roomId = ?'
        sql = this.mysql.format(sql, [roomId])

        this.connection.query(sql, (err, data) => {

            if(err) throw err;
            console.log('has fetched messages from room' + roomId + ' length = ' + data.length)
            callback(data)
        })
    
    }

    getLastFrom(roomId, callback){

        let sql = 'SELECT created_at FROM messenger_messages WHERE room_id = ? ORDER BY create_at DESC LIMIT 1'
        sql = this.mysql.format(sql, [roomId])

        this.connection.query(sql, (err, data) => {

            if(err) throw err;
            console.log('has fetched last message from room' + roomId)
            callback(data[0])
        })

    }

    create(roomId, authorId, messageContent, created_at, callback){

        let sql = 'INSERT INTO messenger_messages (id, roomId, author, content, created_at) VALUES(null, ?, ?, ?, ?)'
        sql = this.mysql.format(sql, [roomId, authorId, messageContent, created_at])   
        
        this.connection.query(sql, (err, data) => {
            if(err) throw err;
            console.log('has created new message', {roomId, authorId, messageContent, created_at})
            callback()
        })
    }
}