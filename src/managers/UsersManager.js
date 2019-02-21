
module.exports = class UsersManager{

    constructor(factory){
        this.connection = factory.connection
        this.mysql = factory.mysql
    
    }

    find({username}, callback){
        let sql = 'SELECT * FROM messenger_users WHERE username = ?'
        sql = this.mysql.format(sql, [username])
        
        this.connection.query(sql, (err, data) => {
            if(err) throw err;

            console.log('has tryed to find ' + username + ' with result = ' + data.length)
            callback(data.length > 0 ? data[0] : null)
        })
    }
    
    logUser(username, password, callback){

        let sql = 'SELECT id, username FROM messenger_users WHERE username = ? AND password = ?'
        sql = this.mysql.format(sql, [username, password])

        this.connection.query(sql, (err, data) => {
            if(err) throw err;
            callback(data)
        })
    }

    create({username, password, password2}, callback){

        let sql = 'INSERT INTO messenger_users (id,username,password) VALUES(null, ?, ?)'
        sql = this.mysql.format(sql, [username, password])
    
        function verif(username, password, password2, _callback){
    
            let errors = []
            
            this.find({username}, (data) => {
                
                if(data){
                    errors.push('Username already exists.')
                } else {
                }
    
                if(password != password2){
                    errors.push('Passwords are different.')
                }
    
                _callback(errors)
            })
        }
    
        verif.call(this, username, password, password2, (results) => {
            
            if(results.length == 0)
            {
                this.connection.query(sql, (err, data, field) => {
                    if(err) throw err;
                    console.log('has created new user ', {username, password, id: data.insertId})
                    callback({userSession:{errors: [], username, password, id: data.insertId}})
                })
            } else {
                callback({errors: results})
            }
    
        })
    }
}
