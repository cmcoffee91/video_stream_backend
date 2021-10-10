const express = require('express');
const { ExpressPeerServer } = require('peer');
const bodyParser = require('body-parser')
const cors = require('cors')
const app = express();
const server = require('http').Server(app);
const io = require('socket.io')(server, {
    debug: true,
    cors: {
        origin: "http://localhost:3000",
        methods: ["GET", "POST"]
    }
});

const port = 9000;



app.use(bodyParser.json());
app.use(cors());
app.use(bodyParser.urlencoded({
    extended: true
}));




//listen on specified port
 server.listen(port, () => {
    console.log(`listening on port ${port}`)

});

io.listen(4000);

const queue = []

io.on('connection', socket => {
    console.log("connected to socket.io", socket.id)
    socket.on('join-room', (roomId, userId) => {
        console.log(`join-room ${roomId}, ${userId}`)

        console.log(queue.length)

        socket.join(roomId)

        if(queue.length > 0){
            const nextClient = queue.shift()
            console.log("emit user connected")

            console.log(`next client id is ${nextClient}`)
            console.log(`this user id is ${userId}`)

            socket.to(roomId).emit('user-connected', userId)
            socket.to(roomId).emit('user-connected', nextClient)
        }
        else{
            queue.push(userId)
        }



        socket.on('disconnect', () => {
            console.log("socket disconnected")
            socket.to(roomId).emit('user-disconnected', userId)
        })
    })
})

const peerServer = ExpressPeerServer(server, {
    //remove path because path is inconsistent between client and server : https://github.com/peers/peerjs-server/issues/234
    // path: '/myapp'
});


app.use('/peerjs', peerServer);


peerServer.on('connection', (client) => {
   console.log(`client connected ${client.getId()} `)
    // client.send("hello from server")

});

peerServer.on('disconnect', (client) => {
    console.log(`client disconnected ${client.getId()} `)
});


