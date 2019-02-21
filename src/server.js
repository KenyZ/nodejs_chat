
console.log('==== SERVER HAS STARTED ==== ', new Date())

// Imports

const express = require('express')
const app = express()
const bodyParser = require('body-parser')
const session = require('cookie-session')

const server = require('http').Server(app)
const io = require('socket.io')(server)

// Modules
// Managers
const factory = new (require('./managers/Factory'))()
const RoomsManager = new (require('./managers/RoomsManager'))(factory)
const UsersManager = new (require('./managers/UsersManager'))(factory)
const MessagesManager = new (require('./managers/MessagesManager'))(factory)

// lié
const SocketModule = new (require('./SocketModule'))(
    io,
    RoomsManager,
    MessagesManager
)

// Settings
app.set('views', './templates')
app.set('view engine', 'ejs')


// Middleware
let sessionMiddleware = session({secret: 'appmessenger'})

let urlencodedParser = bodyParser.urlencoded({extended: false})
app.use(bodyParser.json())

app.use(express.static('public'))

app.use(sessionMiddleware)

let hasSession = (req, res, next) => {

    console.log('User want access ' + req.originalUrl)
    
    if(req.session.userSession){
        console.log('With session ', req.session.userSession)
        next()
    } else {
        console.log('But without session')
        res.redirect('/loggin')
    }
}

io.use(function(socket, next){
    sessionMiddleware(socket.request, socket.request.res, next)
})

// Utils

function getDateSince(date){

    let now = Date.now()
    let diff = ''
    let diffMin = Math.abs(now - date.getTime())
    diffMin = Math.ceil(diffMin / (1000 * 60))

    if(diffMin <= 1){
        diff = 'just now'
    }
    else if(diffMin > 60){
        let diffHour = Math.floor(diffMin / 60)
        diff = diffHour + 'h ago'
    } else{
        diff = diffMin + 'min ago'
    }

    return diff
}

// Core

server.listen(8080)

app.get('/', hasSession, (req, res) => {

    RoomsManager.getAll((rooms) => {
        
        res.render('layout.ejs', {
            body_content: 'components/home',
            userSession: req.session.userSession,
            rooms,
            getDateSince
        })
    })
})

app.get('/signout', (req, res) => {

    console.log('Signout with session => ', req.session.userSession)

    req.session.userSession = null
    res.redirect('/')
})
app.route('/loggin') 

    .get((req, res) => {

        res.render('layout.ejs', {
            body_content: 'components/loggin'
        })
    })

    .post(urlencodedParser, (req, res) => {

        console.log('want to log in with ', req.body)
        
        UsersManager.logUser(req.body.username, req.body.password, (logged) => {

            console.log('log query results => ', logged)

            if(logged.length > 0){
                console.log('has been logged')
                req.session.userSession = logged[0]
                res.redirect('/')
            } else {
                let err_msg = 'Username or password is incorrect.'

                res.render('layout.ejs', {
                    body_content: 'components/loggin',
                    err_msg
                })
            }


        })

    })

app.route('/register')

    .get((req, res) => {

        let err_msg = null

        res.render('layout.ejs', {
            body_content: 'components/register',
        })



    })

    .post(urlencodedParser, (req, res) => {

        console.log('want to register with ', req.body)
        
        UsersManager.create(req.body, (data) => {

            if(data.errors){
                res.render('layout.ejs', {
                    body_content: 'components/register',
                    errors: data.errors
                })

            } else {
                console.log('has been registered')
                req.session.userSession = data.userSession
                res.redirect('/')
            }
     

        })
   
    })

app.get('/room/:id', hasSession, (req, res, next) => {

    let id = req.params.id

    console.log(req.session.userSession, 'want to access room ' + id)
    
    if(!isNaN(Number(id))){

        console.log('will fetch room ' + id)
        RoomsManager.getById(id, (room) => {

            MessagesManager.getAllFrom(id, (messages) => {

                messages.map((message) => {
                    message.youreauthor = message.author == req.session.userSession.id ? true : false
                })

                res.render('layout.ejs', {
                    body_content: 'components/room',
                    room,
                    messages,
                    getDateSince
                }) 
            })
        })
    } else {
        next()
    }

})