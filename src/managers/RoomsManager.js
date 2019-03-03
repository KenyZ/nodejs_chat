
module.exports = class RoomsManager{

    constructor(factory){
        this.connection = factory.connection
        this.mysql = factory.mysql

    }

    getAll(callback){

        this.connection.query('SELECT r.name, r.users_in, r.id, r.name, Max(m.created_at) as last_message FROM messenger_chat r INNER JOIN messenger_messages m ON m.roomId = r.id GROUP BY r.id, r.name', (err, data) => { 
            if(err) throw err;
            console.log('has fetched all rooms length = ' + data.length)
            callback(data)
        })
    }

    getById(id, callback){

        let sql = 'SELECT * FROM messenger_chat WHERE id = ?'
        sql = this.mysql.format(sql, [id])

        this.connection.query(sql, (err, data) => { 
            if(err) throw err;

            callback(data[0])
        })
    }

    getUsersIn(roomId, callback){
        
        let sql = 'SELECT users_in FROM messenger_chat WHERE id = ? LIMIT 1'
        sql = this.mysql.format(sql, [roomId])

        this.connection.query(sql, (err, data) => {

            if(err) throw err;
            console.log('fetched users in room' + roomId + ' length = ' + data.length)
            callback(data[0].users_in)
        })
    }

    onUserEnter(roomId, callback){
        let sql = 'UPDATE messenger_chat SET users_in = users_in+1 WHERE id = ? LIMIT 1'
        sql = this.mysql.format(sql, [roomId])

        this.connection.query(sql, (err, data) => {

            if(err) throw err;
            console.log('has increment users in room ' + roomId)
            callback()
        })
    }

    onUserLeave(roomId, callback){
        let sql = 'UPDATE messenger_chat SET users_in = users_in-1 WHERE id = ? LIMIT 1'
        sql = this.mysql.format(sql, [roomId])

        this.connection.query(sql, (err, data) => {

            if(err) throw err;
            console.log('has decrement users in room ' + roomId)
            callback()
        })
    }
    

}