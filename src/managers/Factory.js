
module.exports = class Factory{

    constructor(){
        this.mysql = require('mysql')

        this.connection = this.mysql.createConnection({
            host        : 'localhost',
            user        : 'root',
            password    : '',
            database    : 'myddb'
        })

        this.connection.connect(function(err){
            if(err) {
                console.log('Error in Factory')
                throw err;
            }
        })


    }
}