
    
function MessageComponent(message){
    return (`<div class="msgWrapper p-3 ${message.youreauthor ? 'ml-auto text-light bg-primary' : 'mr-auto bg-light'} mb-3" style="max-width: 25rem">
    <div class="msgHeader d-flex border-bottom pb-2">
        <strong class="">${message.author}</strong>
        <small class="ml-auto">${getDateSince(message.created_at)}</small>
    </div>
    <div class="msgBody pt-2">${message.content}</div>
</div>`)
}

function getDateSince(date){
    
    if(!(date instanceof Date)){
        date = new Date(date)
    }

    let now = Date.now()
    let diff = ''
    let diffMin = Math.abs(now - date.getTime())
    diffMin = Math.floor(diffMin / (1000 * 60))

    if(diffMin <= 1){
        diff = 'just now'
    }
    else if(diffMin / 60 >= 1){
        let diffHour = Math.ceil(diffMin / 60)
        diff = diffHour + 'h ago'
    } else{
        diff = diffMin + 'min ago'
    }

    return diff
}

class RoomSocket {

    constructor(io){


        let users_in = document.getElementById('users_in')
        let create_message = document.getElementById('create_message')
        let message_contentEl = document.getElementById('message_content')
        let messages_wrapper = document.getElementById('messages_wrapper')
        let messages_wrapper_wrapper = document.getElementById('messages_wrapper_wrapper')

        messages_wrapper_wrapper.scrollTo(0, messages_wrapper_wrapper.scrollHeight) // Auto scroll down last message

        create_message.addEventListener('click', function(){
            let content = message_contentEl.value

            io.emit('create_message', {
                roomId: getRoomId(),
                authorId: null,
                content
            })
        })

        io.emit('room_enter', {
            roomId: getRoomId()
        })

        io.on('room_sm_enter', function(){
            console.log('sm entered')
            users_in.innerText = parseInt(users_in.innerText) + 1
        })

        io.on('room_sm_leave', function(){
            console.log('sm leaved')
            users_in.innerText = parseInt(users_in.innerText) - 1
        })

        io.on('greeting', function(data){
            users_in.innerText = data.users_in
        })
        
        io.on('room_message_created', function(){
            message_contentEl.value = ''
            console.log('you created messages')
        })

        io.on('room_new_message', function(message){
            messages_wrapper.innerHTML += MessageComponent(message)
            messages_wrapper_wrapper.scrollTo(0, messages_wrapper_wrapper.scrollHeight)
        })
    }
}

function getRoomId(){
    let url = window.location.href;
    let roomId = '';
    let urlLen = url.length;
    let i = urlLen - 1
    while(Number.isInteger(url.charAt(i))){
        console.log(url.charAt(i))
        i--
    }

    return url.substring(i, urlLen)
}

window.addEventListener('load', function(){
    let roomApp = new RoomSocket(io.connect('http://localhost:8080'))
})


