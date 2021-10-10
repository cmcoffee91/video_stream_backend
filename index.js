const express = require('express');
const { ExpressPeerServer } = require('peer');
const bodyParser = require('body-parser')
const cors = require('cors')

const app = express();

const port = 9000;



app.use(bodyParser.json());
app.use(cors());
app.use(bodyParser.urlencoded({
    extended: true
}));

//listen on specified port
const server = app.listen(port, () => {
    console.log(`listening on port ${port}`)

});


const peerServer = ExpressPeerServer(server, {
    // path: '/myapp'
});


app.use('/peerjs', peerServer);

const queue = []

peerServer.on('connection', (client) => {
   console.log(`client connected ${client.getId()} `)
    client.send("hello from server")
    if(queue.length > 0){
        const nextClient = queue.shift()
    }
    else{
        queue.push(client)
    }
    client.send("hello")
});

peerServer.on('disconnect', (client) => {
    console.log(`client disconnected ${client.getId()} `)
});
